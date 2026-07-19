import { useEffect, useState } from 'react'
import VideoPlayer from '../video/VideoPlayer'
import { useSeenStore } from '../../stores/useSeenStore'

export const EXPLAINER_VIDEO_ID = '4sHQ3_Pr-wQ'

// Welcome video popup. Shown ONCE per ACCOUNT (gated by useSeenStore.welcomeVideo,
// which syncs to the DB via progressSnapshot) — NOT localStorage, which was
// per-browser, never reached the database, and made the video reappear on every
// device / cache clear. `pageKey` is kept only for the optional title.
export default function PageVideoModal({ pageKey: _pageKey, title = '👋 ¡Bienvenido!' }) {
  const seen = useSeenStore((s) => s.welcomeVideo)
  const setSeen = useSeenStore((s) => s.setWelcomeVideo)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!seen) setOpen(true)
  }, [seen])

  const close = () => {
    setOpen(false)
    setSeen()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <p className="text-base font-bold text-text">{title}</p>
          <button onClick={close} className="text-text-muted hover:text-text" aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="p-4">
          <VideoPlayer videoId={EXPLAINER_VIDEO_ID} className="w-full" />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button
            onClick={close}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background hover:bg-primary-hover"
          >
            🚫 Dejar de mostrar
          </button>
        </div>
      </div>
    </div>
  )
}
