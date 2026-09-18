import { useState } from 'react'
import { useClassSessionStore } from '../../stores/useClassSessionStore'
import { getVrClassById } from '../../data/vrClassRegistry'
import { sendNpcMessage } from '../../services/chat/npcTransport'
import { useI18n } from '../../i18n'

// Se muestra cuando el guion de la clase (ver NpcSpeechPlayer.jsx) terminó
// de reproducirse — deja hacer UNA pregunta libre, respondida por IA con la
// conexión BYOK que el propio alumno tenga configurada en Ajustes → Núcleo
// (sendNpcMessage ya resuelve el "no tengo llave configurada" con un
// mensaje de demo, no hace falta duplicar ese chequeo aquí).
export default function ClassEndPanel() {
  const { lang } = useI18n()
  const ended = useClassSessionStore((s) => s.ended)
  const activeClassId = useClassSessionStore((s) => s.activeClassId)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [asking, setAsking] = useState(false)

  if (!ended || !activeClassId) return null
  const cls = getVrClassById(activeClassId)
  if (!cls) return null

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
    <div className="absolute bottom-24 left-1/2 z-30 w-full max-w-lg -translate-x-1/2 px-4 sm:bottom-20">
      <div className="rounded-2xl border border-primary/40 bg-surface/95 p-4 shadow-2xl backdrop-blur">
        <p className="font-black text-text">🎓 Clase terminada — {cls.title}</p>
        <p className="mt-1 text-sm text-text-muted">
          ¿Te quedó alguna pregunta sobre lo que habló {cls.teacherName}? Pregúntale directamente.
        </p>

        {answer && (
          <div className="mt-3 rounded-xl border border-border bg-background p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{cls.teacherName} responde</p>
            <p className="mt-1 text-sm text-text">{answer}</p>
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
      </div>
    </div>
  )
}
