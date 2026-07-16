import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Mis Clases: el video real ocurre en Google Meet (externo, en la
// computadora) — este store solo sincroniza el "Hub" (agenda, tema actual,
// recursos, preguntas) vía Supabase Realtime, para que el segundo
// dispositivo del alumno (típicamente el teléfono) se actualice al instante
// sin recargar. Un único canal por clase, suscrito con postgres_changes
// sobre las filas ya persistidas — así un alumno que entra tarde ve el
// estado actual, no solo los cambios futuros.
// El link de videollamada se desbloquea 15 min antes de la hora programada,
// sin que el admin tenga que darle "Iniciar" a tiempo — "Iniciar clase" solo
// controla la notificación y el badge "en vivo".
const JOIN_WINDOW_MS = 15 * 60 * 1000
export function canJoinClass(cls) {
  if (!cls) return false
  // Clases de práctica (demo_video_id) no se programan — siempre están
  // disponibles, sin horario ni ventana de 15 min.
  if (cls.demo_video_id) return true
  if (cls.status === 'finalizada') return false
  if (cls.status === 'en_vivo') return true
  return new Date(cls.scheduled_at) - new Date() <= JOIN_WINDOW_MS
}

// Genera un room de Jitsi Meet (open source, sin necesidad de pegar un link
// manual) — un slug aleatorio por clase, en la instancia pública meet.jit.si.
export function makeJitsiUrl(title) {
  const slug = (title || 'clase').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40)
  return `https://meet.jit.si/OliverAcademy-${slug}-${crypto.randomUUID().slice(0, 6)}`
}

export const useLiveClassStore = create((set, get) => ({
  classes: [],
  loading: false,
  activeClass: null,
  questions: [],
  students: [],
  _channel: null,

  fetchClasses: async () => {
    set({ loading: true })
    const { data } = await supabase
      .from('live_classes')
      .select('*')
      .order('scheduled_at', { ascending: true })
    set({ classes: data ?? [], loading: false })
  },

  fetchStudents: async () => {
    const { data } = await supabase.from('profiles').select('id, email, display_name').eq('role', 'student').order('display_name')
    set({ students: data ?? [] })
  },

  // Se suscribe a UNA clase (la que el alumno/admin tiene abierta) — trae el
  // estado actual y sus preguntas, y escucha cambios en tiempo real.
  openClass: async (classId) => {
    get().closeClass()

    const [{ data: cls }, { data: qs }] = await Promise.all([
      supabase.from('live_classes').select('*').eq('id', classId).single(),
      supabase.from('live_class_questions').select('*').eq('live_class_id', classId).order('created_at', { ascending: true }),
    ])
    set({ activeClass: cls ?? null, questions: qs ?? [] })

    const channel = supabase.channel(`live_class:${classId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_classes', filter: `id=eq.${classId}` },
        (payload) => set({ activeClass: payload.new }))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_class_questions', filter: `live_class_id=eq.${classId}` },
        (payload) => set((s) => ({ questions: [...s.questions, payload.new] })))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_class_questions', filter: `live_class_id=eq.${classId}` },
        (payload) => set((s) => ({ questions: s.questions.map((q) => q.id === payload.new.id ? payload.new : q) })))
      .subscribe()

    set({ _channel: channel })
  },

  closeClass: () => {
    const ch = get()._channel
    if (ch) supabase.removeChannel(ch)
    set({ activeClass: null, questions: [], _channel: null })
  },

  askQuestion: async (classId, studentId, question) => {
    if (!question.trim()) return
    await supabase.from('live_class_questions').insert({ live_class_id: classId, student_id: studentId, question: question.trim() })
  },

  // ── Admin ─────────────────────────────────────────────────────────────
  createClass: async (payload) => {
    const { data, error } = await supabase.from('live_classes').insert(payload).select().single()
    if (!error) set((s) => ({ classes: [...s.classes, data].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)) }))
    return { data, error }
  },

  updateClass: async (classId, patch) => {
    const { error } = await supabase.from('live_classes').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', classId)
    if (!error) {
      set((s) => ({ classes: s.classes.map((c) => c.id === classId ? { ...c, ...patch } : c) }))
    }
    return { error }
  },

  // Marca la clase como en vivo y notifica a todos los alumnos — reutiliza
  // el mismo sistema de notificaciones de las tareas (campanita del header).
  startClass: async (classId) => {
    const { error } = await get().updateClass(classId, { status: 'en_vivo' })
    if (error) return { error }
    const cls = get().classes.find((c) => c.id === classId)
    let targets = []
    if (cls?.student_id) {
      targets = [{ id: cls.student_id }]
    } else {
      const { data } = await supabase.from('profiles').select('id').eq('role', 'student')
      targets = data ?? []
    }
    if (targets.length) {
      await supabase.from('student_notifications').insert(
        targets.map((s) => ({ student_id: s.id, title: '¡Tu clase está en vivo!', body: cls?.title ?? 'Entra a Mis Clases' }))
      )
    }
    return { error: null }
  },

  endClass: async (classId) => get().updateClass(classId, { status: 'finalizada' }),

  deleteClass: async (classId) => {
    const { error } = await supabase.from('live_classes').delete().eq('id', classId)
    if (!error) set((s) => ({ classes: s.classes.filter((c) => c.id !== classId) }))
    return { error }
  },

  answerQuestion: async (questionId, answer) => {
    await supabase.from('live_class_questions').update({ answer, answered: true }).eq('id', questionId)
  },

  // Sube un PDF/archivo al bucket público 'class-resources' y lo agrega a la
  // lista de recursos de la clase — mismo shape que un recurso tipo link.
  uploadResource: async (classId, file, label) => {
    const path = `${classId}/${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from('class-resources').upload(path, file)
    if (upErr) return { error: upErr }
    const { data: pub } = supabase.storage.from('class-resources').getPublicUrl(path)
    const cls = get().activeClass ?? get().classes.find((c) => c.id === classId)
    const resources = [...(cls?.resources ?? []), { label: label || file.name, url: pub.publicUrl, type: 'pdf' }]
    return get().updateClass(classId, { resources })
  },

  addMission: async (classId, mission) => {
    const cls = get().activeClass ?? get().classes.find((c) => c.id === classId)
    const missions = [...(cls?.missions ?? []), mission]
    return get().updateClass(classId, { missions })
  },

  removeMission: async (classId, index) => {
    const cls = get().activeClass ?? get().classes.find((c) => c.id === classId)
    const missions = (cls?.missions ?? []).filter((_, i) => i !== index)
    return get().updateClass(classId, { missions })
  },
}))
