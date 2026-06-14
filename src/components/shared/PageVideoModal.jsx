import { useEffect, useState } from 'react'
import VideoPlayer from '../video/VideoPlayer'

export const EXPLAINER_VIDEO_ID = '4sHQ3_Pr-wQ'

// Generic first-visit video popup. Shown once per page (tracked separately
// per `pageKey` in localStorage) the first time that page is opened.
export default function PageVideoModal({ pageKey, title = '👋 ¡Bienvenido!' }) {
  const storageKey = `oliver-video-seen-${pageKey}`
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey)) {
        setOpen(true)
      }
    } catch {
      // localStorage unavailable — just skip the popup.
    }
  }, [storageKey])

  const close = () => {
    setOpen(false)
    try {
      localStorage.setItem(storageKey, '1')
    } catch {
      // ignore
    }
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
            Entendido, ¡vamos!
          </button>
        </div>
      </div>
    </div>
  )
}
