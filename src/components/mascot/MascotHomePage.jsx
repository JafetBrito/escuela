import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import PageVideoModal from '../shared/PageVideoModal'
import MascotViewport from './MascotViewport'
import AvatarViewport from './AvatarViewport'
import MascotSelector from './MascotSelector'
import SkinSelector from './SkinSelector'
import ItemsPanel from './ItemsPanel'
import BooksPanel from './BooksPanel'
import GalleryPanel from './GalleryPanel'
import Inventory from '../inventory/Inventory'
import ChatTab from './ChatTab'
import CurrencyBadge from '../shared/CurrencyBadge'
import CharacterTree, { StatBar5 } from '../skills/CharacterTree'
import { useMascotStore } from '../../stores/useMascotStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useSettingsStore, DEFAULT_CUSTOM_INSTRUCTIONS } from '../../stores/useSettingsStore'
import { useShopStore } from '../../stores/useShopStore'
import { useGameStore, PLAYER_CLASSES, OLIVER_CLASSES, PLAYER_AVATARS } from '../../stores/useGameStore'
import { useLevelStore, levelProgress } from '../../stores/useLevelStore'
import { getMascotById } from '../../data/mascotRegistry'
import { SHOP_ITEMS } from '../../data/shopRegistry'

// ─── Level caps ───────────────────────────────────────────────────────────────
// Raise ENTITY_LEVEL_CAP to unlock the next band. GLOBAL_LEVEL_CAP is the
// long-term ceiling displayed in the XP bar suffix.
export const GLOBAL_LEVEL_CAP = 250
export const ENTITY_LEVEL_CAP = 50

// ─── Sub-tab registry ─────────────────────────────────────────────────────────
const SUB_TAB_META = {
  clase:       { label: 'Clase',       icon: '🎴' },
  apariencia:  { label: 'Apariencia',  icon: '🎨' },
  habilidades: { label: 'Habilidades', icon: '🌳' },
  objetos:     { label: 'Objetos',     icon: '🎒' },
  notas:       { label: 'Notas',       icon: '📝' },
  chat:        { label: 'Chat',        icon: '💬' },
  aspecto:     { label: 'Aspecto',     icon: '🎭' },
  prompt:      { label: 'Prompt',      icon: '🧠' },
  libros:      { label: 'Libros',      icon: '📚' },
  galeria:     { label: 'Galería',     icon: '🖼️' },
}

// ─── Entity config ────────────────────────────────────────────────────────────
// Each entity declares its OWN sub-tab list. Adding an entity here auto-wires
// its tab in the switcher and feeds the correct sub-tabs to EntityViewer.
function getSubTabsForEntity(entityId, hasCamera) {
  if (entityId === 'avatar') {
    return ['clase', 'apariencia', 'habilidades', 'objetos', 'notas']
  }
  // mascot (and any future entity of type 'mascot')
  return [
    'chat', 'aspecto', 'prompt', 'habilidades',
    'objetos', 'libros', 'notas',
    ...(hasCamera ? ['galeria'] : []),
  ]
}

function buildEntities({ mascotName, hasCamera }) {
  return [
    { id: 'avatar',  label: 'Avatar',    icon: '⚔️', owner: 'player', type: 'avatar' },
    { id: 'mascota', label: mascotName,  icon: '🐾', owner: 'oliver', type: 'mascot' },
    // Future: { id: 'dragon', label: 'Dragón', icon: '🐉', owner: 'dragon', type: 'mascot' }
  ]
}

// ─── Viewport render-space background ─────────────────────────────────────────
// Applied to both AvatarViewport and MascotViewport containers so the "3D stage"
// looks identical for every entity.
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

// ─── CappedXpBar ─────────────────────────────────────────────────────────────
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

// ─── Glassmorphism sub-tab bar ────────────────────────────────────────────────
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

