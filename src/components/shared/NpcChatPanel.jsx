import { useState } from 'react'
import { useNpcChatStore } from '../../stores/useNpcChatStore'

const EMPTY_MESSAGES = []

// Compact "talk to the NPC" chat box, shared by the Tienda (Zafir) and
// Misiones (el Maestro de Misiones) NPCs. Each NPC has its own fixed system
// prompt and its own message history.
export default function NpcChatPanel({ npcId, npcName, npcPrompt, className = '' }) {
  const messages = useNpcChatStore((s) => s.messagesByNpc[npcId] ?? EMPTY_MESSAGES)
  const isSending = useNpcChatStore((s) => s.sendingByNpc[npcId])
  const send = useNpcChatStore((s) => s.send)
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const content = text.trim()
    if (!content || isSending) return
    setText('')
    send(npcId, npcPrompt, content)
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {messages.length > 0 && (
        <div className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-xl border border-border bg-background p-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-lg px-3 py-1.5 text-sm ${
                m.role === 'user'
                  ? 'self-end bg-primary/15 text-text'
                  : 'self-start bg-surface-hover text-text'
              }`}
            >
              {m.content}
            </div>
          ))}
          {isSending && <p className="text-xs text-text-muted">{npcName} está escribiendo…</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Habla con ${npcName}…`}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={isSending || !text.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
