import MascotViewport from './MascotViewport'
import ChatTab from './ChatTab'
import BooksPanel from './BooksPanel'
import MascotSelector from './MascotSelector'
import SkinSelector from './SkinSelector'
import AvatarApparelGrid from './AvatarApparelGrid'
import CharacterTree from '../skills/CharacterTree'
import CharacterPaperdoll, { CharacterStats } from '../skills/CharacterPaperdoll'
import { EquipmentBagGrid } from '../vr/BagsPanel'
import Inventory from '../inventory/Inventory'
import LevelBadge from '../shared/LevelBadge'
import CurrencyBadge from '../shared/CurrencyBadge'
import { useMascotStore } from '../../stores/useMascotStore'
import { useMascotCompanionStore } from '../../stores/useMascotCompanionStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useGameStore, PLAYER_CLASSES, OLIVER_CLASSES, PLAYER_AVATARS } from '../../stores/useGameStore'
import { getMascotById } from '../../data/mascotRegistry'

// ─── N48 ─────────────────────────────────────────────────────────────────────
// Two top-level tabs — Avatar (your player character) and Mascota (Oliver) —
// each with the same WoW-style character-pane sub-tabs: Personaje (3D model
// + equipped gear), Árbol (skills), Bolsas (equip grid), Apariencia, Libros,
// Notas, Estadísticas. Mascota gets an extra Chat sub-tab. In VR (`vrMode`
// prop) the Avatar/Mascota switcher is hidden and the entity is locked to
// whichever button opened the menu (paw button = mascota, portrait = avatar)
// — see `lockedEntity` in useMascotCompanionStore. `panel` in the store is
// `"${entityId}-${subTabId}"`.
const ENTITY_TABS = [
  { id: 'avatar', label: 'Avatar', icon: '⚔️', owner: 'player' },
  { id: 'mascota', label: 'Mascota', icon: '🐾', owner: 'oliver' },
]

const SUB_TABS_AVATAR = [
  { id: 'personaje', label: 'Personaje', icon: '🧑' },
  { id: 'arbol', label: 'Árbol', icon: '🌳' },
  { id: 'bolsas', label: 'Bolsas', icon: '🎒' },
  { id: 'apariencia', label: 'Apariencia', icon: '🎨' },
  { id: 'libros', label: 'Libros', icon: '📚' },
  { id: 'notas', label: 'Notas', icon: '📝' },
  { id: 'estadisticas', label: 'Estadísticas', icon: '📊' },
]
const SUB_TABS_MASCOTA = [...SUB_TABS_AVATAR, { id: 'chat', label: 'Chat', icon: '💬' }]

// Courses for an audience the RPG layer (avatar/clases/equipo/XP) would only
// confuse — these get a "modo serio" with just Chat + Libros, no Avatar tab,
// no missions (the class resources + video are enough).
const SIMPLE_MODE_COURSES = new Set(['course-claude-mayores'])
const SUB_TABS_SIMPLE = [
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'libros', label: 'Libros', icon: '📚' },
]

