import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import PageVideoModal from '../shared/PageVideoModal'
import MascotViewport from './MascotViewport'
import MascotSelector from './MascotSelector'
import SkinSelector from './SkinSelector'
import ItemsPanel from './ItemsPanel'
import BooksPanel from './BooksPanel'
import GalleryPanel from './GalleryPanel'
import Inventory from '../inventory/Inventory'
import ChatTab from './ChatTab'
import CurrencyBadge from '../shared/CurrencyBadge'
import XpBar from '../shared/XpBar'
import CharacterTree, { StatBar5 } from '../skills/CharacterTree'
import { useMascotStore } from '../../stores/useMascotStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useSettingsStore, DEFAULT_CUSTOM_INSTRUCTIONS } from '../../stores/useSettingsStore'
import { useShopStore } from '../../stores/useShopStore'
import { useGameStore, PLAYER_CLASSES, OLIVER_CLASSES, PLAYER_AVATARS } from '../../stores/useGameStore'
import { getSkillById } from '../../data/skillRegistry'
import { getMascotById } from '../../data/mascotRegistry'
import { getShopItemById, SHOP_ITEMS } from '../../data/shopRegistry'

// ─── Shared sub-tab bar ───────────────────────────────────────────────────────

function SubTabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface/80 p-1">
      {tabs.map((t) => (
        <button key={t.id} type="button" onClick={() => onChange(t.id)}
          className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
            active === t.id
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:bg-surface hover:text-text'
          }`}>
          <span>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Avatar tab ───────────────────────────────────────────────────────────────

const AVATAR_TABS = [
  { id: 'clase',       label: 'Clase',       icon: '🎴' },
  { id: 'apariencia',  label: 'Apariencia',  icon: '🎨' },
  { id: 'habilidades', label: 'Habilidades', icon: '🌳' },
]

function AvatarTab({ navigate }) {
  const [tab, setTab] = useState('clase')
  const playerClass  = useGameStore((s) => s.player.class)
  const oliverClass  = useGameStore((s) => s.oliver.class)
  const hp           = useGameStore((s) => s.player.hp)
  const energy       = useGameStore((s) => s.player.energy)
  const avatarId     = useGameStore((s) => s.player.avatarId)
  const setAvatar    = useGameStore((s) => s.setPlayerAvatar)

  const cls   = playerClass ? PLAYER_CLASSES[playerClass] : null
  const oCls  = oliverClass ? OLIVER_CLASSES[oliverClass] : null
  const avatar = PLAYER_AVATARS.find((a) => a.id === avatarId) || PLAYER_AVATARS[0]

  return (
    <div className="flex flex-col gap-5">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-3xl border border-border"
        style={{ borderColor: cls ? `${cls.color}44` : undefined }}>
        {/* Background gradient */}
        <div className="absolute inset-0 opacity-20"
          style={{ background: cls
            ? `radial-gradient(ellipse at 20% 50%, ${cls.color}88 0%, transparent 70%)`
            : `radial-gradient(ellipse at 20% 50%, ${avatar.color}66 0%, transparent 70%)` }} />

        <div className="relative flex items-center gap-5 px-5 py-5">
          {/* Avatar figure */}
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-lg"
              style={{ background: `linear-gradient(135deg, ${avatar.color}33, ${avatar.color}11)`, border: `2px solid ${avatar.color}55` }}>
              {avatar.icon}
            </div>
            {cls && (
              <span className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-xl text-xl shadow"
                style={{ background: `${cls.color}22`, border: `1.5px solid ${cls.color}55` }}>
                {cls.icon}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xl font-black text-text">{avatar.label}</p>
              {cls && (
                <span className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                  style={{ background: cls.color }}>
                  {cls.name}
                </span>
              )}
              {oCls && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: `${oCls.color}28`, color: oCls.color }}>
                  {oCls.icon} {oCls.name}
                </span>
              )}
            </div>
            {cls && <p className="mt-1 text-xs text-text-muted">{cls.description}</p>}

            {/* HP / Energy */}
            {cls && (
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {[
                  { label: 'HP',      cur: hp.current,     max: hp.max,     color: '#ef4444' },
                  { label: 'Energía', cur: energy.current, max: energy.max, color: '#22c55e' },
                ].map(({ label, cur, max, color }) => (
                  <div key={label}>
                    <div className="mb-0.5 flex justify-between text-[9px] text-text-muted">
                      <span className="font-bold uppercase tracking-wide">{label}</span>
                      <span>{cur}/{max}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-black/20">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${(cur / max) * 100}%`, background: color, boxShadow: `0 0 4px ${color}88` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* No class state */}
      {!cls && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/40 p-6 text-center">
          <span className="text-4xl">🌳</span>
          <p className="font-bold text-text">Sin clase asignada</p>
          <p className="text-sm text-text-muted">Completa la creación de cuenta para elegir tu clase RPG.</p>
          <button type="button" onClick={() => navigate('/crear-cuenta')}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-primary/90">
            Crear cuenta
          </button>
        </div>
      )}

      {/* Sub-tabs */}
      <SubTabBar tabs={AVATAR_TABS} active={tab} onChange={setTab} />

      {/* ── Clase ── */}
      {tab === 'clase' && cls && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-surface p-4"
            style={{ borderColor: `${cls.color}33` }}>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-text-muted">Estadísticas de clase</p>
            <div className="grid grid-cols-3 gap-x-6 gap-y-3 sm:grid-cols-5">
              {Object.entries(cls.stats).map(([stat, val]) => (
                <div key={stat} className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-text-muted">{stat}</span>
                  <StatBar5 val={val} color={cls.color} />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4"
            style={{ borderColor: `${cls.color}22` }}>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-text-muted">Aura pasiva</p>
            <p className="text-sm font-semibold text-text" style={{ color: cls.color }}>
              ✦ {cls.passiveAura?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
      )}

      {/* ── Apariencia ── avatar only, does NOT touch mascot */}
      {tab === 'apariencia' && (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Elige tu avatar</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {PLAYER_AVATARS.map((av) => {
              const active = av.id === avatarId
              return (
                <button key={av.id} type="button" onClick={() => setAvatar(av.id)}
                  className="flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all hover:scale-105"
                  style={{
                    borderColor: active ? av.color : 'var(--color-border)',
                    background:  active ? `${av.color}20` : 'var(--color-surface)',
                    boxShadow:   active ? `0 0 12px ${av.color}44` : 'none',
                  }}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{ background: active ? `${av.color}30` : `${av.color}12` }}>
                    {av.icon}
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: active ? av.color : 'var(--color-text-muted)' }}>
                    {av.label}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-text-muted">
            El avatar cambia tu color en el mundo VR. No afecta la apariencia de Oliver.
          </p>
        </div>
      )}

      {/* ── Habilidades ── */}
      {tab === 'habilidades' && <CharacterTree owner="player" />}
    </div>
  )
}

// ─── Prompt tab ───────────────────────────────────────────────────────────────

function PromptTab() {
  const purchased          = useShopStore((s) => s.purchased)
  const customInstructions = useSettingsStore((s) => s.customInstructions)
  const setCustomInst      = useSettingsStore((s) => s.setCustomInstructions)

  const promptItems = SHOP_ITEMS.filter(
    (item) => item.kind === 'ai-prompt' && purchased.includes(item.id)
  )

  const activeItem = promptItems.find((item) => item.promptText === customInstructions) ?? null
  const isDefault  = customInstructions === DEFAULT_CUSTOM_INSTRUCTIONS || !activeItem

  function activate(item) {
    setCustomInst(item.promptText)
  }

  function deactivate() {
    setCustomInst(DEFAULT_CUSTOM_INSTRUCTIONS)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Active banner */}
      <div className="flex items-center gap-3 rounded-2xl border p-3"
        style={{
          borderColor: activeItem ? '#a855f744' : 'var(--color-border)',
          background:  activeItem ? '#a855f711' : 'var(--color-surface)',
        }}>
        <span className="text-2xl">{activeItem ? activeItem.icon : '🐱'}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Personalidad activa</p>
          <p className="text-sm font-black text-text">
            {activeItem ? activeItem.name : 'Tutor predeterminado de Oliver'}
          </p>
        </div>
        {activeItem && (
          <button type="button" onClick={deactivate}
            className="shrink-0 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-text-muted transition hover:border-red-400 hover:text-red-400">
            Restablecer
          </button>
        )}
      </div>

      {promptItems.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/40 p-8 text-center">
          <span className="text-4xl">🧠</span>
          <p className="font-bold text-text">Sin personalidades desbloqueadas</p>
          <p className="text-sm text-text-muted">Compra personalidades de IA en la Tienda para cambiar cómo habla Oliver.</p>
          <button type="button"
            onClick={() => window.location.assign('/tienda')}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white">
            Ir a la Tienda
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Personalidades disponibles ({promptItems.length})
          </p>
          {promptItems.map((item) => {
            const isActive = item.id === activeItem?.id
            return (
              <div key={item.id}
                className="flex items-start gap-3 rounded-2xl border p-4 transition-all"
                style={{
                  borderColor: isActive ? '#a855f799' : 'var(--color-border)',
                  background:  isActive ? '#a855f714' : 'var(--color-surface)',
                  boxShadow:   isActive ? '0 0 16px #a855f722' : 'none',
                }}>
                <span className="shrink-0 rounded-xl text-3xl p-1"
                  style={{ background: isActive ? '#a855f722' : 'var(--color-background)' }}>
                  {item.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-black text-text">{item.name}</p>
                    {isActive && (
                      <span className="rounded-full bg-violet-500 px-2 py-0.5 text-[9px] font-black text-white">
                        ✓ Activa
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">{item.description}</p>
                  <p className="mt-2 rounded-lg bg-background/60 px-3 py-2 text-[10px] leading-relaxed text-text-muted italic">
                    "{item.promptText?.slice(0, 120)}…"
                  </p>
                </div>
                <button type="button"
                  onClick={() => isActive ? deactivate() : activate(item)}
                  className="shrink-0 self-start rounded-xl px-3 py-1.5 text-xs font-black text-white transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: isActive
                      ? 'rgba(128,128,128,0.2)'
                      : 'linear-gradient(135deg, #a855f7, #7c3aed)',
                    color: isActive ? 'var(--color-text-muted)' : '#fff',
                  }}>
                  {isActive ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Mascota tab ──────────────────────────────────────────────────────────────

function MascotaTab({ displayName, hasCamera }) {
  const [tab, setTab] = useState('chat')
  const oliverClass = useGameStore((s) => s.oliver.class)
  const oCls        = oliverClass ? OLIVER_CLASSES[oliverClass] : null

  const TABS = [
    { id: 'chat',        label: 'Chat',        icon: '💬' },
    { id: 'aspecto',     label: 'Aspecto',      icon: '🎨' },
    { id: 'prompt',      label: 'Prompt',       icon: '🧠' },
    { id: 'habilidades', label: 'Habilidades',  icon: '🌳' },
    { id: 'objetos',     label: 'Objetos',      icon: '🎒' },
    { id: 'libros',      label: 'Libros',       icon: '📚' },
    { id: 'notas',       label: 'Notas',        icon: '📝' },
    ...(hasCamera ? [{ id: 'galeria', label: 'Galería', icon: '🖼️' }] : []),
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Mascot hero */}
      <div className="overflow-hidden rounded-3xl border border-border"
        style={{ borderColor: oCls ? `${oCls.color}44` : undefined }}>
        <div className="relative">
          {oCls && (
            <div className="absolute inset-0 opacity-10"
              style={{ background: `radial-gradient(ellipse at 50% 100%, ${oCls.color} 0%, transparent 70%)` }} />
          )}
          <MascotViewport className="h-52 w-full" showEmotions />
        </div>
        <div className="border-t border-border bg-surface/80 px-4 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-text">{displayName}</p>
              {oCls && (
                <p className="text-[10px] font-semibold" style={{ color: oCls.color }}>
                  {oCls.icon} {oCls.name}
                </p>
              )}
            </div>
            <div className="flex-1">
              <XpBar />
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <SubTabBar tabs={TABS} active={tab} onChange={setTab} />

      {/* ── Chat ── */}
      {tab === 'chat' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Chat con {displayName}</p>
          <ChatTab className="h-80" />
        </div>
      )}

      {/* ── Aspecto — mascot only, does NOT touch avatar ── */}
      {tab === 'aspecto' && (
        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Modelo de mascota</p>
            <p className="mt-1 text-xs text-text-muted">Elige el personaje 3D que te acompañará.</p>
            <div className="mt-3"><MascotSelector /></div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Atuendo de mascota</p>
            <p className="mt-1 text-xs text-text-muted">Solo cambia la apariencia, no el modelo. No afecta tu avatar.</p>
            <div className="mt-3"><SkinSelector /></div>
          </div>
        </div>
      )}

      {/* ── Prompt ── */}
      {tab === 'prompt' && <PromptTab />}

      {/* ── Habilidades ── */}
      {tab === 'habilidades' && <CharacterTree owner="oliver" />}

      {/* ── Objetos ── */}
      {tab === 'objetos' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Objetos de {displayName}</p>
          <ItemsPanel />
        </div>
      )}

      {/* ── Libros ── */}
      {tab === 'libros' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Libros de {displayName}</p>
          <BooksPanel />
        </div>
      )}

      {/* ── Notas ── */}
      {tab === 'notas' && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-text-muted">Notas y enlaces guardados</p>
          <Inventory />
        </div>
      )}

      {/* ── Galería ── */}
      {tab === 'galeria' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Galería de fotos</p>
          <GalleryPanel />
        </div>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

const MAIN_TABS = [
  { id: 'avatar',  label: 'Avatar',  icon: '⚔️' },
  { id: 'mascota', label: 'Mascota', icon: '🐱' },
]

export default function MascotHomePage() {
  const navigate = useNavigate()
  const [mainTab, setMainTab] = useState('avatar')

  const selectedMascotId   = useMascotStore((s) => s.selectedMascotId)
  const mascot             = getMascotById(selectedMascotId)
  const settingsMascotName = useSettingsStore((s) => s.mascotName)
  const coins              = useCurrencyStore((s) => s.coins)
  const hasCamera          = useShopStore((s) => s.purchased.includes('camara'))
  const playerClass        = useGameStore((s) => s.player.class)
  const oliverClass        = useGameStore((s) => s.oliver.class)
  const avatarId           = useGameStore((s) => s.player.avatarId)

  const displayName = settingsMascotName || mascot.name
  const cls   = playerClass ? PLAYER_CLASSES[playerClass] : null
  const oCls  = oliverClass ? OLIVER_CLASSES[oliverClass] : null
  const avatar = PLAYER_AVATARS.find((a) => a.id === avatarId) || PLAYER_AVATARS[0]

  // Gradient accent colour: avatar colour for avatar tab, oliver class for mascota tab
  const accentColor = mainTab === 'avatar'
    ? (cls?.color ?? avatar.color)
    : (oCls?.color ?? '#a855f7')

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <PageVideoModal pageKey="mascota" />

      {/* Decorative hero gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-14 h-64 opacity-15 transition-all duration-700"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accentColor} 0%, transparent 70%)` }} />

      <main className="relative flex-1 px-4 py-6 md:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-text">Mi Equipo</h1>
              <p className="text-xs text-text-muted">Tu avatar y tu compañera de aventuras</p>
            </div>
            <CurrencyBadge amount={coins} />
          </div>

          {/* Main two-tab switcher */}
          <div className="flex rounded-2xl border border-border bg-surface p-1.5 shadow-sm">
            {MAIN_TABS.map((t) => {
              const isActive = mainTab === t.id
              const color = t.id === 'avatar' ? (cls?.color ?? avatar.color) : (oCls?.color ?? '#a855f7')
              return (
                <button key={t.id} type="button" onClick={() => setMainTab(t.id)}
                  className="flex flex-1 items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-bold transition-all"
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${color}ee, ${color}bb)`,
                    color: '#fff',
                    boxShadow: `0 4px 16px ${color}44`,
                  } : { color: 'var(--color-text-muted)' }}>
                  <span className="text-base">{t.icon}</span>
                  <span>{t.label}</span>
                  {/* Mini class/oliver badge */}
                  {t.id === 'avatar' && cls && (
                    <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-black">
                      {cls.icon}
                    </span>
                  )}
                  {t.id === 'mascota' && oCls && (
                    <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-black">
                      {oCls.icon}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab panels */}
          {mainTab === 'avatar'  && <AvatarTab navigate={navigate} />}
          {mainTab === 'mascota' && <MascotaTab displayName={displayName} hasCamera={hasCamera} />}
        </div>
      </main>
    </div>
  )
}
