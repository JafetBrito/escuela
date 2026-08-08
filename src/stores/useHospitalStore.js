import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// "Oliver Cyber Range: Hospital" — Hacker vs Doctor en tiempo real, mismo
// patrón de invitación por username que useChessStore.js/useTriviaStore.js
// (búsqueda vía search_profiles, invitar/aceptar/rechazar/cancelar), pero
// con roles asimétricos: quien invita elige su propio rol (from_role), el
// invitado recibe el otro. La partida comparte un solo medidor
// ("security", 0-100) que ambos clientes ven en vivo por Realtime — los
// ajustes van siempre por el RPC adjust_hospital_security (nunca un
// update directo del valor) para que dos aciertos casi simultáneos no se
// pisen entre sí.
export const useHospitalStore = create((set, get) => ({
  searchResults: [],
  searching: false,
  invitesIn: [],
  invitesOut: [],
  myMatches: [],
  activeMatch: null,
  _channel: null,

  searchProfiles: async (query) => {
    if (!query.trim()) { set({ searchResults: [] }); return }
    set({ searching: true })
    const { data } = await supabase.rpc('search_profiles', { query: query.trim() })
    set({ searchResults: data ?? [], searching: false })
  },

  fetchInvites: async (myId) => {
    const [{ data: inData }, { data: outData }] = await Promise.all([
      supabase.from('hospital_invites').select('*').eq('to_id', myId).eq('status', 'pendiente').order('created_at', { ascending: false }),
      supabase.from('hospital_invites').select('*').eq('from_id', myId).eq('status', 'pendiente').order('created_at', { ascending: false }),
    ])
    set({ invitesIn: inData ?? [], invitesOut: outData ?? [] })
  },

  fetchMyMatches: async (myId) => {
    const { data } = await supabase
      .from('hospital_matches')
      .select('*')
      .eq('status', 'en_curso')
      .or(`hacker_id.eq.${myId},doctor_id.eq.${myId}`)
      .order('updated_at', { ascending: false })
    set({ myMatches: data ?? [] })
  },

  sendInvite: async (fromId, fromName, fromRole, toId, toName) => {
    const { data, error } = await supabase.from('hospital_invites').insert({
      from_id: fromId, from_name: fromName, from_role: fromRole, to_id: toId, to_name: toName,
    }).select().single()
    if (error) return { data: null, error }
    set((s) => ({ invitesOut: [data, ...s.invitesOut] }))
    const { error: notifError } = await supabase.from('student_notifications').insert({
      student_id: toId,
      hospital_invite_id: data.id,
      title: '🏥 Te invitó al Cyber Range',
      body: `${fromName} · serás ${fromRole === 'hacker' ? 'Doctor 🩺' : 'Hacker 🕶️'}`,
    })
    if (notifError) console.error('[useHospitalStore.sendInvite] notificación no se pudo crear', notifError)
    return { data, error: null }
  },

  cancelInvite: async (inviteId) => {
    await supabase.from('hospital_invites').update({ status: 'cancelada' }).eq('id', inviteId)
    set((s) => ({ invitesOut: s.invitesOut.filter((i) => i.id !== inviteId) }))
  },

  respondInvite: async (invite, accept) => {
    if (!accept) {
      await supabase.from('hospital_invites').update({ status: 'rechazada' }).eq('id', invite.id)
      set((s) => ({ invitesIn: s.invitesIn.filter((i) => i.id !== invite.id) }))
      return { data: null, error: null }
    }

    const hackerIsInviter = invite.from_role === 'hacker'
    const { data: match, error } = await supabase.from('hospital_matches').insert({
      hacker_id: hackerIsInviter ? invite.from_id : invite.to_id,
      hacker_name: hackerIsInviter ? invite.from_name : invite.to_name,
      doctor_id: hackerIsInviter ? invite.to_id : invite.from_id,
      doctor_name: hackerIsInviter ? invite.to_name : invite.from_name,
    }).select().single()
    if (error) return { data: null, error }

    await supabase.from('hospital_invites').update({ status: 'aceptada', match_id: match.id }).eq('id', invite.id)
    set((s) => ({ invitesIn: s.invitesIn.filter((i) => i.id !== invite.id), myMatches: [match, ...s.myMatches] }))
    const { error: notifError } = await supabase.from('student_notifications').insert({
      student_id: invite.from_id,
      hospital_invite_id: invite.id,
      title: '🏥 Aceptó tu invitación al Cyber Range',
      body: invite.to_name,
    })
    if (notifError) console.error('[useHospitalStore.respondInvite] notificación no se pudo crear', notifError)
    return { data: match, error: null }
  },

  openMatch: (matchId) => {
    get().closeMatch()
    supabase.from('hospital_matches').select('*').eq('id', matchId).single()
      .then(({ data }) => set({ activeMatch: data ?? null }))

    const channel = supabase.channel(`hospital_match:${matchId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'hospital_matches', filter: `id=eq.${matchId}` },
        (payload) => set({ activeMatch: payload.new }))
      .subscribe()
    set({ _channel: channel })
  },

  closeMatch: () => {
    const ch = get()._channel
    if (ch) supabase.removeChannel(ch)
    set({ activeMatch: null, _channel: null })
  },

  // delta positivo = suma seguridad (acierto del Doctor), negativo = resta
  // (acierto del Hacker) — isHack solo decide qué contador (hacks/pacientes)
  // sube, la aritmética real del medidor la hace el RPC en el servidor.
  submitAction: async (matchId, delta, isHack) => {
    const { data, error } = await supabase.rpc('adjust_hospital_security', {
      p_match_id: matchId, p_delta: delta, p_is_hack: isHack,
    })
    if (!error && data) set({ activeMatch: data })
    return { data, error }
  },
}))
