import { useEffect, useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import VideoPlayer from '../video/VideoPlayer'
import { ONLINE_CLASS_PLAYLIST } from '../../data/onlineClassPlaylist'
import { useOnlineChatStore } from '../../stores/useOnlineChatStore'
import { useAuthStore } from '../../stores/useAuthStore'

// "Clase Online": un canal continuo (playlist en bucle) + chat global para
// todos los que estén viendo. Completamente aparte de las clases en vivo/de
// práctica — no usa live_classes, no tiene Hub, no tiene sincronización por
// código. Es un solo canal compartido.
function GlobalChat() {
  const messages     = useOnlineChatStore((s) => s.messages)
  const loading      = useOnlineChatStore((s) => s.loading)
  const connect      = useOnlineChatStore((s) => s.connect)
  const disconnect   = useOnlineChatStore((s) => s.disconnect)
  const sendMessage  = useOnlineChatStore((s) => s.sendMessage)
  const session      = useAuthStore((s) => s.session)
  const profile      = useAuthStore((s) => s.profile)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    const name = profile?.display_name || session?.user?.email?.split('@')[0] || 'Estudiante'
    await sendMessage(session?.user?.id, name, draft)
    setDraft('')
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-border bg-surface">
      <p className="border-b border-border px-4 py-3 text-xs font-bold uppercase tracking-wide text-text-muted">💬 Chat en vivo</p>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {loading && <p className="text-sm text-text-muted">Cargando…</p>}
        {!loading && messages.length === 0 && <p className="text-sm text-text-muted">Sé el primero en escribir algo.</p>}
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="font-bold text-primary">{m.display_name ?? 'Estudiante'}: </span>
            <span className="text-text">{m.message}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escribe algo…"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
        />
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90">Enviar</button>
      </form>
    </div>
  )
}

export default function OnlineClassPage() {
  const [index, setIndex] = useState(0)
  const current = ONLINE_CLASS_PLAYLIST[index]
  const next = ONLINE_CLASS_PLAYLIST[(index + 1) % ONLINE_CLASS_PLAYLIST.length]

  const handleEnded = () => setIndex((i) => (i + 1) % ONLINE_CLASS_PLAYLIST.length)

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white">📺 Clase Online</h1>
            <p className="mt-1 text-sm font-medium text-white/85">Video continuo — entra cuando quieras y platica con quien más esté viendo.</p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-stretch">
            <div>
              {current ? (
                <>
                  <VideoPlayer videoId={current.videoId} onEnded={handleEnded} />
                  <p className="mt-3 text-sm font-bold text-text">▶️ {current.title}</p>
                  {next && next !== current && <p className="text-xs text-text-muted">Sigue: {next.title}</p>}
                </>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-text-muted">
                  Sin videos en la lista todavía.
                </div>
              )}
            </div>
            <div className="min-h-[420px] lg:min-h-0">
              <GlobalChat />
            </div>
          </div>
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