// ─── Hero card — IDENTICAL structure for every entity ─────────────────────────
// Both Avatar and Mascot render: [Viewport] → [Info bar + CappedXpBar]
function EntityHeroCard({ entity, cls, oCls, avatar, accentColor }) {
  const isAvatar = entity.type === 'avatar'
  const entityCls = isAvatar ? cls : oCls

  return (
    <div
      className="overflow-hidden rounded-3xl"
      style={{
        border: `1px solid ${accentColor}33`,
        boxShadow: `0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px ${accentColor}11`,
      }}
    >
      {/* ── 3D viewport — same height, same container for both entities ── */}
      <div className="relative h-52 overflow-hidden" style={viewportBg(accentColor)}>
        {isAvatar ? (
          <AvatarViewport className="h-full w-full" />
        ) : (
          <MascotViewport className="h-full w-full" showEmotions />
        )}

        {/* Corner glow to bleed the accent color into the viewport */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 20% 90%, ${accentColor}22 0%, transparent 55%)` }}
        />

        {/* Class badge — bottom left of viewport */}
        {entityCls && (
          <div
            className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl px-3 py-1.5"
            style={{
              background: `${entityCls.color}28`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${entityCls.color}55`,
              boxShadow: `0 4px 16px ${entityCls.color}22`,
            }}
          >
            <span className="text-lg">{entityCls.icon}</span>
            <span className="text-xs font-black text-white">{entityCls.name}</span>
          </div>
        )}

        {/* Avatar icon OR mascot type — bottom right */}
        <div
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg px-2 py-1"
          style={{
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span className="text-base">{entity.icon}</span>
          <span className="text-[10px] font-bold text-white/60">{entity.label}</span>
        </div>
      </div>

      {/* ── Info bar — same layout for both entities ── */}
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
            <p className="truncate font-black text-text">
              {isAvatar ? avatar.label : entity.label}
            </p>
            {entityCls ? (
              <p className="mt-0.5 text-[10px] font-semibold" style={{ color: entityCls.color }}>
                {entityCls.icon} {entityCls.name}
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

// ─── AvatarClassInsigniaGrid ──────────────────────────────────────────────────
// Shows the player's class as the primary insignia and the linked Oliver class
// as a secondary card. Separated from Apariencia to prevent badge mixing.
function AvatarClassInsigniaGrid({ cls, oCls, navigate }) {
  if (!cls) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/40 p-8 text-center">
        <span className="text-5xl">🎴</span>
        <p className="font-black text-text">Sin clase asignada</p>
        <p className="text-sm text-text-muted">Completa la creación de cuenta para elegir tu clase RPG.</p>
        <button
          type="button"
          onClick={() => navigate('/crear-cuenta')}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-white transition hover:bg-primary/90 active:scale-95"
        >
          Crear cuenta
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Primary class insignia */}
      <div
        className="overflow-hidden rounded-3xl"
        style={{
          border: `1px solid ${cls.color}44`,
          background: `linear-gradient(145deg, ${cls.color}10, transparent)`,
          boxShadow: `0 8px 32px ${cls.color}12, inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        <div className="flex items-center gap-4 px-5 py-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${cls.color}33, ${cls.color}11)`,
              border: `2px solid ${cls.color}66`,
              boxShadow: `0 0 20px ${cls.color}33`,
            }}
          >
            {cls.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-lg font-black"
              style={{ color: cls.color, textShadow: `0 0 20px ${cls.color}66` }}
            >
              {cls.name}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">{cls.description}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div
          className="border-t px-5 py-4"
          style={{ borderColor: `${cls.color}22`, background: `${cls.color}08` }}
        >
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Estadísticas de clase
          </p>
          <div className="grid grid-cols-3 gap-x-6 gap-y-3 sm:grid-cols-5">
            {Object.entries(cls.stats).map(([stat, val]) => (
              <div key={stat} className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-wide text-text-muted">{stat}</span>
                <StatBar5 val={val} color={cls.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Passive aura */}
        <div
          className="border-t px-5 py-3"
          style={{ borderColor: `${cls.color}18`, background: `${cls.color}06` }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Aura pasiva</p>
          <p className="mt-1 text-sm font-semibold" style={{ color: cls.color }}>
            ✦ {cls.passiveAura?.replace(/_/g, ' ')}
          </p>
        </div>
      </div>

      {/* Linked Oliver class — secondary card */}
      {oCls && (
        <div
          className="flex items-center gap-4 rounded-2xl border px-5 py-4"
          style={{
            borderColor: `${oCls.color}33`,
            background: `${oCls.color}08`,
            boxShadow: `0 4px 16px ${oCls.color}0a`,
          }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
            style={{
              background: `${oCls.color}22`,
              border: `1.5px solid ${oCls.color}55`,
              boxShadow: `0 0 12px ${oCls.color}22`,
            }}
          >
            {oCls.icon}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              Clase de tu mascota (vinculada)
            </p>
            <p className="mt-0.5 text-sm font-black" style={{ color: oCls.color }}>{oCls.name}</p>
            <p className="text-xs text-text-muted">{oCls.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── AvatarApparelGrid ────────────────────────────────────────────────────────
// Pure visual skin/look selection for the avatar. No class badges here.
function AvatarApparelGrid({ avatarId, onSelect }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-text-muted">Aspecto visual</p>
        <p className="mt-1 text-xs text-text-muted">
          Elige la apariencia de tu avatar en el mundo VR. Solo cambia lo visual, nunca tu clase.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {PLAYER_AVATARS.map((av) => {
          const isActive = av.id === avatarId
          return (
            <button
              key={av.id}
              type="button"
              onClick={() => onSelect(av.id)}
              className="group relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all duration-200 hover:scale-105 hover:-translate-y-1 active:scale-95"
              style={{
                borderColor: isActive ? av.color : 'var(--color-border)',
                background: isActive
                  ? `linear-gradient(145deg, ${av.color}28, ${av.color}10)`
                  : 'var(--color-surface)',
                boxShadow: isActive
                  ? `0 0 20px ${av.color}44, 0 6px 16px ${av.color}22, inset 0 1px 0 rgba(255,255,255,0.08)`
                  : 'none',
              }}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-transform duration-200 group-hover:scale-110"
                style={{
                  background: isActive ? `${av.color}33` : `${av.color}14`,
                  border: `1px solid ${av.color}${isActive ? '66' : '33'}`,
                }}
              >
                {av.icon}
              </span>
              <span
                className="text-[10px] font-black"
                style={{ color: isActive ? av.color : 'var(--color-text-muted)' }}
              >
                {av.label}
              </span>
              {isActive && (
                <span
                  className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-black text-white"
                  style={{ background: av.color }}
                >✓</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Prompt sub-tab ───────────────────────────────────────────────────────────
function PromptTab({ displayName }) {
  const purchased          = useShopStore((s) => s.purchased)
  const customInstructions = useSettingsStore((s) => s.customInstructions)
  const setCustomInst      = useSettingsStore((s) => s.setCustomInstructions)

  const promptItems = SHOP_ITEMS.filter((i) => i.kind === 'ai-prompt' && purchased.includes(i.id))
  const activeItem  = promptItems.find((i) => i.promptText === customInstructions) ?? null

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-center gap-3 rounded-2xl border p-3"
        style={{
          borderColor: activeItem ? '#a855f744' : 'var(--color-border)',
          background:  activeItem ? '#a855f711' : 'var(--color-surface)',
        }}
      >
        <span className="text-2xl">{activeItem ? activeItem.icon : '🐱'}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">Personalidad activa</p>
          <p className="text-sm font-black text-text">
            {activeItem ? activeItem.name : `Tutor predeterminado de ${displayName}`}
          </p>
        </div>
        {activeItem && (
          <button
            type="button"
            onClick={() => setCustomInst(DEFAULT_CUSTOM_INSTRUCTIONS)}
            className="shrink-0 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-text-muted transition hover:border-red-400 hover:text-red-400"
          >
            Restablecer
          </button>
        )}
      </div>

      {promptItems.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/40 p-8 text-center">
          <span className="text-4xl">🧠</span>
          <p className="font-bold text-text">Sin personalidades desbloqueadas</p>
          <p className="text-sm text-text-muted">Compra personalidades de IA en la Tienda.</p>
          <button
            type="button"
            onClick={() => window.location.assign('/tienda')}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white"
          >
            Ir a la Tienda
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {promptItems.map((item) => {
            const isActive = item.id === activeItem?.id
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-2xl border p-4 transition-all duration-200"
                style={{
                  borderColor: isActive ? '#a855f799' : 'var(--color-border)',
                  background:  isActive ? '#a855f714' : 'var(--color-surface)',
                  boxShadow:   isActive ? '0 0 20px #a855f722, inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <span
                  className="shrink-0 rounded-xl p-1 text-3xl"
                  style={{ background: isActive ? '#a855f722' : 'var(--color-background)' }}
                >
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
                <button
                  type="button"
                  onClick={() =>
                    isActive
                      ? setCustomInst(DEFAULT_CUSTOM_INSTRUCTIONS)
                      : setCustomInst(item.promptText)
                  }
                  className="shrink-0 self-start rounded-xl px-3 py-1.5 text-xs font-black transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: isActive ? 'rgba(128,128,128,0.2)' : 'linear-gradient(135deg, #a855f7, #7c3aed)',
                    color: isActive ? 'var(--color-text-muted)' : '#fff',
                    boxShadow: isActive ? 'none' : '0 4px 12px #a855f744',
                  }}
                >
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

// ─── Unified EntityViewer ──────────────────────────────────────────────────────
// key={entity.id} in the parent resets local sub-tab state on entity switch.
function EntityViewer({ entity, navigate, displayMascotName, hasCamera }) {
  const playerClass = useGameStore((s) => s.player.class)
  const oliverClass = useGameStore((s) => s.oliver.class)
  const avatarId    = useGameStore((s) => s.player.avatarId)
  const setAvatar   = useGameStore((s) => s.setPlayerAvatar)
  const hp          = useGameStore((s) => s.player.hp)
  const energy      = useGameStore((s) => s.player.energy)

  const cls    = playerClass ? PLAYER_CLASSES[playerClass] : null
  const oCls   = oliverClass ? OLIVER_CLASSES[oliverClass] : null
  const avatar = PLAYER_AVATARS.find((a) => a.id === avatarId) || PLAYER_AVATARS[0]

  const isAvatar    = entity.type === 'avatar'
  const accentColor = isAvatar ? (cls?.color ?? avatar.color) : (oCls?.color ?? '#a855f7')

  const subTabIds = getSubTabsForEntity(entity.id, hasCamera)
  const tabs      = subTabIds.map((id) => ({ id, ...SUB_TAB_META[id] }))
  const [subTab, setSubTab] = useState(tabs[0].id)

  return (
    <div className="flex flex-col gap-5">

      {/* ── Hero card — identical layout for Avatar and Mascot ── */}
      <EntityHeroCard
        entity={entity}
        cls={cls}
        oCls={oCls}
        avatar={avatar}
        accentColor={accentColor}
      />

      {/* ── Sub-tab bar ── */}
      <SubTabBar tabs={tabs} active={subTab} onChange={setSubTab} accentColor={accentColor} />

      {/* ═══════════════════════════════════════════════════════════════════
          Sub-tab content — Avatar tabs
      ═══════════════════════════════════════════════════════════════════ */}

      {/* Avatar: Clase — class insignia + stats + linked oliver class */}
      {subTab === 'clase' && isAvatar && (
        <AvatarClassInsigniaGrid cls={cls} oCls={oCls} navigate={navigate} />
      )}

      {/* Avatar: Apariencia — purely visual skin/look selection */}
      {subTab === 'apariencia' && isAvatar && (
        <AvatarApparelGrid avatarId={avatarId} onSelect={setAvatar} />
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          Sub-tab content — shared by both entities
      ═══════════════════════════════════════════════════════════════════ */}

      {/* Habilidades — skill tree for the active entity's owner */}
      {subTab === 'habilidades' && <CharacterTree owner={entity.owner} />}

      {/* Objetos — full item inventory (same panel, both entities) */}
      {subTab === 'objetos' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Inventario de {isAvatar ? avatar.label : displayMascotName}
          </p>
          <ItemsPanel />
        </div>
      )}

      {/* Notas — notes and saved links */}
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

      {/* ═══════════════════════════════════════════════════════════════════
          Sub-tab content — Mascot-only tabs
      ═══════════════════════════════════════════════════════════════════ */}

      {/* Chat */}
      {subTab === 'chat' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Chat con {displayMascotName}
          </p>
          <ChatTab className="h-80" />
        </div>
      )}

      {/* Aspecto — mascot model + skin selector */}
      {subTab === 'aspecto' && (
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
            <p className="mt-1 text-xs text-text-muted">Solo cambia la apariencia. No afecta tu avatar.</p>
            <div className="mt-3"><SkinSelector /></div>
          </div>
        </div>
      )}

      {/* Prompt */}
      {subTab === 'prompt' && <PromptTab displayName={displayMascotName} />}

      {/* Libros */}
      {subTab === 'libros' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Libros de {displayMascotName}
          </p>
          <BooksPanel />
        </div>
      )}

      {/* Galería */}
      {subTab === 'galeria' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Galería de fotos</p>
          <GalleryPanel />
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MascotHomePage() {
  const navigate = useNavigate()

  const selectedMascotId   = useMascotStore((s) => s.selectedMascotId)
  const mascot             = getMascotById(selectedMascotId)
  const settingsMascotName = useSettingsStore((s) => s.mascotName)
  const coins              = useCurrencyStore((s) => s.coins)
  const hasCamera          = useShopStore((s) => s.purchased.includes('camara'))
  const playerClass        = useGameStore((s) => s.player.class)
  const oliverClass        = useGameStore((s) => s.oliver.class)
  const avatarId           = useGameStore((s) => s.player.avatarId)

  const displayMascotName = settingsMascotName || mascot.name
  const cls    = playerClass ? PLAYER_CLASSES[playerClass] : null
  const oCls   = oliverClass ? OLIVER_CLASSES[oliverClass] : null
  const avatar = PLAYER_AVATARS.find((a) => a.id === avatarId) || PLAYER_AVATARS[0]

  const entities    = buildEntities({ mascotName: displayMascotName, hasCamera })
  const [activeId, setActiveId] = useState(entities[0].id)
  const activeEntity = entities.find((e) => e.id === activeId) ?? entities[0]

  const accentColor = activeEntity.type === 'avatar'
    ? (cls?.color ?? avatar.color)
    : (oCls?.color ?? '#a855f7')

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <PageVideoModal pageKey="mascota" />

      {/* Page-level ambient gradient — shifts with active entity */}
      <div
        className="pointer-events-none absolute inset-x-0 top-14 h-72 opacity-[0.13] transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${accentColor} 0%, transparent 65%)`,
        }}
      />

      <main className="relative flex-1 px-4 py-6 md:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-text">Mi Equipo</h1>
              <p className="text-xs text-text-muted">Tu avatar y tu compañera de aventuras</p>
            </div>
            <CurrencyBadge amount={coins} />
          </div>

          {/* Dynamic entity switcher */}
          <div
            className="flex rounded-2xl border p-1.5"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-surface)',
              boxShadow: `0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
          >
            {entities.map((entity) => {
              const isActive = entity.id === activeId
              const eAccent  = entity.type === 'avatar' ? (cls?.color ?? avatar.color) : (oCls?.color ?? '#a855f7')
              const eClass   = entity.type === 'avatar' ? cls : oCls
              return (
                <button
                  key={entity.id}
                  type="button"
                  onClick={() => setActiveId(entity.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-300"
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${eAccent}ee, ${eAccent}aa)`,
                    color: '#fff',
                    boxShadow: `0 4px 20px ${eAccent}55, inset 0 1px 0 rgba(255,255,255,0.15)`,
                  } : { color: 'var(--color-text-muted)' }}
                >
                  <span>{entity.icon}</span>
                  <span>{entity.label}</span>
                  {eClass && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${isActive ? 'bg-white/20' : 'bg-black/10'}`}
                    >
                      {eClass.icon}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Unified viewer — key resets sub-tab state on entity switch */}
          <EntityViewer
            key={activeId}
            entity={activeEntity}
            navigate={navigate}
            displayMascotName={displayMascotName}
            hasCamera={hasCamera}
          />
        </div>
      </main>
    </div>
  )
}
