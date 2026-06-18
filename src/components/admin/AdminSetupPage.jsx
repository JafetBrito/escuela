import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore, PLAYER_CLASSES } from '../../stores/useGameStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useTutorialStore } from '../../stores/useTutorialStore'
import { TUTORIAL_MISSIONS } from '../../data/tutorialMissions'

const QUICK_CLASSES = Object.values(PLAYER_CLASSES)

export default function AdminSetupPage() {
  const navigate    = useNavigate()
  const isAdmin     = useAuthStore((s) => s.isAdmin)
  const profile     = useAuthStore((s) => s.profile)

  const selectPlayerClass   = useGameStore((s) => s.selectPlayerClass)
  const setAvatarRegistryId = useGameStore((s) => s.setAvatarRegistryId)
  const setPlayerNickname   = useGameStore((s) => s.setPlayerNickname)
  const forceSyncToCloud    = useGameStore((s) => s.forceSyncToCloud)
  const completeStep        = useTutorialStore((s) => s.completeStep)

  const [chosen, setChosen]   = useState('programmer')
  const [working, setWorking] = useState(false)

  if (!isAdmin?.()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text">
        <div className="rounded-3xl border border-danger/30 bg-danger/10 p-8 text-center">
          <p className="text-4xl mb-3">🚫</p>
          <p className="font-black text-text">Solo para administradores</p>
          <p className="text-sm text-text-muted mt-1">Tu cuenta no tiene permisos de admin.</p>
        </div>
      </div>
    )
  }

  const handleGo = async () => {
    setWorking(true)
    selectPlayerClass(chosen)
    setAvatarRegistryId(8)
    setPlayerNickname(profile?.nickname ?? 'Admin')
    // Mark all tutorial missions as done so VrArbol doesn't block
    TUTORIAL_MISSIONS.forEach((m) => completeStep(m.id))
    try { await forceSyncToCloud() } catch { /* best effort */ }
    setWorking(false)
    navigate('/dashboard')
  }

  const cls = PLAYER_CLASSES[chosen]

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-text p-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-2xl">

        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-5xl mb-2">🛡️</p>
          <h1 className="text-2xl font-black">Admin Quick-Setup</h1>
          <p className="text-sm text-text-muted mt-1">
            Entra al campus sin pasar por el tutorial ni crear una cuenta nueva.
          </p>
          {profile?.email && (
            <p className="mt-2 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary inline-block">
              {profile.email}
            </p>
          )}
        </div>

        {/* Class picker */}
        <p className="mb-2 text-xs font-black uppercase tracking-wider text-text-muted">
          Elige clase de prueba
        </p>
        <div className="grid grid-cols-1 gap-2 mb-6">
          {QUICK_CLASSES.map((c) => (
            <button key={c.id} type="button" onClick={() => setChosen(c.id)}
              className="flex items-center gap-3 rounded-2xl border-2 px-4 py-2.5 text-left transition-all hover:scale-[1.01]"
              style={{
                borderColor: chosen === c.id ? c.color : 'var(--color-border)',
                background:  chosen === c.id ? `${c.color}14` : 'var(--color-background)',
              }}>
              <span className="text-xl">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-text">{c.name}</p>
                <p className="text-[10px] text-text-muted">{c.description}</p>
              </div>
              {chosen === c.id && (
                <span className="text-xs font-black" style={{ color: c.color }}>✓</span>
              )}
            </button>
          ))}
        </div>

        {/* What this does */}
        <div className="mb-5 rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-xs text-text-muted space-y-1">
          <p>✅ Asigna clase <strong className="text-text">{cls.name}</strong> a tu perfil</p>
          <p>✅ Avatar: Gato Naranja (id 8)</p>
          <p>✅ Marca todas las misiones del tutorial como completadas</p>
          <p>✅ Guarda en la nube y te lleva al Dashboard</p>
        </div>

        <button type="button" onClick={handleGo} disabled={working}
          className="w-full rounded-2xl py-3.5 font-black text-white transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${cls.color}, ${cls.color}aa)` }}>
          {working ? 'Configurando…' : '⚡ Entrar al Campus'}
        </button>
      </div>
    </div>
  )
}
