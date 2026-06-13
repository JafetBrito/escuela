import { useState } from 'react'
import TypedText from './TypedText'
import { useChatStore } from '../../stores/useChatStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useInventoryStore } from '../../stores/useInventoryStore'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import { useProgressStore } from '../../stores/useProgressStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { getMascotById } from '../../data/mascotRegistry'

export default function ChatPanel({ className = '', module, courseId }) {
  const [input, setInput] = useState('')
  const messages = useChatStore((s) => s.messages)
  const isSending = useChatStore((s) => s.isSending)
  const send = useChatStore((s) => s.send)
  const license = useAuthStore((s) => s.license)
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const inventory = useInventoryStore((s) => s.items)
  const summaryLensActive = useItemEffectsStore((s) => !!s.activeItems['lente-resumen'])
  const completeMission = useProgressStore((s) => s.completeMission)
  const settingsMascotName = useSettingsStore((s) => s.mascotName)
  const minimaxApiKey = useSettingsStore((s) => s.minimaxApiKey)
  const chatModel = useSettingsStore((s) => s.chatModel)
  const mascotName = settingsMascotName || getMascotById(selectedMascotId).name

  const sendMessage = (content) => {
    if (!content.trim()) return
    send(content.trim(), {
      minimaxApiKey: minimaxApiKey || license?.minimaxApiKey,
      model: chatModel,
      mascotName,
      module: module
        ? { title: module.title, description: module.description }
        : undefined,
      inventory,
    })
    if (module && courseId) completeMission(courseId, module.id, 'chat')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
    setInput('')
  }

  const handleSummary = () => {
    if (!module) return
    sendMessage(`Hazme un resumen breve y claro de la clase "${module.title}": ${module.description}`)
  }

  return (
    <div className={`flex flex-col rounded-xl border border-border bg-surface ${className}`}>
      <div className="border-b border-border px-4 py-3 text-sm font-semibold">
        Chat con tu mascota
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-sm text-text-muted">
            Pregúntale algo a tu compañero sobre esta clase.
          </p>
        )}
        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1
          return (
            <div
              key={i}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'ml-auto bg-primary text-background'
                  : 'bg-surface-hover text-text'
              }`}
            >
              {msg.role === 'assistant' && isLast ? (
                <TypedText text={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          )
        })}
        {isSending && (
          <div className="max-w-[85%] rounded-lg bg-surface-hover px-3 py-2 text-sm text-text-muted">
            Escribiendo…
          </div>
        )}
      </div>

      {summaryLensActive && module && (
        <div className="border-t border-border px-3 pt-2">
          <button
            onClick={handleSummary}
            disabled={isSending}
            className="w-full rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            🔍 Generar resumen de esta clase
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje…"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background hover:bg-primary-hover"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