export default function MascotCompanion({ courseId, module, hideViewport = false, vrMode = false }) {
  const open = useMascotCompanionStore((s) => s.open)
  const setOpen = useMascotCompanionStore((s) => s.setOpen)
  const openLocked = useMascotCompanionStore((s) => s.openLocked)
  const panel = useMascotCompanionStore((s) => s.panel)
  const setPanel = useMascotCompanionStore((s) => s.setPanel)
  const lockedEntity = useMascotCompanionStore((s) => s.lockedEntity)

  const simpleMode = SIMPLE_MODE_COURSES.has(courseId)
  const [entityId, rawSubTab] = panel.split('-')
  const entity = simpleMode
    ? ENTITY_TABS[1]
    : (ENTITY_TABS.find((e) => e.id === (lockedEntity ?? entityId)) ?? ENTITY_TABS[0])
  const isAvatarEntity = entity.id === 'avatar'
  const subTabs = simpleMode ? SUB_TABS_SIMPLE : (isAvatarEntity ? SUB_TABS_AVATAR : SUB_TABS_MASCOTA)
  const subTab = subTabs.some((t) => t.id === rawSubTab) ? rawSubTab : subTabs[0].id

  const setEntity = (id) => {
    const fallback = subTab === 'chat' && id === 'avatar' ? 'personaje' : subTab
    setPanel(`${id}-${fallback}`)
  }
  const setSubTab = (id) => setPanel(`${entity.id}-${id}`)
  // In VR, the paw button always opens mascota-only and the portrait click
  // (see VrHud/VRPage) calls openLocked('avatar-personaje', 'avatar') —
  // toggling the SAME open button here just closes it again.
  const handlePawClick = () => {
    if (vrMode) {
      if (open) setOpen(false)
      else openLocked('mascota-personaje', 'mascota')
    } else {
      setOpen(!open)
    }
  }

  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const mascot = getMascotById(selectedMascotId)
  const settingsMascotName = useSettingsStore((s) => s.mascotName)
  const coins = useCurrencyStore((s) => s.coins)
  const displayName = settingsMascotName || mascot.name

  const playerClass = useGameStore((s) => s.player.class)
  const oliverClass = useGameStore((s) => s.oliver.class)
  const avatarId = useGameStore((s) => s.player.avatarId)
  const setAvatar = useGameStore((s) => s.setPlayerAvatar)
  const cls = playerClass ? PLAYER_CLASSES[playerClass] : null
  const oCls = oliverClass ? OLIVER_CLASSES[oliverClass] : null
  const avatar = PLAYER_AVATARS.find((a) => a.id === avatarId) || PLAYER_AVATARS[0]

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div className="flex h-[80vh] w-[95vw] max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          {/* Header */}
          <div className="flex flex-col gap-2 border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!simpleMode && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-mono font-black text-primary" title="Sistema N48">
                    N48
                  </span>
                )}
                <p className="text-base font-bold text-text">{displayName}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text" aria-label="Cerrar">
                ✕
              </button>
            </div>
            {!simpleMode && (
              <div className="flex flex-wrap items-center gap-2">
                <LevelBadge />
                <CurrencyBadge amount={coins} />
              </div>
            )}
          </div>

          {/* Entity tabs: Avatar | Mascota — hidden when locked to one entity (VR) */}
          {!simpleMode && !lockedEntity && (
            <div className="flex gap-1 px-3 pt-2.5">
              {ENTITY_TABS.map((t) => {
                const isActive = t.id === entity.id
                const eCls = t.id === 'avatar' ? cls : oCls
                const eColor = t.id === 'avatar' ? (cls?.color ?? avatar.color) : (oCls?.color ?? '#a855f7')
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setEntity(t.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-bold transition-all"
                    style={isActive ? { background: eColor, color: '#fff' } : { color: 'var(--color-text-muted)' }}
                  >
                    <span>{t.icon}</span>
                    <span>{t.id === 'mascota' ? displayName : t.label}</span>
                    {eCls && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${isActive ? 'bg-white/20' : 'bg-black/10'}`}>
                        {eCls.icon}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Sub-tabs */}
          <div className="flex gap-1 overflow-x-auto px-3 pb-2.5 pt-2 text-sm">
            {subTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  subTab === t.id ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto border-t border-border p-4">
            {subTab === 'personaje' && <CharacterPaperdoll owner={entity.owner} />}

            {subTab === 'arbol' && <CharacterTree owner={entity.owner} hideEquipment />}

            {subTab === 'apariencia' && (
              isAvatarEntity ? (
                <AvatarApparelGrid avatarId={avatarId} onSelect={setAvatar} />
              ) : (
                <div className="flex flex-col gap-6">
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted">Modelo 3D</p>
                    <MascotSelector />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted">Atuendo</p>
                    <SkinSelector />
                  </div>
                </div>
              )
            )}

            {subTab === 'misiones' && (
              <MissionsTab courseId={courseId} module={module} onGoToChat={() => setSubTab('chat')} />
            )}

            {subTab === 'bolsas' && (
              <div className="flex flex-col gap-2">
                <EquipmentBagGrid owner={entity.owner} />
                <p className="text-center text-[10px] text-text-muted">Toca un objeto para equiparlo o quitarlo.</p>
              </div>
            )}

            {subTab === 'notas' && <Inventory className="h-full" />}

            {subTab === 'estadisticas' && <CharacterStats owner={entity.owner} />}

            {subTab === 'libros' && <BooksPanel />}

            {subTab === 'chat' && <ChatTab courseId={courseId} module={module} className="h-full" />}
          </div>
        </div>
      )}

      <button
        onClick={handlePawClick}
        className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-surface shadow-lg transition-transform hover:scale-105 sm:h-24 sm:w-24"
        aria-label="Abrir mascota"
      >
        {hideViewport ? (
          <span className="text-3xl sm:text-4xl">🐾</span>
        ) : (
          <MascotViewport className="h-full w-full" />
        )}
      </button>
    </div>
  )
}
