import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Presencia de TODO el sitio (no solo del mundo VR): cada cuenta conectada se
// anuncia en el canal 'site:presence' con su nombre, foto y si está activa o
// ausente. /amigos lo lee para mostrar quién está conectado. Vive en Realtime
// (no se guarda nada). Lo monta <SitePresence /> una vez por sesión.
// ponytail: cualquier cliente conectado recibe la lista de conectados (nombre
// y foto); es el mismo alcance que ya tiene la presencia del mundo VR.
const CHANNEL = 'site:presence'
const IDLE_MS = 5 * 60 * 1000

export const useSitePresenceStore = create((set) => ({
  online: {}, // { [userId]: { name, avatar, status: 'active' | 'away' } }
  setOnline: (online) => set({ online }),
}))

// Empieza a anunciar esta cuenta y a escuchar a las demás. Devuelve la función de limpieza.
export function startSitePresence({ userId, name, avatar }) {
  if (!supabase || !userId) return () => {}

  const channel = supabase.channel(CHANNEL, { config: { presence: { key: userId } } })
  let lastInput = Date.now()
  let lastStatus = null

  const currentStatus = () => (!document.hidden && Date.now() - lastInput < IDLE_MS ? 'active' : 'away')
  const announce = () => {
    const status = currentStatus()
    if (status === lastStatus) return
    lastStatus = status
    channel.track({ name, avatar: avatar ?? null, status })
  }

  channel.on('presence', { event: 'sync' }, () => {
    const online = {}
    for (const [id, metas] of Object.entries(channel.presenceState())) {
      const m = metas[metas.length - 1]
      if (m) online[id] = { name: m.name, avatar: m.avatar, status: m.status }
    }
    useSitePresenceStore.getState().setOnline(online)
  })
  channel.subscribe((status) => { if (status === 'SUBSCRIBED') announce() })

  const onInput = () => { lastInput = Date.now(); announce() }
  const events = ['mousemove', 'keydown', 'touchstart', 'click']
  events.forEach((e) => window.addEventListener(e, onInput, { passive: true }))
  document.addEventListener('visibilitychange', announce)
  const timer = setInterval(announce, 30_000)

  return () => {
    events.forEach((e) => window.removeEventListener(e, onInput))
    document.removeEventListener('visibilitychange', announce)
    clearInterval(timer)
    supabase.removeChannel(channel)
    useSitePresenceStore.getState().setOnline({})
  }
}
