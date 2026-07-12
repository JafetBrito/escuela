import { useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import PageVideoModal from '../shared/PageVideoModal'
import MascotViewport from './MascotViewport'
import MascotSelector from './MascotSelector'
import SkinSelector from './SkinSelector'
import BooksPanel from './BooksPanel'
import GalleryPanel from './GalleryPanel'
import ObjetosBagPanel from './ObjetosBagPanel'
import Inventory from '../inventory/Inventory'
import ChatTab from './ChatTab'
import MissionsTab from './MissionsTab'
import CurrencyBadge from '../shared/CurrencyBadge'
import { useMascotStore } from '../../stores/useMascotStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useShopStore } from '../../stores/useShopStore'
import { useGameStore, OLIVER_CLASSES } from '../../stores/useGameStore'
import { useLevelStore, levelProgress } from '../../stores/useLevelStore'
import { getMascotById } from '../../data/mascotRegistry'

// Página "Mi Equipo" (/mascota) — SOLO mascota, sin mezclar con el avatar.
// El avatar (clase/árbol/apariencia/bolsas de equipo) se maneja desde el menú
// flotante (MascotCompanion), que ya tiene su propio switcher Avatar/Mascota.
// Reutiliza los mismos paneles que el menú de mascota de los cursos — misma
// UI ya resuelta — con dos diferencias pedidas: Misiones muestra las globales
// (no hay curso/módulo) y sí incluye Apariencia (modelo 3D + atuendo).
export const GLOBAL_LEVEL_CAP = 250
export const ENTITY_LEVEL_CAP = 50

const BASE_TABS = [
  { id: 'chat',       label: 'Chat',       icon: '💬' },
  { id: 'misiones',   label: 'Misiones',   icon: '🎯' },
  { id: 'bolsas',     label: 'Objetos',    icon: '🎒' },
  { id: 'apariencia', label: 'Apariencia', icon: '🎨' },
  { id: 'libros',     label: 'Libros',     icon: '📚' },
  { id: 'notas',      label: 'Notas',      icon: '📝' },
]

function viewportBg(accentColor) {
  return {
    background: `radial-gradient(ellipse at 30% 80%, ${accentColor}1c 0%, #07070f 100%)`,
    backgroundImage: [
      'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)',
      'linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
    ].join(', '),
    backgroundSize: '28px 28px',
    backgroundPosition: '-1px -1px',
  }
}

function CappedXpBar({ accentColor }) {
  const xp = useLevelStore((s) => s.xp)
  const { level: rawLevel, xpIntoLevel, xpForNextLevel } = levelProgress(xp)
  const displayLevel = Math.min(rawLevel, ENTITY_LEVEL_CAP)
  const isCapped = rawLevel >= ENTITY_LEVEL_CAP
  const pct = isCapped ? 1 : xpIntoLevel / xpForNextLevel

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-1">
        <span className="flex items-center gap-1.5 text-xs font-black text-white">
          ⭐ Nv.&nbsp;{displayLevel}
          <span className="font-normal text-white/50">/ {ENTITY_LEVEL_CAP}</span>
          {isCapped && (
            <span className="rounded-full px-1.5 text-[9px] font-black"
              style={{ background: `${accentColor}44`, color: accentColor }}>CAP</span>
          )}
        </span>
        <span className="text-[9px] text-white/40 whitespace-nowrap">
          {isCapped ? 'cap activo' : `${xpIntoLevel}/${xpForNextLevel}`}
          <span className="ml-1 text-white/25">·&nbsp;máx&nbsp;{GLOBAL_LEVEL_CAP}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct * 100}%`,
            background: isCapped
              ? `linear-gradient(90deg, ${accentColor}88, ${accentColor})`
              : `linear-gradient(90deg, ${accentColor}55, ${accentColor})`,
            boxShadow: `0 0 10px ${accentColor}88`,
          }}
        />
      </div>
    </div>
  )
}

function SubTabBar({ tabs, active, onChange, accentColor }) {
  return (
    <div
      className="flex gap-1 overflow-x-auto rounded-2xl p-1"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${accentColor}28`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {tabs.map((t) => {
        const isActive = active === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 hover:text-text"
            style={isActive ? {
              background: `linear-gradient(135deg, ${accentColor}dd, ${accentColor}99)`,
              color: '#fff',
              boxShadow: `0 2px 12px ${accentColor}66, inset 0 1px 0 rgba(255,255,255,0.15)`,
            } : { color: 'var(--color-text-muted)' }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function MascotHeroCard({ label, oCls, accentColor }) {
  return (
    <div
      className="overflow-hidden rounded-3xl"
      style={{
        border: `1px solid ${accentColor}33`,
        boxShadow: `0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px ${accentColor}11`,
      }}
    >
      <div className="relative h-52 overflow-hidden" style={viewportBg(accentColor)}>
        <MascotViewport className="h-full w-full" showEmotions />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 20% 90%, ${accentColor}22 0%, transparent 55%)` }}
        />
        {oCls && (
          <div
            className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl px-3 py-1.5"
            style={{
              background: `${oCls.color}28`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${oCls.color}55`,
              boxShadow: `0 4px 16px ${oCls.color}22`,
            }}
          >
            <span className="text-lg">{oCls.icon}</span>
            <span className="text-xs font-black text-white">{oCls.name}</span>
          </div>
        )}
      </div>

      <div
        className="border-t px-4 py-3"
        style={{
          borderColor: `${accentColor}1a`,
          background: 'var(--color-surface)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-black text-text">{label}</p>
            {oCls ? (
              <p className="mt-0.5 text-[10px] font-semibold" style={{ color: oCls.color }}>
                {oCls.icon} {oCls.name}
              </p>
            ) : (
              <p className="text-[10px] text-text-muted">Sin clase asignada</p>
            )}
          </div>
          <div className="w-44 shrink-0">
            <CappedXpBar accentColor={accentColor} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MascotHomePage() {
  const selectedMascotId   = useMascotStore((s) => s.selectedMascotId)
  const mascot             = getMascotById(selectedMascotId)
  const settingsMascotName = useSettingsStore((s) => s.mascotName)
  const coins              = useCurrencyStore((s) => s.coins)
  const hasCamera          = useShopStore((s) => s.purchased.includes('camara'))
  const oliverClass        = useGameStore((s) => s.oliver.class)

  const displayMascotName = settingsMascotName || mascot.name
  const oCls = oliverClass ? OLIVER_CLASSES[oliverClass] : null
  const accentColor = oCls?.color ?? '#a855f7'

  const tabs = [...BASE_TABS, ...(hasCamera ? [{ id: 'galeria', label: 'Galería', icon: '🖼️' }] : [])]
  const [subTab, setSubTab] = useState(tabs[0].id)

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <PageVideoModal pageKey="mascota" />

      <div
        className="pointer-events-none absolute inset-x-0 top-14 h-72 opacity-[0.13] transition-all duration-700"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accentColor} 0%, transparent 65%)` }}
      />

      <main className="relative flex-1 px-4 py-6 md:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-text">Mi Equipo</h1>
              <p className="text-xs text-text-muted">Tu compañera de aventuras</p>
            </div>
            <CurrencyBadge amount={coins} />
          </div>

          <MascotHeroCard label={displayMascotName} oCls={oCls} accentColor={accentColor} />

          <SubTabBar tabs={tabs} active={subTab} onChange={setSubTab} accentColor={accentColor} />

          <div className="flex flex-col gap-5">
            {subTab === 'chat' && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  Chat con {displayMascotName}
                </p>
                <ChatTab className="h-80" />
              </div>
            )}

            {subTab === 'misiones' && <MissionsTab courseOnly={false} />}

            {subTab === 'bolsas' && <ObjetosBagPanel />}

            {subTab === 'apariencia' && (
              <div
                className="flex flex-col gap-6 rounded-2xl border p-4"
                style={{
                  borderColor: `${accentColor}22`,
                  background: 'var(--color-surface)',
                  boxShadow: `0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)`,
                }}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Modelo 3D</p>
                  <p className="mt-1 text-xs text-text-muted">Elige el personaje 3D que te acompañará.</p>
                  <div className="mt-3"><MascotSelector /></div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Atuendo</p>
                  <p className="mt-1 text-xs text-text-muted">Solo cambia la apariencia. No afecta tus habilidades.</p>
                  <div className="mt-3"><SkinSelector /></div>
                </div>
              </div>
            )}

            {subTab === 'libros' && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  Libros de {displayMascotName}
                </p>
                <BooksPanel />
              </div>
            )}

            {subTab === 'notas' && (
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: `${accentColor}22`,
                  background: 'var(--color-surface)',
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)`,
                }}
              >
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-text-muted">
                  Notas y enlaces guardados
                </p>
                <Inventory />
              </div>
            )}

            {subTab === 'galeria' && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Galería de fotos</p>
                <GalleryPanel />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
