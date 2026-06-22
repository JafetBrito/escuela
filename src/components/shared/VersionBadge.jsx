import { useState } from 'react'
import { LATEST_VERSION, PATCH_NOTES } from '../../data/patchNotesRegistry'
import PatchNotesModal from './PatchNotesModal'

// Small nav badge showing the current version + build number. The build
// number is the git commit count (see vite.config.js) — it ticks up on its
// own with every commit, no manual bumping, so you can always tell at a
// glance which build is actually running. Click opens the changelog.
export default function VersionBadge() {
  const [open, setOpen] = useState(false)
  const latest = PATCH_NOTES[0]

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={latest ? `${latest.title} — build #${__BUILD_NUMBER__}` : `build #${__BUILD_NUMBER__}`}
        className="hidden shrink-0 items-center gap-1 rounded-full border border-border/50 px-2 py-0.5 text-[10px] font-bold text-text-muted transition-colors hover:border-primary/40 hover:text-primary sm:flex"
      >
        v{LATEST_VERSION} · #{__BUILD_NUMBER__}
      </button>
      {open && <PatchNotesModal open onClose={() => setOpen(false)} />}
    </>
  )
}
