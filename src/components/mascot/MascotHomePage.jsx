import { useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotViewport from './MascotViewport'
import ItemsPanel from './ItemsPanel'
import SkinSelector from './SkinSelector'
import GalleryPanel from './GalleryPanel'
import Inventory from '../inventory/Inventory'
import ChatPanel from '../chat/ChatPanel'
import CurrencyBadge from '../shared/CurrencyBadge'
import { useMascotStore } from '../../stores/useMascotStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { getMascotById } from '../../data/mascotRegistry'

const TABS = [
  { id: 'home', label: 'Inicio', icon: '🏡' },
  { id: 'items', label: 'Objetos', icon: '🎒' },
  { id: 'notes', label: 'Notas', icon: '📝' },
  { id: 'appearance', label: 'Aspecto', icon: '🎨' },
  { id: 'gallery', label: 'Galería', icon: '🖼️' },
]

export default function MascotHomePage() {
  const [tab, setTab] = useState('home')
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const mascot = getMascotById(selectedMascotId)

  const settingsMascotName = useSettingsStore((s) => s.mascotName)
  const coins = useCurrencyStore((s) => s.coins)

  const displayName = settingsMascotName || mascot.name

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">La casa de {displayName}</h1>
              <p className="mt-1 text-sm text-text-muted">
                Aquí vive tu mascota junto con todos los objetos que has desbloqueado.
              </p>
            </div>
            <CurrencyBadge amount={coins} />
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-surface to-background">
            <MascotViewport className="h-64 w-full md:h-80" showEmotions />
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
                Chat con {displayName}
              </p>
              <ChatPanel className="h-[28rem]" />
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
            <section className="tech-panel flex flex-col gap-3 p-5">
              <p className="tech-label">// Notas y enlaces guardados</p>
              <Inventory />
            </section>
          )}

          {tab === 'appearance' && (
            <section className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Aspecto de tu mascota
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  Elige un atuendo para {displayName}. Esto solo cambia su apariencia, no su
                  modelo.
                </p>
                <div className="mt-3">
                  <SkinSelector />
                </div>
              </div>
            </section>
          )}

          {tab === 'gallery' && (
            <section className="flex flex-col gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                Galería de fotos
              </p>
              <GalleryPanel />
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
