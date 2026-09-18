import { useNpcSpeechStore } from '../../stores/useNpcSpeechStore'
import { useVrSettingsStore } from '../../stores/useVrSettingsStore'
import { NPC_SPEECH_SKIP_EVENT } from './NpcSpeechPlayer'

// Caja de diálogo estilo RPG (retrato + nombre + texto) para el discurso
// programado de un NPC (ver NpcSpeechPlayer.jsx) — pensada como "sistema"
// reutilizable para cualquier NPC con guion preparado, no solo Oliver.
// Solo existe mientras el jugador está cerca de quien habla (isNear, ver
// SPEECH_HEAR_RADIUS): lejos, ni se muestra ni suena. El botón de silencio
// reusa el mismo ajuste global "🔊 Leer voces" de Ajustes — quien lo apaga
// aquí también lo apaga para el resto del mundo, y viceversa.
export default function NpcDialogueBox() {
  const activeNpcId = useNpcSpeechStore((s) => s.activeNpcId)
  const npc = useNpcSpeechStore((s) => s.npc)
  const chunkText = useNpcSpeechStore((s) => s.chunkText)
  const chunkIndex = useNpcSpeechStore((s) => s.chunkIndex)
  const chunkTotal = useNpcSpeechStore((s) => s.chunkTotal)
  const isNear = useNpcSpeechStore((s) => s.isNear)
  const npcVoice = useVrSettingsStore((s) => s.npcVoice)
  const setNpcVoice = useVrSettingsStore((s) => s.setNpcVoice)

  if (!activeNpcId || !npc || !isNear) return null

  return (
    <div className="absolute bottom-24 left-1/2 z-30 w-full max-w-lg -translate-x-1/2 px-4 sm:bottom-20">
      <div className="rounded-2xl border border-primary/40 bg-surface/95 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-3xl">
            {npc.emoji ?? '🗣️'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-black text-text">{npc.name}</p>
              <div className="flex items-center gap-2">
                {chunkTotal > 0 && (
                  <span className="text-[10px] font-semibold text-text-muted">{chunkIndex + 1}/{chunkTotal}</span>
                )}
                <button
                  type="button"
                  title={npcVoice ? 'Silenciar voz' : 'Activar voz'}
                  onClick={() => setNpcVoice(!npcVoice)}
                  className="rounded-full p-1 text-base leading-none text-text-muted hover:bg-surface-hover hover:text-text"
                >
                  {npcVoice ? '🔊' : '🔇'}
                </button>
              </div>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-text">{chunkText}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent(NPC_SPEECH_SKIP_EVENT))}
          className="mt-3 w-full rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:border-primary hover:text-text"
        >
          ⏭️ Saltar conversación
        </button>
      </div>
    </div>
  )
}
