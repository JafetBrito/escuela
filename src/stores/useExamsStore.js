import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Baraja un array (Fisher-Yates) sin mutar el original — usado para elegir
// una muestra al azar del banco de preguntas en cada intento.
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Aplica la traducción de `lang` sobre el examen base (español) — mismo
// criterio de "cae a español si falta" que el resto del sistema i18n (ver
// src/i18n/index.js). Reemplaza el banco completo, no mergea pregunta por
// pregunta: una traducción nueva reescribe title+questions enteros.
export function localizeExam(exam, lang) {
  if (!exam) return exam
  const override = exam.translations?.[lang]
  if (!override) return exam
  return { ...exam, title: override.title ?? exam.title, questions: override.questions ?? exam.questions }
}

// Esqueleto del examen final por curso: un banco de preguntas de opción
// múltiple (el admin escribe el banco completo, ver AdminExamsPage.jsx), del
// que se sortean `questions_to_show` en cada intento (ver startAttempt). Un
// alumno se gradúa de un curso cuando: (1) todas sus tareas enlazadas a ese
// curso (student_tasks.details.linkedLesson.courseId) están 'revisada', y
// (2) aprueba el examen — ver fetchEligibility y submitAttempt.
export const useExamsStore = create((set, get) => ({
  exam: null,
  eligibility: null, // { eligible, total, done }
  attempts: [],
  graduation: null,
  loading: false,

  fetchExam: async (courseId) => {
    const { data } = await supabase.from('course_exams').select('*').eq('course_id', courseId).maybeSingle()
    set({ exam: data ?? null })
    return data ?? null
  },

  // Usado por AdminExamsPage — crea o actualiza el examen de un curso.
  // lang='es' escribe el banco base (title/questions); cualquier otro
  // idioma se guarda como override dentro de `translations`, sin tocar
  // pass_score/questions_to_show (son propiedades del examen, no del
  // idioma) — requiere que el examen base ya exista.
  saveExam: async (courseId, { lang = 'es', title, pass_score, questions_to_show, time_limit_minutes, questions, createdBy }) => {
    if (lang === 'es') {
      const { data, error } = await supabase
        .from('course_exams')
        .upsert({ course_id: courseId, title, pass_score, questions_to_show, time_limit_minutes, questions, created_by: createdBy, updated_at: new Date().toISOString() }, { onConflict: 'course_id' })
        .select()
        .single()
      if (!error) set({ exam: data })
      return { data, error }
    }

    const current = get().exam
    if (!current) return { data: null, error: new Error('Guarda primero el examen en español.') }
    const translations = { ...(current.translations ?? {}), [lang]: { title, questions } }
    const { data, error } = await supabase
      .from('course_exams')
      .update({ translations, updated_at: new Date().toISOString() })
      .eq('course_id', courseId)
      .select()
      .single()
    if (!error) set({ exam: data })
    return { data, error }
  },

  // Todas las tareas que el admin enlazó a este curso (vía "🎓 Clase del
  // curso" al crear la tarea) deben estar calificadas — si no hay ninguna
  // tarea enlazada, no hay requisito de tareas (solo el examen).
  fetchEligibility: async (courseId, studentId) => {
    const { data } = await supabase
      .from('student_tasks')
      .select('id, status, title')
      .eq('student_id', studentId)
      .contains('details', { linkedLesson: { courseId } })
    const tasks = data ?? []
    const done = tasks.filter((t) => t.status === 'revisada').length
    const eligibility = { eligible: done === tasks.length, total: tasks.length, done, pending: tasks.filter((t) => t.status !== 'revisada') }
    set({ eligibility })
    return eligibility
  },

  fetchAttempts: async (courseId, studentId) => {
    const { data } = await supabase
      .from('student_exam_attempts')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    set({ attempts: data ?? [] })
    return data ?? []
  },

  fetchGraduation: async (courseId, studentId) => {
    const { data } = await supabase
      .from('student_graduations')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .maybeSingle()
    set({ graduation: data ?? null })
    return data ?? null
  },

  // Elige al azar `questions_to_show` preguntas del banco (con sus opciones
  // en orden original — no se barajan las opciones, solo qué preguntas
  // salen) — el resultado se guarda tal cual en el intento para calificar
  // consistente aunque el admin edite el banco después.
  startAttempt: (exam) => {
    const pool = shuffle(exam.questions ?? [])
    return pool.slice(0, exam.questions_to_show || 15)
  },

  // Califica en el cliente (las respuestas correctas viajan dentro de
  // `shownQuestions`, que el propio cliente generó) — suficiente para un
  // primer examen no proctorizado; si en el futuro se necesita blindar
  // contra trampas, la calificación tendría que moverse a una función de
  // servidor que no le revele las respuestas correctas al cliente.
  submitAttempt: async ({ examId, studentId, courseId, shownQuestions, answers, passScore }) => {
    const correctCount = shownQuestions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0)
    const score = shownQuestions.length ? Math.round((correctCount / shownQuestions.length) * 100) : 0
    const passed = score >= passScore

    const { data, error } = await supabase
      .from('student_exam_attempts')
      .insert({ exam_id: examId, student_id: studentId, course_id: courseId, shown_questions: shownQuestions, answers, score, passed })
      .select()
      .single()
    if (!error) {
      set((s) => ({ attempts: [data, ...s.attempts] }))
      if (passed) await get().maybeCertify(courseId, studentId)
    }
    return { data, error, score, passed }
  },

  // El examen se puede presentar en cualquier momento — el requisito de
  // tareas calificadas (fetchEligibility) solo aplica para la CERTIFICACIÓN
  // final (student_graduations), no para poder intentar el examen. Se llama
  // tras aprobar un intento, y también al cargar ExamPage por si el profesor
  // calificó las tareas pendientes después de que ya se había aprobado.
  maybeCertify: async (courseId, studentId) => {
    const { attempts, eligibility, graduation } = get()
    if (graduation) return graduation
    const hasPassed = attempts.some((a) => a.passed)
    if (!hasPassed || !eligibility?.eligible) return null
    const { data: grad } = await supabase
      .from('student_graduations')
      .upsert({ student_id: studentId, course_id: courseId }, { onConflict: 'student_id,course_id' })
      .select()
      .single()
    set({ graduation: grad ?? null })
    return grad ?? null
  },
}))
