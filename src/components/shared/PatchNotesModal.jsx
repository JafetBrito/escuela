import { useState } from 'react'
import { PATCH_NOTES, LATEST_VERSION } from '../../data/patchNotesRegistry'
import { useSeenStore } from '../../stores/useSeenStore'

// Shows once per ACCOUNT per version (tracked in useSeenStore, synced via
// progressSnapshot) regardless of whether `open`/`onClose` are passed —
// callers that force `open` (e.g. the VR entry gate) still only see it once,
// they just also need to not rely on `onClose` firing when already seen.
export default function PatchNotesModal({ open: controlledOpen, onClose } = {}) {
  const seenVersion = useSeenStore((s) => s.patchVersion)
  const setSeenVersion = useSeenStore((s) => s.setPatchVersion)
  const [tab, setTab] = useState(0)

  const alreadySeen = seenVersion === LATEST_VERSION
  const isOpen = (controlledOpen ?? true) && !alreadySeen
  if (!isOpen) return null

  const dismiss = () => {
    setSeenVersion(LATEST_VERSION)
    onClose?.()
  }

  const note = PATCH_NOTES[tab]

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={dismiss}
    >
      <div
        className="relative flex w-full max-w-2xl flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0f0f1a 0%, #1a1030 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: 'linear-gradient(90deg, #1a0a2e, #0d1a3a)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-white/50">Oliver Academy</p>
              <p className="text-xl font-black text-white">Notas de la Versión</p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Version tabs */}
        <div className="flex gap-1 overflow-x-auto px-4 pt-3 pb-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {PATCH_NOTES.map((n, i) => (
            <button
              key={n.version}
              type="button"
              onClick={() => setTab(i)}
              className="shrink-0 rounded-t-lg px-3 py-1.5 text-xs font-bold transition-colors"
              style={{
                background: tab === i ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: tab === i ? '#fff' : 'rgba(255,255,255,0.35)',
                borderBottom: tab === i ? '2px solid #7c3aed' : '2px solid transparent',
              }}
            >
              {i === 0 && <span className="mr-1">🆕</span>}
              {n.version}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Version header */}
          <div className="mb-4 flex items-start gap-3">
            <span className="text-3xl">{note.emoji}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
                  style={{ background: `${note.tagColor}22`, color: note.tagColor, border: `1px solid ${note.tagColor}44` }}
                >
                  {note.tag}
                </span>
                <span className="text-xs text-white/30">{note.date}</span>
              </div>
              <p className="mt-1 text-lg font-black text-white">{note.title}</p>
            </div>
          </div>

          {/* Change list */}
          <ul className="flex flex-col gap-2">
            {note.changes.map((c, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <span className="mt-0.5 shrink-0 text-base">{c.icon}</span>
                <span className="text-white/75 leading-snug">{c.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}
        >
          <p className="text-xs text-white/25">
            Versión actual: <strong className="text-white/40">{LATEST_VERSION}</strong>
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5)' }}
          >
            ¡Entendido! 🎮
          </button>
        </div>
      </div>
    </div>
  )
}

// Also export a hook to manually re-open patch notes (e.g., from Settings)
export function reopenPatchNotes() {
  useSeenStore.getState().setPatchVersion(null)
}
