import { useEffect, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '../../services/supabase/client'
import { useAuthStore } from '../../stores/useAuthStore'
import { NPC_SPEECHES } from '../../data/npcSpeechRegistry'

const POLL_MS = 20_000
const WINDOW_MINUTES = 2 // ventana de disparo: hora exacta ± 2 min

// ⚠️ TEMPORAL, solo para probar el sistema en vivo — con esto en un número,
// el discurso se repite cada TEST_INTERVAL_MINUTES en vez de una sola vez al
// día a targetUtcHour. El candado de "una vez al día" (npc_speech_log) no
// aplica en este modo — su restricción unique es por día, no por ventana de
// minutos, así que cada cliente conectado simplemente reemite el broadcast
// cuando le toca, sin tocar la tabla. Volver a `null` cuando ya no haga
// falta probar así (deja el comportamiento real: una vez al día).
const TEST_INTERVAL_MINUTES = 10

// Truco de offset fijo (sin librería de zonas horarias): resta el offset
// UTC-6 antes de leer año/mes/día en UTC — da la fecha calendario de Ciudad
// de México sin necesitar Intl.DateTimeFormat con timeZone.
function mexicoCityDateKey(d = new Date()) {
  return new Date(d.getTime() - 6 * 3_600_000).toISOString().slice(0, 10)
}

// Revisa cada POLL_MS si algún NPC de NPC_SPEECHES debe hablar ahora mismo
// y, si nadie lo ha reclamado hoy, reclama el candado (npc_speech_log) y
// avisa a todos los conectados vía broadcast. Quien gana la carrera de
// inserción no es quien "reproduce" el discurso — ese cliente solo hace el
// broadcast; NpcSpeechPlayer.jsx es quien realmente lo reproduce, en TODOS
// los clientes conectados (incluido este), así el momento de inicio
// percibido es el mismo para todos.
export function useNpcSpeechScheduler({ channelRef, enabled }) {
  const attemptedRef = useRef(new Set())

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured()) return

    const check = async () => {
      const now = new Date()
      const dateKey = mexicoCityDateKey(now)
      for (const [npcId, speech] of Object.entries(NPC_SPEECHES)) {
        if (TEST_INTERVAL_MINUTES != null) {
          const bucket = Math.floor(Date.now() / (TEST_INTERVAL_MINUTES * 60_000))
          const testKey = `${npcId}:test:${bucket}`
          if (attemptedRef.current.has(testKey)) continue
          attemptedRef.current.add(testKey)
          channelRef.current?.send({
            type: 'broadcast',
            event: 'npc_speech',
            payload: { npcId, script: speech.script, startedAt: Date.now() },
          })
          continue
        }

        const attemptKey = `${npcId}:${dateKey}`
        if (attemptedRef.current.has(attemptKey)) continue
        const minutesFromTarget = Math.abs(
          now.getUTCHours() * 60 + now.getUTCMinutes() - speech.targetUtcHour * 60,
        )
        if (minutesFromTarget > WINDOW_MINUTES) continue

        attemptedRef.current.add(attemptKey)
        const userId = useAuthStore.getState().session?.user?.id
        if (!userId) continue

        const { error } = await supabase
          .from('npc_speech_log')
          .insert({ npc_id: npcId, event_date: dateKey, triggered_by: userId })
        if (error) continue // otro cliente ya lo reclamó — está bien, no es un error real

        channelRef.current?.send({
          type: 'broadcast',
          event: 'npc_speech',
          payload: { npcId, script: speech.script, startedAt: Date.now() },
        })
      }
    }

    check()
    const interval = setInterval(check, POLL_MS)
    return () => clearInterval(interval)
  }, [enabled, channelRef])
}
