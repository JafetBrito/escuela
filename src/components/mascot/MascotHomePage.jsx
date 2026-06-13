import { useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotViewport from './MascotViewport'
import ItemsPanel from './ItemsPanel'
import MascotSelector from './MascotSelector'
import Inventory from '../inventory/Inventory'
import { useMascotStore } from '../../stores/useMascotStore'
import { useSettingsStore, CHAT_MODELS } from '../../stores/useSettingsStore'
import { getMascotById } from '../../data/mascotRegistry'

const TABS = [
  { id: 'home', label: 'Inicio', icon: '🏡' },
  { id: 'items', label: 'Objetos', icon: '🎒' },
  { id: 'notes', label: 'Notas', icon: '📝' },
  { id: 'settings', label: 'Configuración', icon: '⚙️' },
]

export default function MascotHomePage() {
  const [tab, setTab] = useState('home')
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const mascot = getMascotById(selectedMascotId)

  const settingsMascotName = useSettingsStore((s) => s.mascotName)
  const setMascotName = useSettingsStore((s) => s.setMascotName)
  const minimaxApiKey = useSettingsStore((s) => s.minimaxApiKey)
  const setMinimaxApiKey = useSettingsStore((s) => s.setMinimaxApiKey)
  const chatModel = useSettingsStore((s) => s.chatModel)
  const setChatModel = useSettingsStore((s) => s.setChatModel)

  const displayName = settingsMascotName || mascot.name

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">La casa de {displayName}</h1>
            <p className="mt-1 text-sm text-text-muted">
              Aquí vive tu mascota junto con todos los objetos que has desbloqueado.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-surface to-background">
            <MascotViewport className="h-64 w-full md:h-80" />
          </div>

          <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          {tab === 'home' && (
            <section className="flex flex-col gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                Objetos de {displayName}
              </p>
              <ItemsPanel />
            </section>
          )}

          {tab === 'items' && (
            <section className="flex flex-col gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                Objetos de {displayName}
              </p>
              <ItemsPanel />
            </section>
          )}

          {tab === 'notes' && (
            <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                Tus notas
              </p>
              <Inventory />
            </section>
          )}

          {tab === 'settings' && (
            <section className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Nombre de tu mascota
                </p>
                <input
                  type="text"
                  value={settingsMascotName}
                  onChange={(e) => setMascotName(e.target.value)}
                  placeholder={mascot.name}
                  className="mt-2 w-full max-w-sm rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
                />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Modelo 3D
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  Elige el aspecto de tu mascota. Se aplica de inmediato.
                </p>
                <div className="mt-2">
                  <MascotSelector />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Minimax API key
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  Tu mascota usa esta clave para responder en el chat. Si la dejas vacía verás
                  respuestas de demostración.
                </p>
                <input
                  type="text"
                  value={minimaxApiKey}
                  onChange={(e) => setMinimaxApiKey(e.target.value)}
                  placeholder="mx-..."
                  className="mt-2 w-full max-w-sm rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-text outline-none focus:border-primary"
                />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Modelo de chat
                </p>
                <select
                  value={chatModel}
                  onChange={(e) => setChatModel(e.target.value)}
                  className="mt-2 w-full max-w-sm rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
                >
                  {CHAT_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
