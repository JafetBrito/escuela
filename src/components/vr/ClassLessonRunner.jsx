import { useEffect, useRef, useState } from 'react'
import { useClassSessionStore } from '../../stores/useClassSessionStore'
import { getVrClassById } from '../../data/vrClassRegistry'
import { sendNpcMessage } from '../../services/chat/npcTransport'
import { useI18n } from '../../i18n'
import { LOCAL_SPEECH_EVENT } from './NpcSpeechPlayer'

// Pausa real para pensar — no avanza sola. El alumno decide cuándo seguir,
// pedido explícito tras probar la primera versión ("dar tiempo a las
// personas para reflexionar").
function ReflectionCard({ prompt, onContinue }) {
  return (
    <div className="absolute bottom-24 left-1/2 z-30 w-full max-w-lg -translate-x-1/2 px-4 sm:bottom-20">
      <div className="rounded-2xl border border-amber-400/40 bg-surface/95 p-4 shadow-2xl backdrop-blur">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-400">💭 Un momento para pensar</p>
        <p className="mt-2 text-sm leading-relaxed text-text">{prompt}</p>
        <button
          type="button"
          onClick={onContinue}
          className="mt-3 w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90"
        >
          Ya lo pensé, continuar →
        </button>
      </div>
    </div>
  )
}

// El "proyector" del salón (mismo patrón que VideoScreenModal en el Campus)
// — sistema listo para cuando una clase traiga un video real; ninguna clase
// del registro usa este paso todavía (no hay una URL real que poner ahí).
function ClassVideoStep({ url, caption, onDone }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 p-4">
      <div className="w-full max-w-3xl">
        <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-2xl">
          <iframe
            src={url}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={caption || 'Video de la clase'}
          />
        </div>
        {caption && <p className="mt-2 text-center text-sm text-white/80">{caption}</p>}
        <button
          type="button"
          onClick={onDone}
          className="mt-3 w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90"
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}

// Pregunta libre A MITAD de la clase (a diferencia de <ClassEndPanel>, que
// solo existe al terminar) — pausa el guion (useClassSessionStore.paused,
// ver NpcSpeechPlayer.jsx) mientras está abierta, así nada sigue avanzando
// de fondo mientras se piensa/escribe/lee la respuesta.
function MidClassQuestion({ cls, onClose }) {
  const { lang } = useI18n()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [asking, setAsking] = useState(false)

  const handleAsk = async (e) => {
    e.preventDefault()
    const trimmed = question.trim()
    if (!trimmed || asking) return
    setAsking(true)
    const reply = await sendNpcMessage({ npcPrompt: cls.aiSystemPrompt, content: trimmed, lang })
    setAnswer(reply)
    setAsking(false)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-primary/40 bg-surface p-5 shadow-2xl">
        <p className="font-black text-text">❓ Pregúntale a {cls.teacherName}</p>
        <p className="mt-1 text-xs text-text-muted">La clase está en pausa — cuando termines, sigue donde la dejaste.</p>

        {answer && (
          <div className="mt-3 rounded-xl border border-border bg-background p-3">
            <p className="text-sm text-text">{answer}</p>
          </div>
        )}

        <form onSubmit={handleAsk} className="mt-3 flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Escribe tu pregunta…"
            disabled={asking}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90 disabled:opacity-50"
          >
            {asking ? '…' : 'Preguntar'}
          </button>
        </form>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-muted hover:border-primary hover:text-text"
        >
          {answer ? 'Continuar la clase →' : 'Cancelar'}
        </button>
      </div>
    </div>
  )
}

// Orquesta los `steps` de la clase activa (ver vrClassRegistry.js): dispara
// cada paso de diálogo (vía el mismo motor de NpcSpeechPlayer que ya existía
// para el discurso de Oliver) y dibuja los pasos que no son diálogo
// (reflexión, video). Vive en el HUD 2D de VRPage, fuera del <Canvas>.
export default function ClassLessonRunner() {
  const activeClassId = useClassSessionStore((s) => s.activeClassId)
  const started = useClassSessionStore((s) => s.started)
  const ended = useClassSessionStore((s) => s.ended)
  const stepIndex = useClassSessionStore((s) => s.stepIndex)
  const [askOpen, setAskOpen] = useState(false)
  const firedStepRef = useRef(-1)

  const cls = activeClassId ? getVrClassById(activeClassId) : null
  const step = cls?.steps?.[stepIndex]

  useEffect(() => { firedStepRef.current = -1 }, [activeClassId])

  useEffect(() => {
    if (!started || !cls || ended) return
    if (!step) { useClassSessionStore.getState().end(); return }
    if (firedStepRef.current === stepIndex) return
    firedStepRef.current = stepIndex
    if (step.type === 'dialogue') {
      // La posición real la calcula ClassroomWorld (depende del tamaño
      // medido del modelo 3D) y la publica en el store — cls.teacherPosition
      // es solo un valor de respaldo por si algo todavía no la publicó.
      const position = useClassSessionStore.getState().teacherPosition ?? cls.teacherPosition
      window.dispatchEvent(new CustomEvent(LOCAL_SPEECH_EVENT, {
        detail: {
          npcId: cls.npcId,
          script: step.text,
          classId: cls.id,
          position,
          startedAt: Date.now(),
        },
      }))
    }
  }, [started, cls, ended, step, stepIndex])

  if (!cls || !started || ended) return null

  const handleAskOpen = () => {
    setAskOpen(true)
    useClassSessionStore.getState().setPaused(true)
  }
  const handleAskClose = () => {
    setAskOpen(false)
    useClassSessionStore.getState().setPaused(false)
  }

  return (
    <>
      {step?.type === 'reflection' && (
        <ReflectionCard prompt={step.prompt} onContinue={() => useClassSessionStore.getState().nextStep()} />
      )}
      {step?.type === 'video' && (
        <ClassVideoStep url={step.url} caption={step.caption} onDone={() => useClassSessionStore.getState().nextStep()} />
      )}
      {!askOpen && (
        <button
          type="button"
          onClick={handleAskOpen}
          className="absolute bottom-44 right-4 z-30 rounded-full border border-primary/40 bg-surface/90 px-3 py-2 text-xs font-semibold text-text shadow-lg backdrop-blur transition-colors hover:border-primary sm:bottom-24"
        >
          ❓ Preguntar
        </button>
      )}
      {askOpen && <MidClassQuestion cls={cls} onClose={handleAskClose} />}
    </>
  )
}
