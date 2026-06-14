import { useState } from 'react'
import ChatPanel from '../chat/ChatPanel'
import { useChatStore } from '../../stores/useChatStore'
import { useChatHistoryStore, todayKey } from '../../stores/useChatHistoryStore'

// Same normalization used by ChatsPage: old snapshots stored a plain array
// of messages per day, new ones store { label, messages, archivedAt }.
function getSessions(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return []
  const legacyMessages = raw.filter((item) => item?.role)
  const sessions = raw.filter((item) => item?.messages)
  const result = []
  if (legacyMessages.length > 0) {
    result.push({ label: 'Conversación', messages: legacyMessages, archivedAt: null })
  }
  result.push(...sessions)
  return result
}

// Chat tab for the mascot menu: lets the user pick between continuing the
// current conversation, starting a fresh one, or browsing previous chats.
export default function ChatTab({ courseId, module, className = '' }) {
  const [view, setView] = useState('menu')
  const [openDay, setOpenDay] = useState(null)
  const messages = useChatStore((s) => s.messages)
  const startNewChat = useChatStore((s) => s.startNewChat)
  const chatHistory = useChatHistoryStore((s) => s.history)

  if (view === 'current') {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <button
          onClick={() => setView('menu')}
          className="self-start text-xs font-semibold text-text-muted transition-colors hover:text-text"
        >
          ← Menú
        </button>
        <ChatPanel courseId={courseId} module={module} className="h-full flex-1 border-0" />
      </div>
    )
  }

  if (view === 'history') {
    const today = todayKey()
    const conversations = {}
    for (const day of Object.keys(chatHistory)) {
      conversations[day] = getSessions(chatHistory[day])
    }
    if (messages.length > 0) {
      conversations[today] = [
        ...(conversations[today] ?? []),
        { label: 'Conversación actual', messages, archivedAt: null, current: true },
      ]
    }
    const days = Object.keys(conversations)
      .filter((day) => conversations[day].length > 0)
      .sort((a, b) => b.localeCompare(a))

    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        <button
          onClick={() => setView('menu')}
          className="self-start text-xs font-semibold text-text-muted transition-colors hover:text-text"
        >
          ← Menú
        </button>

        {days.length === 0 ? (
          <p className="text-sm text-text-muted">Todavía no hay chats guardados.</p>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto">
            {days.map((day) => {
              const sessions = conversations[day]
              const isOpen = openDay === day
              return (
                <div key={day} className="rounded-lg border border-border">
                  <button
                    onClick={() => setOpenDay(isOpen ? null : day)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm"
                  >
                    <span className="font-semibold text-text">
                      {day} {day === today ? '(hoy)' : ''}
                      <span className="ml-2 text-xs font-normal text-text-muted">
                        {sessions.length} chat{sessions.length > 1 ? 's' : ''}
                      </span>
                    </span>
                    <span className="text-text-muted">{isOpen ? '▲' : '▼'}</span>
                  </button>
                  {isOpen && (
                    <div className="flex flex-col gap-2 border-t border-border px-3 py-2">
                      {sessions.map((session, sIdx) => (
                        <div key={sIdx} className="rounded-lg border border-border p-2">
                          <p className="mb-1 text-xs font-semibold text-text">
                            {session.current ? '🟢 ' : '💬 '}
                            {session.label}{' '}
                            <span className="font-normal text-text-muted">
                              ({session.messages.length} mensajes)
                            </span>
                          </p>
                          <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
                            {session.messages.map((msg, i) => (
                              <div
                                key={i}
                                className={`max-w-[90%] rounded-lg px-2 py-1 text-xs ${
                                  msg.role === 'user'
                                    ? 'ml-auto bg-primary text-background'
                                    : 'bg-surface-hover text-text'
                                }`}
                              >
                                {msg.content}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // view === 'menu'
  return (
    <div className={`flex h-full flex-col items-center justify-center gap-3 px-4 ${className}`}>
      {messages.length > 0 && (
        <button
          onClick={() => setView('current')}
          className="w-full max-w-xs rounded-xl border border-primary bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          ▶️ Continuar chat actual
        </button>
      )}
      <button
        onClick={() => {
          startNewChat(module?.title)
          setView('current')
        }}
        className="w-full max-w-xs rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
      >
        🆕 Nuevo chat
      </button>
      <button
        onClick={() => setView('history')}
        className="w-full max-w-xs rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-text transition-colors hover:border-primary/40"
      >
        📜 Chats anteriores
      </button>
    </div>
  )
}
