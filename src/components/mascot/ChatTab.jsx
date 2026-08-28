import { useState, useEffect } from 'react'
import ChatPanel from '../chat/ChatPanel'
import { useChatStore } from '../../stores/useChatStore'
import { useChatHistoryStore, todayKey } from '../../stores/useChatHistoryStore'
import { useMascotCompanionStore } from '../../stores/useMascotCompanionStore'
import { useI18n } from '../../i18n'

// Same normalization used by ChatsPage: old snapshots stored a plain array
// of messages per day, new ones store { label, messages, archivedAt }.
function getSessions(raw, t) {
  if (!Array.isArray(raw) || raw.length === 0) return []
  const legacyMessages = raw.filter((item) => item?.role)
  const sessions = raw.filter((item) => item?.messages)
  const result = []
  if (legacyMessages.length > 0) {
    result.push({ label: t('pages.mascotHome.conversationLabel'), messages: legacyMessages, archivedAt: null })
  }
  result.push(...sessions)
  return result
}

// Chat tab for the mascot menu: lets the user pick between continuing the
// current conversation, starting a fresh one, or browsing previous chats.
export default function ChatTab({ courseId, module, className = '' }) {
  const { t } = useI18n()
  const [view, setView] = useState('menu')
  const [openDay, setOpenDay] = useState(null)
  const [pendingPrefill, setPendingPrefill] = useState('')
  const [pendingAutoSend, setPendingAutoSend] = useState(false)
  const messages = useChatStore((s) => s.messages)
  const startNewChat = useChatStore((s) => s.startNewChat)
  const chatHistory = useChatHistoryStore((s) => s.history)
  const chatPrefill = useMascotCompanionStore((s) => s.chatPrefill)
  const chatAutoSend = useMascotCompanionStore((s) => s.chatAutoSend)
  const clearChatPrefill = useMascotCompanionStore((s) => s.clearChatPrefill)

  useEffect(() => {
    if (chatPrefill) {
      setPendingPrefill(chatPrefill)
      setPendingAutoSend(chatAutoSend)
      clearChatPrefill()
      setView('current')
    }
  }, [chatPrefill, chatAutoSend, clearChatPrefill])

  if (view === 'current') {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <button
          onClick={() => setView('menu')}
          className="self-start text-xs font-semibold text-text-muted transition-colors hover:text-text"
        >
          {t('pages.mascotHome.backToMenu')}
        </button>
        <ChatPanel courseId={courseId} module={module} prefill={pendingPrefill} autoSend={pendingAutoSend} className="h-full flex-1 border-0" />
      </div>
    )
  }

  if (view === 'history') {
    const today = todayKey()
    const conversations = {}
    for (const day of Object.keys(chatHistory)) {
      conversations[day] = getSessions(chatHistory[day], t)
    }
    if (messages.length > 0) {
      conversations[today] = [
        ...(conversations[today] ?? []),
        { label: t('pages.mascotHome.currentConversationLabel'), messages, archivedAt: null, current: true },
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
          {t('pages.mascotHome.backToMenu')}
        </button>

        {days.length === 0 ? (
          <p className="text-sm text-text-muted">{t('pages.mascotHome.noSavedChats')}</p>
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
                      {day} {day === today ? t('pages.mascotHome.today') : ''}
                      <span className="ml-2 text-xs font-normal text-text-muted">
                        {sessions.length === 1 ? t('pages.mascotHome.chatCountOne') : t('pages.mascotHome.chatCountMany', { n: sessions.length })}
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
                              {session.messages.length === 1 ? t('pages.mascotHome.messageCountOne') : t('pages.mascotHome.messageCountMany', { n: session.messages.length })}
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
          {t('pages.mascotHome.continueCurrentChat')}
        </button>
      )}
      <button
        onClick={() => {
          startNewChat(module?.title)
          setView('current')
        }}
        className="w-full max-w-xs rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
      >
        {t('pages.mascotHome.newChat')}
      </button>
      <button
        onClick={() => setView('history')}
        className="w-full max-w-xs rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-text transition-colors hover:border-primary/40"
      >
        {t('pages.mascotHome.previousChats')}
      </button>
    </div>
  )
}
