import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useTutorialStore } from '../../stores/useTutorialStore'
import { TUTORIAL_MISSIONS } from '../../data/tutorialMissions'

// Separate from the main 🛠️ DevToolsPanel on purpose — this only exists to
// jump straight to any stage of the Árbol/Jafet intro tutorial for testing,
// without replaying ~30 minutes of it each time. Jumping to step N marks
// every step before it as done (so step N becomes the active one) and sends
// the admin to /vr-arbol.
export default function IntroMissionDevTool() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  if (!isAdmin?.()) return null

  const jumpTo = (stepId) => {
    const idx = TUTORIAL_MISSIONS.findIndex((m) => m.id === stepId)
    const done = TUTORIAL_MISSIONS.slice(0, idx).map((m) => m.id)
    useTutorialStore.setState({ done, returnTo: null })
    setOpen(false)
    navigate('/vr-arbol')
  }

  return (
    <div className="fixed bottom-4 left-20 z-[999]">
      {open && (
        <div className="mb-2 w-60 rounded-xl border border-border bg-surface/95 p-2 text-sm shadow-xl backdrop-blur">
          <p className="mb-2 px-1 text-xs font-semibold text-text-muted">🎬 Misión de introducción — saltar a:</p>
          {TUTORIAL_MISSIONS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => jumpTo(m.id)}
              className="block w-full rounded-lg px-2 py-1.5 text-left text-text hover:bg-primary/10"
            >
              {m.step}. {m.icon} {m.title}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { useTutorialStore.getState().reset(); setOpen(false); navigate('/vr-arbol') }}
            className="mt-1 block w-full rounded-lg border border-border px-2 py-1.5 text-left text-text-muted hover:bg-surface"
          >
            ↺ Reiniciar tutorial completo
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/95 text-lg shadow-xl backdrop-blur"
        aria-label="Dev tools — misión de introducción"
        title="Dev tools — misión de introducción (admin)"
      >
        🎬
      </button>
    </div>
  )
}
