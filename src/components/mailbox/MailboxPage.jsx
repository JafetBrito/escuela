import { useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useFriendsStore } from '../../stores/useFriendsStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useI18n } from '../../i18n'
import { MAILBOX_INBOX_KEY } from '../../utils/mailboxStorage'

// Buzón de correo del alumno — extraído de FriendsPage.jsx (donde vivía
// mezclado con la lista de amigos) a su propia sección, con layout de
// cliente de correo real (barra lateral + panel de contenido) en vez de la
// tarjeta con pestañas de antes. Sigue siendo el mismo mecanismo de
// siempre: mensajes guardados en localStorage, no hay backend de mensajería
// real entre alumnos todavía (ver project_community_restructure en memoria).
// INBOX_KEY vive en utils/mailboxStorage.js (compartida con el ícono del
// header en AppTopBar.jsx, que necesita leer el conteo de no leídos).
const INBOX_KEY = MAILBOX_INBOX_KEY
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

const FOLDERS = [
  { id: 'inbox',   label: 'Bandeja de entrada', icon: '📥' },
  { id: 'sent',    label: 'Enviados',           icon: '📤' },
  { id: 'compose', label: 'Redactar',           icon: '✏️' },
]

export default function MailboxPage() {
  const { t } = useI18n()
  const friends = useFriendsStore((s) => s.friends)
  const profile = useAuthStore((s) => s.profile)
  const session = useAuthStore((s) => s.session)

  const myName =
    profile?.display_name ||
    session?.user?.user_metadata?.name ||
    session?.user?.email?.split('@')[0] ||
    'Tú'

  const [folder, setFolder] = useState('inbox')
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
  const unread = inbox.filter((m) => !m.read).length

  const markRead = (id) => {
    const next = inbox.map((m) => (m.id === id ? { ...m, read: true } : m))
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

  const list = folder === 'inbox' ? inbox : folder === 'sent' ? sent : null

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-6">
        <h1 className="mb-4 text-2xl font-bold">{t('pages.mailbox.title')}</h1>

        <div className="grid gap-4 rounded-2xl border border-border bg-surface md:grid-cols-[200px_1fr]" style={{ minHeight: '60vh' }}>
          {/* Sidebar de carpetas — estilo cliente de correo */}
          <div className="border-b border-border p-3 md:border-b-0 md:border-r">
            <nav className="flex gap-2 md:flex-col">
              {FOLDERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => { setFolder(f.id); setSelected(null) }}
                  className={`relative flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors md:flex-none ${
                    folder === f.id ? 'bg-primary/15 text-primary' : 'text-text-muted hover:bg-surface-hover hover:text-text'
                  }`}
                >
                  <span>{f.icon}</span>
                  <span className="hidden sm:inline">{f.label}</span>
                  {f.id === 'inbox' && unread > 0 && (
                    <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-background">{unread}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Panel de contenido */}
          <div className="min-w-0 p-3">
            {list && !selected && (
              list.length === 0 ? (
                <p className="py-16 text-center text-sm text-text-muted">
                  {folder === 'inbox' ? 'La bandeja está vacía.' : 'Aún no has enviado ningún mensaje.'}
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {list.map((msg) => (
                    <li
                      key={msg.id}
                      onClick={() => openMsg(msg)}
                      className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-surface-hover"
                    >
                      <span className="mt-0.5 text-xl">{msg.system ? '📣' : folder === 'inbox' ? '📩' : '📧'}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`truncate text-sm ${!msg.read ? 'font-bold text-text' : 'text-text-muted'}`}>
                            {folder === 'inbox' ? (msg.from ?? 'Desconocido') : (msg.to ?? 'Sin destinatario')}
                          </span>
                          {!msg.read && folder === 'inbox' && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                        </div>
                        <p className="truncate text-xs text-text-muted">{msg.subject}</p>
                      </div>
                      <span className="shrink-0 text-[10px] text-text-muted">{formatDate(msg.date)}</span>
                    </li>
                  ))}
                </ul>
              )
            )}

            {list && selected && (
              <div>
                <button type="button" onClick={() => setSelected(null)}
                  className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text">
                  ← Volver
                </button>
                <div className="mb-4 rounded-xl border border-border bg-background p-4">
                  <p className="mb-1 text-xs text-text-muted">
                    {folder === 'inbox' ? `De: ${selected.from}` : `Para: ${selected.to}${selected.email ? ` <${selected.email}>` : ''}`}
                  </p>
                  <p className="font-bold text-text">{selected.subject}</p>
                  <p className="mt-0.5 text-xs text-text-muted">{formatDate(selected.date)}</p>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{selected.body}</p>
                {folder === 'inbox' && !selected.system && (
                  <button
                    type="button"
                    onClick={() => { setComposeTo(selected.from ?? ''); setFolder('compose'); setSelected(null) }}
                    className="mt-4 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-text-muted transition-colors hover:border-primary hover:text-primary"
                  >
                    ↩ Responder
                  </button>
                )}
              </div>
            )}

            {folder === 'compose' && (
              <form onSubmit={handleSend} className="flex flex-col gap-3">
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
                      onChange={(e) => setComposeTo(e.target.value)}
                      placeholder="Nombre del jugador…"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-text-muted">Email (opcional)</label>
                    <input
                      type="email"
                      value={composeEmail}
                      onChange={(e) => setComposeEmail(e.target.value)}
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
                    onChange={(e) => setComposeSub(e.target.value)}
                    placeholder="Asunto del mensaje…"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-text-muted">Mensaje</label>
                  <textarea
                    required
                    rows={6}
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
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
                    {friends.map((f) => (
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
          </div>
        </div>
      </main>

      <MascotCompanion hideViewport />
    </div>
  )
}
