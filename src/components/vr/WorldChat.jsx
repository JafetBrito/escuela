import { useState, useRef, useMemo, useEffect } from 'react'
import { useWorldChatStore } from '../../stores/useWorldChatStore'
import { useVrPresenceStore } from '../../stores/useVrPresenceStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useVoiceStore } from '../../stores/useVoiceStore'
import { useIsTouchDevice } from './engine/input'

// ── Chat line ─────────────────────────────────────────────────────────────────
function ChatLine({ message }) {
  if (message.system) {
    return (
      <p className="text-amber-400">
        <span className="font-semibold">🛡️ {message.author}:</span> {message.text}
      </p>
    )
  }
  if (message.whisperFrom) {
    return (
      <p className="italic text-fuchsia-400">
        <span className="font-semibold">🔒 Susurro de {message.whisperFrom}:</span> {message.text}
      </p>
    )
  }
  if (message.whisperTo) {
    return (
      <p className="italic text-fuchsia-400">
        <span className="font-semibold">🔒 Susurro a {message.whisperTo}:</span> {message.text}
      </p>
    )
  }
  return (
    <p className="text-text">
      <span className="font-semibold">{message.author}:</span> {message.text}
    </p>
  )
}

// ── Mic button ────────────────────────────────────────────────────────────────
export function MicButton({ onTranscript }) {
  const [listening, setListening] = useState(false)
  const recogRef = useRef(null)
  const hasApi = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  if (!hasApi) return null

  const toggle = () => {
    if (listening) { recogRef.current?.stop(); setListening(false); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR()
    r.lang = 'es-ES'; r.continuous = false; r.interimResults = false
    r.onresult = (e) => {
      const t = Array.from(e.results).map(res => res[0].transcript).join(' ')
      onTranscript(t)
    }
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    r.start(); recogRef.current = r; setListening(true)
  }

  return (
    <button
      type="button" onClick={toggle}
      title={listening ? 'Detener micrófono' : 'Hablar (mic)'}
      className={`rounded-lg px-2 py-1.5 text-base transition-all ${
        listening ? 'bg-red-500/20 text-red-400 ring-1 ring-red-400 animate-pulse' : 'text-text-muted hover:text-text'
      }`}
    >
      {listening ? '🔴' : '🎤'}
    </button>
  )
}

// ── World chat panel ───────────────────────────────────────────────────────────
export default function WorldChat({ open, onClose, onOpen, authorName, playerId, onSend, prefill }) {
  const messages       = useWorldChatStore((s) => s.messages)
  const sendMessage    = useWorldChatStore((s) => s.sendMessage)
  const addSystemMessage = useWorldChatStore((s) => s.addSystemMessage)
  const players        = useVrPresenceStore((s) => s.players)
  const isAdminForVoice = useAuthStore((s) => s.isAdmin())
  const grantedVoice   = useAuthStore((s) => s.canUseVoice())
  const myVoiceEnabled = useVoiceStore((s) => s.myVoiceEnabled)
  const canUseVoice    = isAdminForVoice ? myVoiceEnabled : grantedVoice
  const isTouch        = useIsTouchDevice()

  const [text, setText]    = useState('')
  const [tab, setTab]      = useState('general')
  const inputRef           = useRef(null)
  const lastSeenWhisperIdRef = useRef(null)
  const [hasUnreadWhisper, setHasUnreadWhisper] = useState(false)
  const [minimized, setMinimized] = useState(
    () => typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window),
  )
  const lastReadLenRef = useRef(0)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!minimized) { lastReadLenRef.current = messages.length; setUnreadCount(0) }
    else {
      const n = messages.length - lastReadLenRef.current
      if (n > 0) setUnreadCount(n)
    }
  }, [messages.length, minimized])

  useEffect(() => { if (open) inputRef.current?.focus() }, [open])

  useEffect(() => {
    if (!prefill) return
    setText(prefill.text); setTab('whispers'); inputRef.current?.focus()
  }, [prefill])

  const generalMessages = useMemo(() => messages.filter((m) => !m.whisperFrom && !m.whisperTo), [messages])
  const whisperMessages = useMemo(() => messages.filter((m) => m.whisperFrom || m.whisperTo), [messages])

  useEffect(() => {
    const last = whisperMessages[whisperMessages.length - 1]
    if (!last) return
    if (tab === 'whispers') { lastSeenWhisperIdRef.current = last.id; setHasUnreadWhisper(false); return }
    if (last.id !== lastSeenWhisperIdRef.current && last.whisperFrom) setHasUnreadWhisper(true)
  }, [whisperMessages, tab])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (trimmed) {
      const whisperMatch = trimmed.match(/^\/(?:w|susurro|whisper)\s+(\S+)\s+([\s\S]+)/i)
      if (whisperMatch) {
        const [, targetName, body] = whisperMatch
        const targetEntry = Object.entries(players).find(([, p]) => (p?.name || '').toLowerCase() === targetName.toLowerCase())
        if (targetEntry) {
          const [targetId] = targetEntry
          sendMessage(authorName, body, { authorId: playerId, whisperTo: targetName })
          onSend?.(authorName, body, targetId)
          setTab('whispers')
        } else {
          addSystemMessage(`No se encontró a "${targetName}" en el mundo.`)
        }
      } else {
        sendMessage(authorName, trimmed, { authorId: playerId })
        onSend?.(authorName, trimmed)
      }
      setText('')
    }
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); setText(''); onClose() }
  }

  const visibleMessages = tab === 'whispers' ? whisperMessages : generalMessages

  if (minimized) {
    return (
      <button
        type="button" onClick={() => setMinimized(false)}
        className={[
          'absolute z-20 flex items-center gap-2 rounded-full border border-border bg-surface/90 px-3 py-2 text-sm text-text shadow-xl backdrop-blur transition-colors hover:bg-surface',
          isTouch ? 'bottom-[148px] left-5' : 'bottom-20 left-4',
        ].join(' ')}
      >
        <span>💬</span>
        {unreadCount > 0 && (
          <span className="min-w-[18px] rounded-full bg-primary px-1 text-center text-xs font-bold text-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="text-xs text-text-muted">Chat</span>
        {hasUnreadWhisper && <span className="h-2 w-2 rounded-full bg-fuchsia-400" />}
      </button>
    )
  }

  return (
    <div
      className={[
        'absolute z-20 rounded-xl border border-border bg-surface/90 p-3 text-sm shadow-xl backdrop-blur',
        isTouch ? 'bottom-[148px] left-4 right-4' : 'bottom-20 left-4 w-72 max-w-[calc(100%-2rem)] sm:bottom-24',
      ].join(' ')}
    >
      <div className="mb-2 flex items-center gap-1 text-xs">
        <button type="button" onClick={() => setTab('general')}
          className={`flex-1 rounded-lg px-2 py-1 font-semibold transition-colors ${tab === 'general' ? 'bg-primary text-background' : 'text-text-muted hover:text-text'}`}
        >General</button>
        <button type="button" onClick={() => setTab('whispers')}
          className={`relative flex-1 rounded-lg px-2 py-1 font-semibold transition-colors ${tab === 'whispers' ? 'bg-primary text-background' : 'text-text-muted hover:text-text'}`}
        >
          Susurros
          {hasUnreadWhisper && <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-fuchsia-400" />}
        </button>
        <button type="button" onClick={() => setMinimized(true)}
          className="ml-1 rounded-lg px-2 py-1 text-base leading-none text-text-muted hover:text-text"
          aria-label="Minimizar chat"
        >—</button>
      </div>
      <div className="mb-2 flex max-h-40 flex-col gap-1 overflow-y-auto text-xs">
        {visibleMessages.length > 0
          ? visibleMessages.slice(-12).map((m) => <ChatLine key={m.id} message={m} />)
          : <p className="text-text-muted">{tab === 'whispers' ? 'Tus susurros aparecerán aquí.' : 'El chat global aparecerá aquí.'}</p>
        }
      </div>
      {open ? (
        <form onSubmit={handleSubmit} className="flex gap-1">
          <input
            ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Mensaje global, o /w nombre mensaje para susurrar…"
            className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
          />
          {canUseVoice && <MicButton onTranscript={(t) => setText(prev => prev ? prev + ' ' + t : t)} />}
          <button type="submit" className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-background transition-colors hover:bg-primary-hover">
            Enviar
          </button>
        </form>
      ) : (
        <button type="button" onClick={onOpen}
          className="w-full rounded-lg border border-dashed border-border px-2 py-1.5 text-left text-xs text-text-muted hover:border-primary hover:text-text"
        >
          {isTouch ? 'Toca aquí para chatear…' : 'Pulsa C o toca aquí para chatear…'}
        </button>
      )}
    </div>
  )
}
