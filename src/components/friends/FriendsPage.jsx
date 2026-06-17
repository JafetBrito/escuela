import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useFriendsStore } from '../../stores/useFriendsStore'
import { useVrPresenceStore } from '../../stores/useVrPresenceStore'
import { useAuthStore } from '../../stores/useAuthStore'

// ─── Local mailbox helpers (localStorage) ─────────────────────────────────
const INBOX_KEY = 'oliver_mailbox_inbox'
const SENT_KEY  = 'oliver_mailbox_sent'

function loadBox(key) {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') } catch { return [] }
}
function saveBox(key, msgs) {
  localStorage.setItem(key, JSON.stringify(msgs))
}

function systemMessage(id, from, subject, body) {
  return { id, from, subject, body, date: new Date().toISOString(), read: false, system: true }
}

const SYSTEM_MESSAGES = [
  systemMessage('sys-1', 'oliver.school', '🌳 Bienvenido al campus', 'El Árbol del Mundo te espera. Elige tu clase y comienza tu aventura.'),
  systemMessage('sys-2', 'oliver.school', '🎯 Completa tu primera misión', 'Visita la página de Misiones y acepta tu primera tarea para ganar monedas y XP.'),
]

// ─── Mailbox section ────────────────────────────────────────────────────────
function Buzon({ myName, friends }) {
  const [box, setBox] = useState('inbox')
  const [inbox, setInbox] = useState(() => {
    const stored = loadBox(INBOX_KEY)
    if (!stored.length) { saveBox(INBOX_KEY, SYSTEM_MESSAGES); return SYSTEM_MESSAGES }
    return stored
  })
  const [sent, setSent] = useState(() => loadBox(SENT_KEY))
  const [selected, setSelected] = useState(null)
  const [composeTo, setComposeTo] = useState('')
  const [composeEmail, setComposeEmail] = useState('')
  const [composeSub, setComposeSub] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [composeSent, setComposeSent] = useState(false)
  const unread = inbox.filter(m => !m.read).length

  const markRead = (id) => {
    const next = inbox.map(m => m.id === id ? { ...m, read: true } : m)
    setInbox(next)
    saveBox(INBOX_KEY, next)
  }

  const openMsg = (msg) => {
    setSelected(msg)
    if (!msg.read) markRead(msg.id)
  }

  const handleSend = (e) => {
    e.preventDefault()
    const msg = {
      id: Date.now(),
      to: composeTo,
      email: composeEmail,
      subject: composeSub,
      body: composeBody,
      date: new Date().toISOString(),
    }
    const nextSent = [msg, ...sent]
    setSent(nextSent)
    saveBox(SENT_KEY, nextSent)
    if (composeEmail) {
      window.open(`mailto:${composeEmail}?subject=${encodeURIComponent(composeSub)}&body=${encodeURIComponent(`${composeBody}\n\n— ${myName} (oliver.school)`)}`)
    }
    setComposeSent(true)
    setTimeout(() => {
      setComposeSent(false)
      setComposeTo(''); setComposeEmail(''); setComposeSub(''); setComposeBody('')
    }, 2000)
  }

  const formatDate = (iso) => {
    try { return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }
    catch { return iso }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: 'inbox',   label: 'Bandeja',   icon: '📥', badge: unread || null },
          { id: 'sent',    label: 'Enviados',  icon: '📤' },
          { id: 'compose', label: 'Redactar',  icon: '✏️' },
        ].map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setBox(t.id); setSelected(null) }}
            className={`relative flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${
              box === t.id ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-text'
            }`}
          >
            {t.icon} {t.label}
            {t.badge > 0 && (
              <span className="absolute right-3 top-2 min-w-[18px] rounded-full bg-primary px-1 text-center text-[10px] font-bold text-background">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Inbox / Sent */}
      {(box === 'inbox' || box === 'sent') && !selected && (
        <ul className="divide-y divide-border">
          {(box === 'inbox' ? inbox : sent).length === 0 ? (
            <li className="py-8 text-center text-sm text-text-muted">
              {box === 'inbox' ? 'La bandeja está vacía.' : 'Aún no has enviado ningún mensaje.'}
            </li>
          ) : (box === 'inbox' ? inbox : sent).map(msg => (
            <li
              key={msg.id}
              onClick={() => openMsg(msg)}
              className="flex cursor-pointer items-start gap-3 px-5 py-3.5 transition-colors hover:bg-surface-hover"
            >
              <span className="mt-0.5 text-xl">{msg.system ? '📣' : box === 'inbox' ? '📩' : '📧'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`truncate text-sm ${!msg.read ? 'font-bold text-text' : 'text-text-muted'}`}>
                    {box === 'inbox' ? (msg.from ?? 'Desconocido') : (msg.to ?? 'Sin destinatario')}
                  </span>
                  {!msg.read && box === 'inbox' && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <p className="truncate text-xs text-text-muted">{msg.subject}</p>
              </div>
              <span className="shrink-0 text-[10px] text-text-muted">{formatDate(msg.date)}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Message detail */}
      {(box === 'inbox' || box === 'sent') && selected && (
        <div className="p-5">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text"
          >
            ← Volver
          </button>
          <div className="mb-4 rounded-xl border border-border bg-background p-4">
            <p className="mb-1 text-xs text-text-muted">
              {box === 'inbox' ? `De: ${selected.from}` : `Para: ${selected.to}${selected.email ? ` <${selected.email}>` : ''}`}
            </p>
            <p className="font-bold text-text">{selected.subject}</p>
            <p className="mt-0.5 text-xs text-text-muted">{formatDate(selected.date)}</p>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{selected.body}</p>
          {box === 'inbox' && !selected.system && (
            <button
              type="button"
              onClick={() => { setComposeTo(selected.from ?? ''); setBox('compose'); setSelected(null) }}
              className="mt-4 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-text-muted transition-colors hover:border-primary hover:text-primary"
            >
              ↩ Responder
            </button>
          )}
        </div>
      )}

      {/* Compose */}
      {box === 'compose' && (
        <form onSubmit={handleSend} className="flex flex-col gap-3 p-5">
          {composeSent && (
            <div className="rounded-lg bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-500">
              ✅ Mensaje guardado{composeEmail ? ' y correo abierto.' : '.'}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-text-muted">Para (nombre en VR)</label>
              <input
                value={composeTo}
                onChange={e => setComposeTo(e.target.value)}
                placeholder="Nombre del jugador…"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-text-muted">Email (opcional)</label>
              <input
                type="email"
                value={composeEmail}
                onChange={e => setComposeEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-text-muted">Asunto</label>
            <input
              required
              value={composeSub}
              onChange={e => setComposeSub(e.target.value)}
              placeholder="Asunto del mensaje…"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-text-muted">Mensaje</label>
            <textarea
              required
              rows={4}
              value={composeBody}
              onChange={e => setComposeBody(e.target.value)}
              placeholder="Escribe tu mensaje…"
              className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] text-text-muted">
              {composeEmail ? 'Se abrirá tu cliente de email al enviar.' : 'Sin email: solo se guarda localmente.'}
            </p>
            <button
              type="submit"
              disabled={!composeSub.trim() || !composeBody.trim()}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-background transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {composeEmail ? '✉️ Enviar por email' : '💾 Guardar'}
            </button>
          </div>
          {friends.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-text-muted">Amigos rápidos:</span>
              {friends.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setComposeTo(f)}
                  className="rounded-full border border-border px-2 py-0.5 text-[10px] text-text-muted transition-colors hover:border-primary hover:text-primary"
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </form>
      )}
    </section>
  )
}

// ─── Online dot ─────────────────────────────────────────────────────────────
function OnlineDot({ online }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{
        background: online ? '#22c55e' : '#6b7280',
        boxShadow: online ? '0 0 6px #22c55e88' : 'none',
      }}
      title={online ? 'En línea (en VR)' : 'Desconectado'}
    />
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function FriendsPage() {
  const navigate = useNavigate()
  const friends      = useFriendsStore(s => s.friends)
  const removeFriend = useFriendsStore(s => s.removeFriend)
  const addFriend    = useFriendsStore(s => s.addFriend)
  const players      = useVrPresenceStore(s => s.players)
  const profile      = useAuthStore(s => s.profile)
  const session      = useAuthStore(s => s.session)

  const [newName, setNewName] = useState('')
  const [confirmRemove, setConfirmRemove] = useState(null)

  const onlinePlayers = new Set(Object.values(players).map(p => p?.name).filter(Boolean))

  const myName =
    profile?.display_name ||
    session?.user?.user_metadata?.name ||
    session?.user?.email?.split('@')[0] ||
    'Tú'

  const handleAdd = (e) => {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    addFriend(trimmed)
    setNewName('')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 md:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">👥 Amigos</h1>
          <p className="mt-1 text-sm text-text-muted">
            Tus compañeros del campus y tu buzón de mensajes.
          </p>
        </div>

        {/* Buzón */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-bold text-text">📬 Buzón</p>
          <Buzon myName={myName} friends={friends} />
        </div>

        {/* Friends list */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-bold text-text">Lista de amigos ({friends.length})</p>
          <div className="rounded-2xl border border-border bg-surface">
            {friends.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="text-4xl">🤝</span>
                <p className="text-sm text-text-muted">
                  Aún no tienes amigos agregados.<br />
                  En el campus VR, acércate a otro jugador y selecciona "Agregar amigo".
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {friends.map((name) => {
                  const online = onlinePlayers.has(name)
                  return (
                    <li key={name} className="flex items-center gap-3 px-5 py-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold bg-primary/10"
                      >
                        {name[0]?.toUpperCase() ?? '?'}
                      </div>

                      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-semibold text-text">{name}</span>
                          <OnlineDot online={online} />
                          {online && <span className="text-[10px] font-medium text-green-500">en VR</span>}
                        </div>
                        <span className="text-xs text-text-muted">{online ? 'Conectado al Campus' : 'Desconectado'}</span>
                      </div>

                      <div className="flex shrink-0 gap-1.5">
                        {online && (
                          <button
                            type="button"
                            onClick={() => navigate('/vr')}
                            className="rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-text-muted hover:border-primary hover:text-primary"
                          >
                            💬 VR
                          </button>
                        )}
                        {confirmRemove === name ? (
                          <div className="flex gap-1">
                            <button type="button" onClick={() => { removeFriend(name); setConfirmRemove(null) }} className="rounded-lg bg-red-500/10 px-2 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20">
                              Confirmar
                            </button>
                            <button type="button" onClick={() => setConfirmRemove(null)} className="rounded-lg border border-border px-2 py-1.5 text-xs text-text-muted hover:text-text">✕</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setConfirmRemove(name)} className="rounded-lg border border-border px-2 py-1.5 text-xs text-text-muted hover:border-red-400 hover:text-red-400">
                            🗑️
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Add friend */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-3 text-sm font-bold text-text">➕ Agregar amigo por nombre</p>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nombre en el campus VR…"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:bg-primary-hover disabled:opacity-50"
            >
              Agregar
            </button>
          </form>
          <p className="mt-2 text-[11px] text-text-muted">
            El nombre debe coincidir con el que aparece sobre el personaje en el mundo VR.
          </p>
        </div>
      </main>

      <MascotCompanion hideViewport />
    </div>
  )
}
