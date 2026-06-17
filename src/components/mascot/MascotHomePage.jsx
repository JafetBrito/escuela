import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import PageVideoModal from '../shared/PageVideoModal'
import MascotViewport from './MascotViewport'
import ItemsPanel from './ItemsPanel'
import BooksPanel from './BooksPanel'
import GalleryPanel from './GalleryPanel'
import AppearancePanel from './AppearancePanel'
import Inventory from '../inventory/Inventory'
import ChatTab from './ChatTab'
import CurrencyBadge from '../shared/CurrencyBadge'
import XpBar from '../shared/XpBar'
import { useMascotStore } from '../../stores/useMascotStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useShopStore } from '../../stores/useShopStore'
import { useGameStore, PLAYER_CLASSES, OLIVER_CLASSES } from '../../stores/useGameStore'
import { getSkillById } from '../../data/skillRegistry'
import { getMascotById } from '../../data/mascotRegistry'

// ─── Tab bar ────────────────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-2 text-xs font-medium transition-colors sm:text-sm ${
            active === t.id ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'
          }`}
        >
          <span>{t.icon}</span>
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}

// ─── Oliver section ─────────────────────────────────────────────────────────
const OLIVER_TABS_BASE = [
  { id: 'chat',       label: 'Chat',    icon: '💬' },
  { id: 'items',      label: 'Objetos', icon: '🎒' },
  { id: 'books',      label: 'Libros',  icon: '📚' },
  { id: 'notes',      label: 'Notas',   icon: '📝' },
  { id: 'appearance', label: 'Aspecto', icon: '🎨' },
  { id: 'gallery',    label: 'Galería', icon: '🖼️' },
]

function OliverSection({ displayName, hasCamera }) {
  const [tab, setTab] = useState('chat')
  const TABS = hasCamera ? OLIVER_TABS_BASE : OLIVER_TABS_BASE.filter(t => t.id !== 'gallery')

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/60 p-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🐱</span>
        <div>
          <h2 className="font-black text-text">Oliver</h2>
          <p className="text-xs text-text-muted">Tu mascota y compañera de aventuras</p>
        </div>
      </div>

      {/* 3D viewport */}
      <div className="overflow-hidden rounded-xl border border-border bg-gradient-to-b from-surface to-background">
        <MascotViewport className="h-52 w-full" showEmotions />
        <div className="border-t border-border bg-surface px-4 py-2.5">
          <XpBar />
        </div>
      </div>

      {/* Tabs */}
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {/* Tab content */}
      {tab === 'chat' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Chat con {displayName}</p>
          <ChatTab className="h-80" />
        </div>
      )}
      {tab === 'items' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Objetos de {displayName}</p>
          <ItemsPanel />
        </div>
      )}
      {tab === 'books' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Libros de {displayName}</p>
          <BooksPanel />
        </div>
      )}
      {tab === 'notes' && (
        <div className="tech-panel flex flex-col gap-3 p-4">
          <p className="tech-label">// Notas y enlaces guardados</p>
          <Inventory />
        </div>
      )}
      {tab === 'appearance' && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <AppearancePanel />
        </div>
      )}
      {tab === 'gallery' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Galería de fotos</p>
          <GalleryPanel />
        </div>
      )}
    </section>
  )
}

// ─── Skill tree ─────────────────────────────────────────────────────────────
const SKILL_TREE_TIERS = {
  programmer:       [['fast_compile','debug_pulse'],[null,null],[null,null]],
  cyber_strategist: [['tactical_scan','proxy_veil'],[null,null],[null,null]],
  ai_engineer:      [['model_inference','data_weave'],[null,null],[null,null]],
  designer:         [['visual_burst','form_shift'],[null,null],[null,null]],
  philosopher:      [['socratic_parry','axiom_pulse'],[null,null],[null,null]],
}

const TIER_LOCKED_LABELS = [
  [{ name: 'Ataque II',   icon: '⚔️' }, { name: 'Escudo',      icon: '🛡️' }],
  [{ name: 'Técnica X',   icon: '🌀' }, { name: 'Aura Élite',  icon: '👑' }],
]

function SkillTree({ classId, unlockedSkills }) {
  const cls    = PLAYER_CLASSES[classId]
  const tiers  = SKILL_TREE_TIERS[classId] ?? []

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Árbol de habilidades</p>

      <div className="relative overflow-x-auto rounded-xl border border-border bg-background p-4">
        <div className="flex items-stretch gap-3">
          {tiers.map((tier, ti) => (
            <div key={ti} className="flex flex-col items-center gap-2">
              <span className="mb-1 text-[9px] font-bold uppercase tracking-widest"
                style={{ color: ti === 0 ? cls.color : 'var(--color-text-muted)' }}>
                {ti === 0 ? 'Base' : `Nivel ${ti * 5}`}
              </span>

              {tier.map((skillId, si) => {
                if (skillId) {
                  const skill = getSkillById(skillId)
                  const isUnlocked = unlockedSkills.includes(skillId)
                  return (
                    <div key={si}
                      className="flex w-20 flex-col items-center gap-1 rounded-xl border p-2 text-center transition-all"
                      style={{
                        borderColor: isUnlocked ? `${skill.vfxColor}88` : 'var(--color-border)',
                        background: isUnlocked ? `${skill.vfxColor}12` : 'transparent',
                        opacity: isUnlocked ? 1 : 0.45,
                      }}
                    >
                      <span className="text-2xl">{skill.icon}</span>
                      <p className="text-[9px] font-bold leading-tight text-text">{skill.name}</p>
                      {isUnlocked
                        ? <span className="text-[8px] font-bold" style={{ color: cls.color }}>✓ Activa</span>
                        : <span className="text-[8px] text-text-muted">🔒</span>
                      }
                    </div>
                  )
                }
                const locked = TIER_LOCKED_LABELS[ti - 1]?.[si] ?? { name: 'Pronto', icon: '❔' }
                return (
                  <div key={si}
                    className="flex w-20 flex-col items-center gap-1 rounded-xl border border-border bg-background p-2 text-center opacity-30">
                    <span className="text-2xl">{locked.icon}</span>
                    <p className="text-[9px] font-bold leading-tight text-text-muted">{locked.name}</p>
                    <span className="text-[8px] text-text-muted">🔒 Nv.{ti * 5}</span>
                  </div>
                )
              })}
            </div>
          ).concat(
            // arrows between tiers
            ti < tiers.length - 1 ? [
              <div key={`arr-${ti}`} className="mt-7 flex flex-col items-center justify-center self-center text-text-muted/40">
                <span className="text-lg">→</span>
              </div>
            ] : []
          ))}
        </div>
      </div>

      <p className="text-xs text-text-muted">
        Las subclases y habilidades avanzadas se desbloquean conforme subes de nivel en el campus.
      </p>
    </div>
  )
}

// ─── Player section ─────────────────────────────────────────────────────────
const PLAYER_TABS = [
  { id: 'clase',       label: 'Clase',       icon: '⚔️' },
  { id: 'arbol',       label: 'Árbol',       icon: '🌿' },
  { id: 'habilidades', label: 'Habilidades', icon: '✨' },
  { id: 'apariencia',  label: 'Apariencia',  icon: '🎨' },
]

function StatBar5({ val, color }) {
  return (
    <div className="flex flex-col-reverse gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-2 w-3 rounded-sm"
          style={{ background: i < val ? color : 'rgba(128,128,128,0.12)' }}
        />
      ))}
    </div>
  )
}

function PlayerSection({ navigate }) {
  const [tab, setTab] = useState('clase')
  const playerClass = useGameStore(s => s.player.class)
  const oliverClass = useGameStore(s => s.oliver.class)
  const hp          = useGameStore(s => s.player.hp)
  const energy      = useGameStore(s => s.player.energy)
  const skills      = useGameStore(s => s.player.skills)

  const cls  = playerClass ? PLAYER_CLASSES[playerClass] : null
  const oCls = oliverClass ? OLIVER_CLASSES[oliverClass] : null

  const noClass = !cls

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/60 p-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">⚔️</span>
        <div>
          <h2 className="font-black text-text">Tu Personaje</h2>
          <p className="text-xs text-text-muted">Clase RPG y habilidades del campus</p>
        </div>
      </div>

      {/* Class identity card */}
      {noClass ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-background p-6 text-center">
          <span className="text-5xl">🌳</span>
          <p className="font-bold text-text">Sin clase asignada</p>
          <p className="text-sm text-text-muted">
            Ve al campus VR — el Árbol del Mundo te espera para elegir tu destino.
          </p>
          <button
            type="button"
            onClick={() => navigate('/vr/world-tree')}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-background transition-colors hover:bg-primary-hover"
          >
            🌳 Ir al Árbol del Mundo
          </button>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-xl border"
          style={{ borderColor: `${cls.color}44` }}
        >
          {/* Class header */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ background: `linear-gradient(135deg, ${cls.color}22, ${cls.color}08)` }}
          >
            <span className="text-5xl">{cls.icon}</span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-black text-text">{cls.name}</p>
                {oCls && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: `${oCls.color}33`, color: oCls.color }}
                  >
                    {oCls.icon} Oliver: {oCls.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted">{cls.description}</p>
            </div>
          </div>

          {/* HP/Energy bars */}
          <div className="grid grid-cols-2 gap-3 px-4 py-3">
            {[
              { label: 'HP',       cur: hp.current,     max: hp.max,     color: '#ef4444' },
              { label: 'Energía',  cur: energy.current, max: energy.max, color: '#22c55e' },
            ].map(({ label, cur, max, color }) => {
              const pct = Math.max(0, Math.min(1, cur / max))
              return (
                <div key={label} className="flex flex-col gap-0.5">
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span className="font-bold uppercase tracking-wider">{label}</span>
                    <span>{cur}/{max}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/20">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct * 100}%`, background: color, boxShadow: `0 0 4px ${color}88` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tabs — only shown when class is assigned */}
      {!noClass && (
        <>
          <TabBar tabs={PLAYER_TABS} active={tab} onChange={setTab} />

          {/* Clase tab */}
          {tab === 'clase' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Estadísticas de clase</p>
              <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-background p-4">
                {Object.entries(cls.stats).map(([stat, val]) => (
                  <div key={stat} className="flex flex-col items-center gap-1">
                    <StatBar5 val={val} color={cls.color} />
                    <span className="text-[9px] font-bold uppercase text-text-muted">{stat.slice(0, 3)}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Aura pasiva</p>
              <div className="rounded-xl border border-border bg-background p-3">
                <p className="text-sm text-text">{cls.passiveAura?.replace(/_/g, ' ')}</p>
              </div>
            </div>
          )}

          {/* Árbol tab */}
          {tab === 'arbol' && (
            <SkillTree classId={playerClass} unlockedSkills={skills.unlocked} />
          )}

          {/* Habilidades tab */}
          {tab === 'habilidades' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Habilidades equipadas</p>
              <div className="grid grid-cols-2 gap-2">
                {skills.equipped.map((sid, i) => {
                  const skill = sid ? getSkillById(sid) : null
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-xl border p-3"
                      style={skill ? {
                        borderColor: `${skill.vfxColor}44`,
                        background: `${skill.vfxColor}08`,
                      } : { borderColor: 'var(--color-border)' }}
                    >
                      {skill ? (
                        <>
                          <span className="text-2xl">{skill.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-text truncate">{skill.name}</p>
                            <p className="text-[10px] text-text-muted truncate">{skill.description}</p>
                            <p className="mt-0.5 text-[9px] text-text-muted">
                              CD {(skill.cooldownMs / 1000).toFixed(1)}s · {skill.energyCost} EN
                            </p>
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-text-muted">Slot {i + 1} vacío</span>
                      )}
                    </div>
                  )
                })}
              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Habilidades desbloqueadas</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.unlocked.length === 0 ? (
                  <p className="text-xs text-text-muted">Ninguna desbloqueada todavía.</p>
                ) : skills.unlocked.map((sid) => {
                  const skill = getSkillById(sid)
                  return skill ? (
                    <span
                      key={sid}
                      className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
                      style={{ borderColor: `${skill.vfxColor}44`, color: skill.vfxColor }}
                    >
                      {skill.icon} {skill.name}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )}

          {/* Apariencia tab */}
          {tab === 'apariencia' && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <AppearancePanel />
            </div>
          )}
        </>
      )}
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function MascotHomePage() {
  const navigate = useNavigate()
  const selectedMascotId  = useMascotStore(s => s.selectedMascotId)
  const mascot            = getMascotById(selectedMascotId)
  const settingsMascotName = useSettingsStore(s => s.mascotName)
  const coins             = useCurrencyStore(s => s.coins)
  const hasCamera         = useShopStore(s => s.purchased.includes('camara'))

  const displayName = settingsMascotName || mascot.name

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-violet-500/15 via-background to-primary/10 text-text">
      <AppTopBar />
      <PageVideoModal pageKey="mascota" />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {/* Page header */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold">Mi Equipo</h1>
              <p className="mt-1 text-sm text-text-muted">Oliver y tu personaje RPG.</p>
            </div>
            <CurrencyBadge amount={coins} />
          </div>

          {/* Oliver — top */}
          <OliverSection displayName={displayName} hasCamera={hasCamera} />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs font-bold uppercase tracking-widest text-text-muted">⚔️ Tu personaje</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Player — below Oliver */}
          <PlayerSection navigate={navigate} />
        </div>
      </main>
    </div>
  )
}
