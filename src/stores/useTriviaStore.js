import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Baraja un array (Fisher-Yates) sin mutar el original — mismo helper que
// useExamsStore.js, usado aquí para sortear las preguntas de una partida.
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const QUESTIONS_PER_MATCH = 10

// Trivia en línea: invitar por username (búsqueda vía search_profiles, ver
// migration_016.sql — mismo RPC que ya usa el ajedrez, agnóstico de tabla),
// aceptar arma la partida sorteando preguntas de trivia_questions para la
// categoría elegida, y un único canal de Realtime por partida sincroniza
// el estado entre los dos navegadores — mismo patrón que useChessStore.js.
export const useTriviaStore = create((set, get) => ({
  searchResults: [],
  searching: false,
  invitesIn: [],
  invitesOut: [],
  myMatches: [],
  activeMatch: null,
  questionBank: null,
  _channel: null,

  // Usado por AdminTriviaPage.jsx — misma forma que useExamsStore.fetchExam/
  // saveExam, pero llaveado por categoría en vez de por curso.
  fetchQuestionBank: async (category) => {
    const { data } = await supabase.from('trivia_questions').select('*').eq('category', category).maybeSingle()
    set({ questionBank: data ?? null })
    return data ?? null
  },

  saveQuestionBank: async (category, questions, createdBy) => {
    const { data, error } = await supabase
      .from('trivia_questions')
      .upsert({ category, questions, created_by: createdBy, updated_at: new Date().toISOString() }, { onConflict: 'category' })
      .select()
      .single()
    if (!error) set({ questionBank: data })
    return { data, error }
  },

  searchProfiles: async (query) => {
    if (!query.trim()) { set({ searchResults: [] }); return }
    set({ searching: true })
    const { data } = await supabase.rpc('search_profiles', { query: query.trim() })
    set({ searchResults: data ?? [], searching: false })
  },

  fetchInvites: async (myId) => {
    const [{ data: inData }, { data: outData }] = await Promise.all([
      supabase.from('trivia_invites').select('*').eq('to_id', myId).eq('status', 'pendiente').order('created_at', { ascending: false }),
      supabase.from('trivia_invites').select('*').eq('from_id', myId).eq('status', 'pendiente').order('created_at', { ascending: false }),
    ])
    set({ invitesIn: inData ?? [], invitesOut: outData ?? [] })
  },

  fetchMyMatches: async (myId) => {
    const { data } = await supabase
      .from('trivia_matches')
      .select('*')
      .eq('status', 'en_curso')
      .or(`player1_id.eq.${myId},player2_id.eq.${myId}`)
      .order('updated_at', { ascending: false })
    set({ myMatches: data ?? [] })
  },

  // Igual que useChessStore.sendInvite, pero sí revisa el error del insert
  // de notificación — ese insert en ajedrez falla en silencio hoy porque
  // student_notifications solo tenía la política "admin creates"; para
  // trivia se agregó una política nueva acotada (ver migration_026.sql) que
  // sí lo permite cuando está ligado a una invitación real.
  sendInvite: async (fromId, fromName, toId, toName, category) => {
    const { data, error } = await supabase.from('trivia_invites').insert({
      from_id: fromId, from_name: fromName, to_id: toId, to_name: toName, category,
    }).select().single()
    if (error) return { data: null, error }
    set((s) => ({ invitesOut: [data, ...s.invitesOut] }))
    const { error: notifError } = await supabase.from('student_notifications').insert({
      student_id: toId,
      trivia_invite_id: data.id,
      title: '🎯 Te invitó a jugar trivia',
      body: `${fromName} · ${category}`,
    })
    if (notifError) console.error('[useTriviaStore.sendInvite] notificación no se pudo crear', notifError)
    return { data, error: null }
  },

  cancelInvite: async (inviteId) => {
    await supabase.from('trivia_invites').update({ status: 'cancelada' }).eq('id', inviteId)
    set((s) => ({ invitesOut: s.invitesOut.filter((i) => i.id !== inviteId) }))
  },

  respondInvite: async (invite, accept) => {
    if (!accept) {
      await supabase.from('trivia_invites').update({ status: 'rechazada' }).eq('id', invite.id)
      set((s) => ({ invitesIn: s.invitesIn.filter((i) => i.id !== invite.id) }))
      return { data: null, error: null }
    }

    const { data: bank } = await supabase.from('trivia_questions').select('questions').eq('category', invite.category).maybeSingle()
    const pool = bank?.questions ?? []
    if (pool.length === 0) return { data: null, error: new Error('Esta categoría todavía no tiene preguntas.') }
    const questions = shuffle(pool).slice(0, Math.min(QUESTIONS_PER_MATCH, pool.length))

    const fromStarts = Math.random() < 0.5
    const { data: match, error } = await supabase.from('trivia_matches').insert({
      player1_id: invite.from_id, player1_name: invite.from_name,
      player2_id: invite.to_id, player2_name: invite.to_name,
      category: invite.category,
      questions,
      current_turn: fromStarts ? invite.from_id : invite.to_id,
    }).select().single()
    if (error) return { data: null, error }

    await supabase.from('trivia_invites').update({ status: 'aceptada', match_id: match.id }).eq('id', invite.id)
    set((s) => ({ invitesIn: s.invitesIn.filter((i) => i.id !== invite.id), myMatches: [match, ...s.myMatches] }))
    const { error: notifError } = await supabase.from('student_notifications').insert({
      student_id: invite.from_id,
      trivia_invite_id: invite.id,
      title: '🎯 Aceptó tu invitación a trivia',
      body: invite.to_name,
    })
    if (notifError) console.error('[useTriviaStore.respondInvite] notificación no se pudo crear', notifError)
    return { data: match, error: null }
  },

  openMatch: (matchId) => {
    get().closeMatch()
    supabase.from('trivia_matches').select('*').eq('id', matchId).single()
      .then(({ data }) => set({ activeMatch: data ?? null }))

    const channel = supabase.channel(`trivia_match:${matchId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trivia_matches', filter: `id=eq.${matchId}` },
        (payload) => set({ activeMatch: payload.new }))
      .subscribe()
    set({ _channel: channel })
  },

  closeMatch: () => {
    const ch = get()._channel
    if (ch) supabase.removeChannel(ch)
    set({ activeMatch: null, _channel: null })
  },

  // Calificado en el cliente (igual que useExamsStore.submitAttempt) —
  // suficiente para un juego amistoso entre dos alumnos, mismo criterio de
  // confianza que useChessStore.makeMove.
  answerQuestion: async (matchId, match, choiceIndex) => {
    const q = match.questions[match.current_index]
    const correct = choiceIndex === q.correct
    const isPlayer1 = match.current_turn === match.player1_id
    const nextIndex = match.current_index + 1
    const isOver = nextIndex >= match.questions.length

    const patch = {
      current_index: nextIndex,
      current_turn: isPlayer1 ? match.player2_id : match.player1_id,
      answers: [...match.answers, { by: match.current_turn, choice: choiceIndex, correct }],
      player1_score: match.player1_score + (correct && isPlayer1 ? 1 : 0),
      player2_score: match.player2_score + (correct && !isPlayer1 ? 1 : 0),
      updated_at: new Date().toISOString(),
    }
    if (isOver) {
      const p1Final = patch.player1_score
      const p2Final = patch.player2_score
      patch.status = 'finalizada'
      patch.result = p1Final === p2Final ? 'empate' : p1Final > p2Final ? 'player1' : 'player2'
    }

    const { error } = await supabase.from('trivia_matches').update(patch).eq('id', matchId)
    if (!error) set((s) => ({ activeMatch: s.activeMatch ? { ...s.activeMatch, ...patch } : s.activeMatch }))
    return { error }
  },
}))
