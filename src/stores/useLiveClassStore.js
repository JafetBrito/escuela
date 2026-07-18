import { create } from 'zustand'
import { supabase } from '../services/supabase/client'
import { useAuthStore } from './useAuthStore'
import { useNotificationsStore } from './useNotificationsStore'
import { playNotificationSound } from '../utils/sound'
import { speak } from '../utils/tts'

// Anuncia (sonido + voz) un evento del Hub a quien lo está viendo en vivo —
// se omite para quien lo acaba de generar (ya tiene su propia confirmación
// visual, no necesita escucharse a sí mismo).
function announce(text) {
  playNotificationSound()
  speak(text)
}

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

// Código corto de sincronización: se deriva del id de la clase (sin guardar
// nada nuevo) — el alumno lo teclea en el segundo dispositivo para saltar
// directo al Hub de esa clase, en vez de tocar un link.
export function classShortCode(classId) {
  return classId.replace(/-/g, '').slice(0, 6).toUpperCase()
}

export function findClassByCode(classes, code) {
  const norm = (code || '').trim().toUpperCase()
  if (!norm) return null
  return classes.find((c) => classShortCode(c.id) === norm) ?? null
}

export const useLiveClassStore = create((set, get) => ({
  classes: [],
  loading: false,
  activeClass: null,
  questions: [],
  pings: [],
  chatMessages: [],
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

    const [{ data: cls }, { data: qs }, { data: pgs }, { data: msgs }] = await Promise.all([
      supabase.from('live_classes').select('*').eq('id', classId).single(),
      supabase.from('live_class_questions').select('*').eq('live_class_id', classId).order('created_at', { ascending: true }),
      supabase.from('live_class_pings').select('*').eq('live_class_id', classId).order('created_at', { ascending: false }).limit(20),
      supabase.from('live_class_chat').select('*').eq('live_class_id', classId).order('created_at', { ascending: true }),
    ])
    set({ activeClass: cls ?? null, questions: qs ?? [], pings: pgs ?? [], chatMessages: msgs ?? [] })

    // El alumno (no el admin) avisa que entró — el admin lo escucha en
    // "Actividad en vivo" mientras da la clase, sin tener que estar mirando.
    const session = useAuthStore.getState().session
    if (session && !useAuthStore.getState().isAdmin?.()) {
      supabase.from('live_class_pings').insert({ live_class_id: classId, student_id: session.user.id, kind: 'entro' })
    }

    const channel = supabase.channel(`live_class:${classId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_classes', filter: `id=eq.${classId}` },
        (payload) => set({ activeClass: payload.new }))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_class_questions', filter: `live_class_id=eq.${classId}` },
        (payload) => {
          set((s) => ({ questions: [...s.questions, payload.new] }))
          // Quien preguntó ya ve su propia pregunta en pantalla — solo se
          // anuncia a quien la recibe (el admin), con quién y qué preguntó.
          if (payload.new.student_id !== useAuthStore.getState().session?.user?.id) {
            const name = get().activeClass?.student_name || 'Un alumno'
            announce(`${name} preguntó: ${payload.new.question}`)
          }
        })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_class_questions', filter: `live_class_id=eq.${classId}` },
        (payload) => {
          set((s) => ({ questions: s.questions.map((q) => q.id === payload.new.id ? payload.new : q) }))
          if (payload.new.answered && payload.new.student_id === useAuthStore.getState().session?.user?.id) {
            announce('Tu pregunta fue respondida')
          }
        })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_class_pings', filter: `live_class_id=eq.${classId}` },
        (payload) => {
          set((s) => ({ pings: [payload.new, ...s.pings].slice(0, 20) }))
          const p = payload.new
          const isAdmin = useAuthStore.getState().isAdmin?.()
          const myId = useAuthStore.getState().session?.user?.id
          const name = get().activeClass?.student_name || 'Un alumno'
          if (p.kind === 'atencion') {
            // Lo manda el admin — solo se anuncia al alumno que lo recibe.
            if (!isAdmin) announce('Tu profesor te está llamando')
          } else if (p.kind === 'entro') {
            // El alumno acaba de entrar — solo le sirve saberlo al admin.
            if (isAdmin) announce(`${name} entró a la clase`)
          } else if (p.student_id !== myId) {
            // "mano"/"ping" del alumno — se anuncia a quien lo ve (el admin).
            announce(p.kind === 'mano' ? `${name} levantó la mano` : `Nuevo ping de ${name}`)
          }
        })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_class_chat', filter: `live_class_id=eq.${classId}` },
        (payload) => set((s) => ({ chatMessages: [...s.chatMessages, payload.new] })))
      .subscribe()

    set({ _channel: channel })
  },

  closeClass: () => {
    const ch = get()._channel
    if (ch) supabase.removeChannel(ch)
    set({ activeClass: null, questions: [], pings: [], chatMessages: [], _channel: null })
  },

  sendClassChatMessage: async (classId, userId, displayName, message) => {
    if (!message.trim()) return { error: null }
    const { error } = await supabase.from('live_class_chat').insert({
      live_class_id: classId, user_id: userId, display_name: displayName, message: message.trim(),
    })
    return { error }
  },

  askQuestion: async (classId, studentId, question) => {
    if (!question.trim()) return { error: null }
    const { error } = await supabase.from('live_class_questions').insert({ live_class_id: classId, student_id: studentId, question: question.trim() })
    return { error }
  },

  // Botón de "levantar la mano" / ping — sin texto, solo una señal rápida
  // que el admin ve aparecer en vivo en su panel mientras da la clase.
  sendPing: async (classId, studentId, kind = 'mano') => {
    const { error } = await supabase.from('live_class_pings').insert({ live_class_id: classId, student_id: studentId, kind })
    return { error }
  },

  // ── Admin ─────────────────────────────────────────────────────────────
  // Resuelve el nombre del alumno una sola vez al crear (denormalizado en la
  // fila) para que los anuncios de voz no tengan que consultar profiles en
  // cada evento de Realtime — y notifica de inmediato (no hasta "Iniciar
  // clase") a quien corresponda: un alumno específico, o todos si es general.
  createClass: async (payload) => {
    let studentName = null
    if (payload.student_id) {
      const { data: prof } = await supabase.from('profiles').select('display_name').eq('id', payload.student_id).single()
      studentName = prof?.display_name ?? null
    }
    const { data, error } = await supabase.from('live_classes').insert({ ...payload, student_name: studentName }).select().single()
    if (!error) {
      set((s) => ({ classes: [...s.classes, data].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)) }))
      useNotificationsStore.getState().notifyClassAssigned(data)
    }
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
        targets.map((s) => ({ student_id: s.id, class_id: classId, title: '¡Tu clase está en vivo!', body: cls?.title ?? 'Entra a Mis Clases' }))
      )
    }
    return { error: null }
  },

  // El chat es de la sesión en vivo, no un historial permanente ("aviones
  // que vienen y van") — se borra al finalizar. El alumno puede descargar un
  // resumen en PDF (agenda/recursos/preguntas/chat) antes de que eso pase,
  // ver ClassSummaryPage.jsx.
  endClass: async (classId) => {
    const cls = get().activeClass ?? get().classes.find((c) => c.id === classId)
    const result = await get().updateClass(classId, { status: 'finalizada' })
    if (!result.error && cls && (cls.xp_reward > 0 || cls.gold_reward > 0)) {
      let targets = []
      if (cls.student_id) {
        targets = [cls.student_id]
      } else {
        // Clase "para todos" — la recompensa solo va a quien de verdad entró
        // (ping kind='entro'), no a todo el alumnado.
        const { data } = await supabase.from('live_class_pings').select('student_id').eq('live_class_id', classId).eq('kind', 'entro')
        targets = [...new Set((data ?? []).map((p) => p.student_id))]
      }
      if (targets.length) await useNotificationsStore.getState().notifyClassFinished(cls, targets)
    }
    await supabase.from('live_class_chat').delete().eq('live_class_id', classId)
    set({ chatMessages: [] })
    return result
  },

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
