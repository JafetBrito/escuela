import { useState } from 'react'
import { PATCH_NOTES } from '../../data/patchNotesRegistry'
import { BUILD_INFO } from '../../data/buildInfo'
import PatchNotesModal from './PatchNotesModal'

// Small nav badge showing the current build — git-derived (see
// buildInfo.js/vite.config.js), ticks up on its own with every commit, no
// manual bumping. Antes esto pegaba BUILD_INFO (automático) con
// LATEST_VERSION de patchNotesRegistry.js (a mano, se queda desactualizado
// entre releases) — las dos mitades del texto nunca coincidían entre sí.
// Ahora usa un solo dato, el mismo que ya muestra la tarjeta de cambios del
// dashboard (DashboardPage.jsx). Clic sigue abriendo el changelog curado,
// eso no cambia.
export default function VersionBadge() {
  const [open, setOpen] = useState(false)
  const latest = PATCH_NOTES[0]

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={latest ? `${latest.title} — build #${BUILD_INFO.number}` : `build #${BUILD_INFO.number}`}
        className="hidden shrink-0 items-center gap-1 rounded-full border border-border/50 px-2 py-0.5 text-[10px] font-bold text-text-muted transition-colors hover:border-primary/40 hover:text-primary sm:flex"
      >
        #{BUILD_INFO.number}{BUILD_INFO.hash ? ` · ${BUILD_INFO.hash}` : ''}
      </button>
      {open && <PatchNotesModal open onClose={() => setOpen(false)} />}
    </>
  )
}
