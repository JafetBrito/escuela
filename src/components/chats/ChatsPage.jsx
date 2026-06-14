import { useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useChatHistoryStore, todayKey } from '../../stores/useChatHistoryStore'
import { useChatStore } from '../../stores/useChatStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { getMascotById } from '../../data/mascotRegistry'
import { downloadProgress } from '../../services/persistence/jsonFile'

export default function ChatsPage() {
  const chatHistory = useChatHistoryStore((s) => s.history)
  const currentMessages = useChatStore((s) => s.messages)
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const mascot = getMascotById(selectedMascotId)
  const settingsMascotName = useSettingsStore((s) => s.mascotName)
  const displayName = settingsMascotName || mascot.name

  const today = todayKey()
  const conversations = { ...chatHistory }
  if (currentMessages.length > 0) conversations[today] = currentMessages

  const days = Object.keys(conversations).sort((a, b) => b.localeCompare(a))
  const [openDay, setOpenDay] = useState(days[0] ?? null)

  const handleExportDay = (day) => {
    downloadProgress(conversations[day], `chat-${displayName.toLowerCase()}-${day}.json`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">Chats</h1>
            <p className="mt-1 text-sm text-text-muted">
              Todas las conversaciones que has tenido con {displayName}, organizadas por día.
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
                const messages = conversations[day]
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
                          {messages.length} mensajes
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
                        {messages.map((msg, i) => (
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
      </main>

      <MascotCompanion />
    </div>
  )
}
