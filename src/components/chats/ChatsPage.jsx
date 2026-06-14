import { useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useChatHistoryStore, todayKey } from '../../stores/useChatHistoryStore'
import { useChatStore } from '../../stores/useChatStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { getMascotById } from '../../data/mascotRegistry'
import { downloadProgress } from '../../services/persistence/jsonFile'

// Normalizes a day's stored entry into a list of sessions. Old snapshots
// stored a plain array of messages per day; new ones store an array of
// { label, messages, archivedAt } sessions. Some accounts have a mix of
// both (leftover legacy messages from before the per-class chat reset).
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

export default function ChatsPage() {
  const chatHistory = useChatHistoryStore((s) => s.history)
  const currentMessages = useChatStore((s) => s.messages)
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const mascot = getMascotById(selectedMascotId)
  const settingsMascotName = useSettingsStore((s) => s.mascotName)
  const displayName = settingsMascotName || mascot.name

  const today = todayKey()
  const conversations = {}
  for (const day of Object.keys(chatHistory)) {
    conversations[day] = getSessions(chatHistory[day])
  }
  if (currentMessages.length > 0) {
    conversations[today] = [
      ...(conversations[today] ?? []),
      { label: 'Conversación actual', messages: currentMessages, archivedAt: null, current: true },
    ]
  }

  const days = Object.keys(conversations)
    .filter((day) => conversations[day].length > 0)
    .sort((a, b) => b.localeCompare(a))
  const [openDay, setOpenDay] = useState(days[0] ?? null)
  const [openSession, setOpenSession] = useState(null)

  const handleExportDay = (day) => {
    const allMessages = conversations[day].flatMap((session) => session.messages)
    downloadProgress(allMessages, `chat-${displayName.toLowerCase()}-${day}.json`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">Chats</h1>
            <p className="mt-1 text-sm text-text-muted">
              Cada clase es una conversación nueva con {displayName}. Aquí puedes revisar las
              anteriores, organizadas por día.
            </p>
          </div>

          {days.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-5 text-sm text-text-muted">
              Todavía no hay chats guardados. Habla con {displayName} desde "Mi mascota" para
              empezar.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {days.map((day) => {
                const sessions = conversations[day]
                const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0)
                const isOpen = openDay === day
                return (
                  <div key={day} className="rounded-xl border border-border bg-surface">
                    <button
                      onClick={() => setOpenDay(isOpen ? null : day)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    >
                      <span className="text-sm font-semibold text-text">
                        {day} {day === today ? '(hoy)' : ''}
                        <span className="ml-2 text-xs font-normal text-text-muted">
                          {sessions.length} chat{sessions.length > 1 ? 's' : ''} · {totalMessages}{' '}
                          mensajes
                        </span>
                      </span>
                      <span className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExportDay(day)
                          }}
                          className="rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                        >
                          💾 Descargar
                        </button>
                        <span className="text-text-muted">{isOpen ? '▲' : '▼'}</span>
                      </span>
                    </button>

                    {isOpen && (
                      <div className="flex flex-col gap-2 border-t border-border px-4 py-3">
                        {sessions.map((session, sIdx) => {
                          const sessionKey = `${day}-${sIdx}`
                          const isSessionOpen = openSession === sessionKey
                          return (
                            <div key={sessionKey} className="rounded-lg border border-border">
                              <button
                                onClick={() =>
                                  setOpenSession(isSessionOpen ? null : sessionKey)
                                }
                                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                              >
                                <span className="text-sm text-text">
                                  {session.current ? '🟢 ' : '💬 '}
                                  {session.label}
                                  <span className="ml-2 text-xs text-text-muted">
                                    {session.messages.length} mensajes
                                  </span>
                                </span>
                                <span className="text-text-muted">{isSessionOpen ? '▲' : '▼'}</span>
                              </button>
                              {isSessionOpen && (
                                <div className="flex flex-col gap-2 border-t border-border px-3 py-2">
                                  {session.messages.map((msg, i) => (
                                    <div
                                      key={i}
                                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                        msg.role === 'user'
                                          ? 'ml-auto bg-primary text-background'
                                          : 'bg-surface-hover text-text'
                                      }`}
                                    >
                                      {msg.content}
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
              })}
            </div>
          )}
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
