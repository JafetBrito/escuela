import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Transmisión en vivo de YouTube dentro del mundo VR. Un admin la activa con
// /stream <enlace> en la consola GM (y /stream off la apaga): se guarda en
// platform_settings (para quien entre después) y se avisa en vivo por el canal
// del campus (evento 'stream') a quien ya está dentro. La pantalla del campus
// (CampusVideoScreen) y el botón "🔴 En vivo" del HUD leen `embedUrl`.
const KEY = 'vr_stream'
const PARAMS = 'autoplay=1&rel=0&modestbranding=1'

// Acepta watch?v=, youtu.be/, /live/, /embed/, /shorts/, un id suelto o
// youtube.com/channel/UC… (transmisión actual del canal). Devuelve la URL de
// embed o null. Un enlace @handle no se puede incrustar: hace falta el enlace
// del directo o el del canal con /channel/UC….
export function toYouTubeEmbed(input) {
  const s = (input ?? '').trim()
  let m = s.match(/youtube\.com\/channel\/(UC[\w-]{20,})/)
  if (m) return `https://www.youtube.com/embed/live_stream?channel=${m[1]}&${PARAMS}`
  m = s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|live\/|embed\/|shorts\/))([\w-]{11})/)
  if (m) return `https://www.youtube.com/embed/${m[1]}?${PARAMS}`
  if (/^[\w-]{11}$/.test(s)) return `https://www.youtube.com/embed/${s}?${PARAMS}`
  return null
}

// Cualquier cliente puede mandar broadcasts por el canal, así que lo recibido
// se revalida: solo se acepta un embed de YouTube con esta forma exacta.
const SAFE_EMBED = /^https:\/\/www\.youtube\.com\/embed\/(?:[\w-]{11}|live_stream)\?[\w=&-]*$/
const safe = (url) => (typeof url === 'string' && SAFE_EMBED.test(url) ? url : null)

let channel = null
function broadcast(embedUrl) {
  if (!supabase) return
  if (!channel) {
    channel = supabase.channel('vr:campus', { config: { broadcast: { self: false } } })
    channel.subscribe()
  }
  channel.send({ type: 'broadcast', event: 'stream', payload: { embedUrl } })
}

export const useVrStreamStore = create((set) => ({
  embedUrl: null,
  // Cómo ve ESTE usuario la transmisión: 'screen' | 'mini' | 'full' | 'hidden' (ver StreamHud).
  // Solo un modo a la vez monta el video, para no duplicar el audio.
  viewMode: 'screen',
  setViewMode: (viewMode) => set({ viewMode }),

  load: async () => {
    if (!supabase) return
    const { data } = await supabase.from('platform_settings').select('value').eq('key', KEY).maybeSingle()
    set({ embedUrl: safe(data?.value?.embedUrl) })
  },

  // Una transmisión nueva (o su fin) siempre arranca en la pantalla del campus.
  applyRemote: (payload) => set({ embedUrl: safe(payload?.embedUrl), viewMode: 'screen' }),

  // Solo admin (la consola GM ya lo es). Devuelve false si el enlace no sirve.
  start: async (input) => {
    const embedUrl = toYouTubeEmbed(input)
    if (!embedUrl) return false
    set({ embedUrl, viewMode: 'screen' })
    broadcast(embedUrl)
    if (supabase) await supabase.from('platform_settings').upsert({ key: KEY, value: { embedUrl }, updated_at: new Date().toISOString() })
    return true
  },

  stop: async () => {
    set({ embedUrl: null })
    broadcast(null)
    if (supabase) await supabase.from('platform_settings').upsert({ key: KEY, value: { embedUrl: null }, updated_at: new Date().toISOString() })
  },
}))
