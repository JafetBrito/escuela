import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveClassStore } from '../../stores/useLiveClassStore'
import { useAuthStore } from '../../stores/useAuthStore'
import ResourceGallery from '../shared/ResourceGallery'

const PING_KINDS = [
  { kind: 'mano', icon: '🖐️', label: 'Levantar la mano' },
  { kind: 'ping', icon: '👋', label: 'Enviar ping' },
]

// Contenido del Hub (tema actual, agenda, recursos, misiones, preguntas) —
// sin encabezado ni botón de unirse, para poder reutilizarlo tanto en
// /mis-clases (teléfono) como al lado del video en /clases-disponibles
// (computadora, modo "verlo aquí mismo") y en la vista previa del admin.
export default function HubContent({ activeClass }) {
  const questions       = useLiveClassStore((s) => s.questions)
  const pings           = useLiveClassStore((s) => s.pings)
  const chatMessages     = useLiveClassStore((s) => s.chatMessages)
  const askQuestion      = useLiveClassStore((s) => s.askQuestion)
  const sendPing         = useLiveClassStore((s) => s.sendPing)
  const sendClassChatMessage = useLiveClassStore((s) => s.sendClassChatMessage)
  const session     = useAuthStore((s) => s.session)
  const profile     = useAuthStore((s) => s.profile)
  const [draft, setDraft] = useState('')
  const [chatDraft, setChatDraft] = useState('')
  const [pingState, setPingState] = useState({}) // { [kind]: 'sent' | 'error' }
  const chatEndRef = useRef(null)

  // Aviso visual cuando el profesor "llama la atención" — complementa el
  // sonido/voz de useLiveClassStore, se apaga solo tras unos segundos.
  const lastAttention = pings.find((p) => p.kind === 'atencion')
  const [dismissedAttentionId, setDismissedAttentionId] = useState(null)
  const showAttention = lastAttention && lastAttention.id !== dismissedAttentionId

  useEffect(() => {
    if (!lastAttention) return
    const timer = setTimeout(() => setDismissedAttentionId(lastAttention.id), 8000)
    return () => clearTimeout(timer)
  }, [lastAttention])

  const handleAsk = async (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    await askQuestion(activeClass.id, session?.user?.id, draft)
    setDraft('')
  }

  const handlePing = async (kind) => {
    const { error } = await sendPing(activeClass.id, session?.user?.id, kind)
    setPingState((s) => ({ ...s, [kind]: error ? 'error' : 'sent' }))
    setTimeout(() => setPingState((s) => ({ ...s, [kind]: null })), 2500)
  }

  const handleSendChat = async (e) => {
    e.preventDefault()
    if (!chatDraft.trim()) return
    const name = profile?.display_name || session?.user?.email || 'Alumno'
    await sendClassChatMessage(activeClass.id, session?.user?.id, name, chatDraft)
    setChatDraft('')
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages.length])

  const resources = activeClass.resources ?? []

  return (
    <div className="space-y-4">
      {showAttention && (
        <div className="animate-pulse rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center">
          <p className="text-sm font-bold text-amber-400">🔔 ¡Tu profesor te está llamando!</p>
        </div>
      )}

      {/* Acciones rápidas — el admin las ve aparecer en vivo mientras da la clase */}
      <div className="flex gap-2">
        {PING_KINDS.map((p) => {
          const state = pingState[p.kind]
          return (
            <button
              key={p.kind}
              type="button"
              onClick={() => handlePing(p.kind)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                state === 'sent'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : state === 'error'
                  ? 'border-danger/40 bg-danger/10 text-danger'
                  : 'border-border bg-surface text-text hover:border-primary/40'
              }`}
            >
              <span className="text-base">{p.icon}</span>
              {state === 'sent' ? '¡Enviado!' : state === 'error' ? 'No se pudo enviar' : p.label}
            </button>
          )
        })}
      </div>

      {activeClass.linked_mission && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{activeClass.linked_mission.icon ?? '📜'}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/70">Misión relacionada</p>
              <p className="font-bold text-text">{activeClass.linked_mission.title}</p>
            </div>
          </div>
          <Link to="/misiones" className="shrink-0 rounded-xl border border-violet-500/40 px-4 py-2 text-sm font-bold text-violet-400 hover:bg-violet-500/10">
            Ver en Misiones →
          </Link>
        </div>
      )}

      {activeClass.current_topic && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">📍 En este momento</p>
          <p className="mt-0.5 text-lg font-bold text-text">{activeClass.current_topic}</p>
        </div>
      )}

      {activeClass.agenda?.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">🗒️ Agenda</p>
          <ul className="space-y-1.5">
            {activeClass.agenda.map((item, i) => {
              const isCurrent = item.label === activeClass.current_topic
              const currentIdx = activeClass.agenda.findIndex((a) => a.label === activeClass.current_topic)
              const isPast = currentIdx > -1 && i < currentIdx
              return (
                <li key={i} className={`flex items-center gap-2 text-sm ${isCurrent ? 'font-bold text-primary' : isPast ? 'text-text-muted line-through' : 'text-text-muted'}`}>
                  <span>{isCurrent ? '▶️' : isPast ? '✅' : '▫️'}</span> {item.label}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {resources.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">📎 Recursos</p>
          <ResourceGallery resources={resources} />
        </div>
      )}

      {activeClass.missions?.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">🎯 Misiones de la clase</p>
          <div className="space-y-2">
            {activeClass.missions.map((m, i) => (
              <div key={i} className="rounded-xl bg-surface-hover px-3 py-2">
                <p className="text-sm font-semibold text-text">{m.title}</p>
                {m.description && <p className="mt-0.5 text-xs text-text-muted">{m.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">❓ Preguntas</p>
        <div className="space-y-2">
          {questions.length === 0 && <p className="text-sm text-text-muted">Aún no has hecho preguntas en esta clase.</p>}
          {questions.map((q) => (
            <div key={q.id} className="rounded-xl bg-surface-hover px-3 py-2">
              <p className="text-sm text-text">❓ {q.question}</p>
              {q.answered && <p className="mt-1 text-sm text-emerald-400">💬 {q.answer}</p>}
              {!q.answered && <p className="mt-1 text-xs text-text-muted">Esperando respuesta…</p>}
            </div>
          ))}
        </div>
        <form onSubmit={handleAsk} className="mt-3 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Escribe tu duda…"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90">Enviar</button>
        </form>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">💬 Chat de la clase</p>
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {chatMessages.length === 0 && <p className="text-sm text-text-muted">Aún no hay mensajes — sé el primero en escribir.</p>}
          {chatMessages.map((m) => {
            const mine = m.user_id === session?.user?.id
            return (
              <div key={m.id} className={`rounded-xl px-3 py-2 text-sm ${mine ? 'bg-primary/10 text-text' : 'bg-surface-hover text-text'}`}>
                <p className="text-[11px] font-bold text-text-muted">{mine ? 'Tú' : m.display_name || 'Alumno'}</p>
                <p>{m.message}</p>
              </div>
            )
          })}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
          <input
            value={chatDraft}
            onChange={(e) => setChatDraft(e.target.value)}
            placeholder="Escribe un mensaje…"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90">Enviar</button>
        </form>
        <p className="mt-2 text-[11px] text-text-muted">✈️ Este chat se borra al terminar la clase — descarga el resumen si quieres guardarlo.</p>
      </div>

      <Link
        to={`/mis-clases/${activeClass.id}/resumen`}
        className="block rounded-2xl border border-border bg-surface p-4 text-center text-sm font-bold text-primary hover:border-primary/40"
      >
        📄 Descargar resumen de la clase
      </Link>
    </div>
  )
}
