import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { usePhoneMessagesStore } from '../../stores/usePhoneMessagesStore'
import { PHONE_CANNED_MESSAGES } from '../../data/phoneCannedMessages'

const SHORTCUTS = [
  { label: '🏠 Inicio', path: '/dashboard' },
  { label: '📜 Misiones', path: '/misiones' },
  { label: '🏫 Academias', path: '/academias' },
  { label: '🛒 Tienda', path: '/tienda' },
  { label: '🏆 Logros', path: '/logros' },
]

// App "Internet" del teléfono: la escuela real, embebida — mismo origen,
// así que la sesión ya está compartida (mismas cookies/localStorage), sin
// login aparte.
function InternetApp() {
  const [path, setPath] = useState('/dashboard')
  const [reloadKey, setReloadKey] = useState(0)

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-white/10 bg-black/30 px-2 py-1.5">
        {SHORTCUTS.map((s) => (
          <button
            key={s.path}
            type="button"
            onClick={() => { setPath(s.path); setReloadKey((k) => k + 1) }}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
              path === s.path ? 'bg-primary text-background' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <iframe key={reloadKey} src={path} title="4 Pared — Internet" className="flex-1 border-0 bg-white" />
    </div>
  )
}

// App "Mensajes": busca por username (search_profiles, mismo patrón que
// ajedrez/trivia/hospital) y manda uno de los mensajes prearmados —
// sin campo de texto libre, ver phoneCannedMessages.js.
function MessagesApp() {
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const myId = session?.user?.id
  const myName = profile?.display_name || session?.user?.email || 'Jugador'

  const searchResults = usePhoneMessagesStore((s) => s.searchResults)
  const searching = usePhoneMessagesStore((s) => s.searching)
  const searchProfiles = usePhoneMessagesStore((s) => s.searchProfiles)
  const messages = usePhoneMessagesStore((s) => s.messages)
  const fetchMessages = usePhoneMessagesStore((s) => s.fetchMessages)
  const sendMessage = usePhoneMessagesStore((s) => s.sendMessage)

  const [query, setQuery] = useState('')
  const [target, setTarget] = useState(null) // { id, display_name }
  const [status, setStatus] = useState('')

  useEffect(() => { if (myId) fetchMessages(myId) }, [myId, fetchMessages])

  const handleSearch = (e) => {
    e.preventDefault()
    searchProfiles(query)
  }

  const handleSend = async (body) => {
    if (!target || !myId) return
    setStatus('Enviando…')
    const { error } = await sendMessage(myId, myName, target.id, target.display_name, body)
    setStatus(error ? '❌ No se pudo enviar' : '✅ Enviado')
    if (!error) setTarget(null)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-3 text-white">
      {!target ? (
        <>
          <form onSubmit={handleSearch} className="flex gap-1.5">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o correo…"
              className="flex-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white outline-none focus:border-primary"
            />
            <button type="submit" className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-background">
              Buscar
            </button>
          </form>

          {searching && <p className="mt-2 text-[11px] text-white/50">Buscando…</p>}

          {searchResults.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setTarget(p); setStatus('') }}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-left text-xs hover:bg-white/10"
                >
                  <span>{p.display_name || p.email}</span>
                  <span className="text-white/40">Enviar →</span>
                </button>
              ))}
            </div>
          )}

          <p className="mb-1.5 mt-4 text-[10px] font-black uppercase tracking-widest text-white/40">Recientes</p>
          <div className="flex flex-col gap-1.5">
            {messages.length === 0 && <p className="text-[11px] text-white/40">Sin mensajes todavía.</p>}
            {messages.map((m) => (
              <div key={m.id} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs">
                <p className="text-white/50">{m.from_id === myId ? `Para ${m.to_name}` : `De ${m.from_name}`}</p>
                <p className="mt-0.5">{m.body}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <button type="button" onClick={() => setTarget(null)} className="mb-2 self-start text-xs text-white/60 hover:text-white">
            ← Atrás
          </button>
          <p className="mb-2 text-xs text-white/70">Mensaje para <strong className="text-white">{target.display_name || target.email}</strong>:</p>
          <div className="flex flex-col gap-1.5">
            {PHONE_CANNED_MESSAGES.map((msg) => (
              <button
                key={msg}
                type="button"
                onClick={() => handleSend(msg)}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-left text-xs hover:border-primary hover:bg-white/10"
              >
                {msg}
              </button>
            ))}
          </div>
          {status && <p className="mt-2 text-xs text-white/70">{status}</p>}
        </>
      )}
    </div>
  )
}

const APPS = [
  { id: 'internet', label: 'Internet', icon: '🌐' },
  { id: 'mensajes', label: 'Mensajes', icon: '💬' },
]

// "4 Pared" — el teléfono del mundo VR (solo escritorio, ver el botón que
// lo abre en VRPage.jsx). Estilo GTA V: una pantalla dentro de un marco de
// teléfono, con un puñado de "apps" en vez de una ventana genérica.
export default function FourthWallPhone({ onClose }) {
  const [app, setApp] = useState(null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="flex h-[600px] w-[320px] flex-col overflow-hidden rounded-[2rem] border-4 border-neutral-800 bg-neutral-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between bg-black px-4 py-2 text-[10px] font-semibold text-white/60">
          <span>4 Pared</span>
          <button type="button" onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>

        <div className="flex-1 overflow-hidden bg-neutral-900">
          {app === null && (
            <div className="grid grid-cols-3 gap-4 p-5">
              {APPS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setApp(a.id)}
                  className="flex flex-col items-center gap-1.5 text-white"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl">{a.icon}</span>
                  <span className="text-[10px] font-semibold">{a.label}</span>
                </button>
              ))}
            </div>
          )}
          {app === 'internet' && <InternetApp />}
          {app === 'mensajes' && <MessagesApp />}
        </div>

        {app !== null && (
          <button
            type="button"
            onClick={() => setApp(null)}
            className="shrink-0 border-t border-white/10 bg-black py-2 text-center text-xs font-semibold text-white/70 hover:text-white"
          >
            ● Inicio
          </button>
        )}
      </div>
    </div>
  )
}
