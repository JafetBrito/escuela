import { useState } from 'react'
import CharacterTree from './CharacterTree'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'

const TABS = [
  { id: 'player', label: 'Personaje', icon: '⚔️' },
  { id: 'oliver', label: 'Oliver',    icon: '🐱' },
]

export default function SkillTreePage() {
  const [tab, setTab] = useState('player')

  return (
    <div className="min-h-screen bg-background text-text">
      <AppTopBar />

      <main className="mx-auto max-w-2xl px-4 pb-32 pt-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="text-3xl">🌳</span>
          <div>
            <h1 className="text-xl font-black text-text">Mi Árbol de Habilidades</h1>
            <p className="text-xs text-text-muted">Desbloquea y gestiona tus habilidades de combate</p>
          </div>
        </div>

        <div className="mb-6 flex rounded-2xl border border-border bg-surface p-1">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all"
              style={tab === t.id
                ? { background: 'var(--color-primary)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }
                : { color: 'var(--color-text-muted)' }}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {tab === 'player' && <CharacterTree owner="player" />}
        {tab === 'oliver' && <CharacterTree owner="oliver" />}
      </main>

      <MascotCompanion />
    </div>
  )
}
