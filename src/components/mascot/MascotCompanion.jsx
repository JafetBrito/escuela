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
import MissionsTab from './MissionsTab'
import TechDexPanel from './TechDexPanel'
import CodicePanel from './CodicePanel'
import ToolsPanel from './ToolsPanel'
import ObjetosBagPanel from './ObjetosBagPanel'
import { useMascotStore } from '../../stores/useMascotStore'
import { useMascotCompanionStore } from '../../stores/useMascotCompanionStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useGameStore, PLAYER_CLASSES, OLIVER_CLASSES, PLAYER_AVATARS } from '../../stores/useGameStore'
import { getMascotById } from '../../data/mascotRegistry'

const ENTITY_TABS = [
  { id: 'avatar',  label: 'Avatar',  icon: '⚔️', owner: 'player' },
  { id: 'mascota', label: 'Mascota', icon: '🐾', owner: 'oliver' },
]

// Tabs shown when the companion is inside a course — mascota-only, learning-focused.
// Sin 'apariencia' (eso vive en el menú global de mascota, no en cursos).
const SUB_TABS_COURSE = [
  { id: 'chat',      label: 'Chat',      icon: '💬' },
  { id: 'misiones',  label: 'Misiones',  icon: '🎯' },
  { id: 'ficha',     label: 'Ficha',     icon: '📟' },  // Tech-Dex / Bestiario de Código
  { id: 'registros', label: 'Registros', icon: '📜' },  // Audio-Logs / Códice
  { id: 'bolsas',    label: 'Objetos',   icon: '🎒' },
  { id: 'libros',    label: 'Libros',    icon: '📚' },
  { id: 'notas',     label: 'Notas',     icon: '📝' },
  { id: 'tools',     label: 'Tools',     icon: '🔧' },
]

// Tabs shown fuera de VR (curso o página normal como el Dashboard) — mascota
// bloqueada, sin mezclar con el avatar. Como SUB_TABS_COURSE pero sin Ficha /
// Registros (contenido de curso) y con Apariencia + misiones globales.
const SUB_TABS_MASCOT_ONLY = [
  { id: 'chat',       label: 'Chat',       icon: '💬' },
  { id: 'misiones',   label: 'Misiones',   icon: '🎯' },
  { id: 'bolsas',     label: 'Objetos',    icon: '🎒' },
  { id: 'apariencia', label: 'Apariencia', icon: '🎨' },
  { id: 'libros',     label: 'Libros',     icon: '📚' },
  { id: 'notas',      label: 'Notas',      icon: '📝' },
]

const SUB_TABS_AVATAR = [
  { id: 'personaje',  label: 'Personaje', icon: '🧑' },
  { id: 'arbol',      label: 'Árbol',     icon: '🌳' },
  { id: 'bolsas',     label: 'Bolsas',    icon: '🎒' },
  { id: 'apariencia', label: 'Apariencia',icon: '🎨' },
  { id: 'libros',     label: 'Libros',    icon: '📚' },
  { id: 'notas',      label: 'Notas',     icon: '📝' },
  { id: 'estadisticas',label:'Estadísticas',icon:'📊'},
]
const SUB_TABS_MASCOTA = [
  ...SUB_TABS_AVATAR,
  { id: 'misiones',  label: 'Misiones',  icon: '🎯' },
  { id: 'chat',      label: 'Chat',      icon: '💬' },
]

// Simple mode for non-RPG audiences (e.g. claude-mayores)
const SIMPLE_MODE_COURSES = new Set(['course-claude-mayores'])
const SUB_TABS_SIMPLE = [
  { id: 'chat',   label: 'Chat',   icon: '💬' },
  { id: 'libros', label: 'Libros', icon: '📚' },
]

export default function MascotCompanion({ courseId, module, hideViewport = false, vrMode = false }) {
  const open         = useMascotCompanionStore((s) => s.open)
  const setOpen      = useMascotCompanionStore((s) => s.setOpen)
  const openLocked   = useMascotCompanionStore((s) => s.openLocked)
  const panel        = useMascotCompanionStore((s) => s.panel)
  const setPanel     = useMascotCompanionStore((s) => s.setPanel)
  const lockedEntity = useMascotCompanionStore((s) => s.lockedEntity)

  const simpleMode  = SIMPLE_MODE_COURSES.has(courseId)
  // In course context: always show mascota, hide the Avatar/Mascota switcher
  const isCourseMode = Boolean(courseId) && !vrMode && !simpleMode
  // Fuera de VR (curso o página normal como el Dashboard): siempre mascota,
  // nunca se mezcla con el avatar. Solo en VR tiene sentido el switcher
  // Avatar/Mascota (controlas a uno u otro en el mundo).
  const isMascotOnly = !vrMode && !simpleMode

  const [entityId, rawSubTab] = panel.split('-')

  const entity = simpleMode
    ? ENTITY_TABS[1]
    : isMascotOnly
      ? ENTITY_TABS[1]   // mascota locked fuera de VR
      : (ENTITY_TABS.find((e) => e.id === (lockedEntity ?? entityId)) ?? ENTITY_TABS[1])

  const isAvatarEntity = entity.id === 'avatar'

  const subTabs = simpleMode
    ? SUB_TABS_SIMPLE
    : isCourseMode
      ? SUB_TABS_COURSE
      : isMascotOnly
        ? SUB_TABS_MASCOT_ONLY
        : (isAvatarEntity ? SUB_TABS_AVATAR : SUB_TABS_MASCOTA)

  const subTab = subTabs.some((t) => t.id === rawSubTab) ? rawSubTab : subTabs[0].id

  const setEntity = (id) => {
    const fallback = subTab === 'chat' && id === 'avatar' ? 'personaje' : subTab
    setPanel(`${id}-${fallback}`)
  }
  const setSubTab = (id) => setPanel(`${entity.id}-${id}`)

  const handlePawClick = () => {
    if (vrMode) {
      if (open) setOpen(false)
      else openLocked('mascota-personaje', 'mascota')
    } else {
      setOpen(!open)
    }
  }

  const selectedMascotId  = useMascotStore((s) => s.selectedMascotId)
  const mascot            = getMascotById(selectedMascotId)
  const settingsMascotName= useSettingsStore((s) => s.mascotName)
  const coins             = useCurrencyStore((s) => s.coins)
  const displayName       = settingsMascotName || mascot.name

  const playerClass = useGameStore((s) => s.player.class)
  const oliverClass = useGameStore((s) => s.oliver.class)
  const avatarId    = useGameStore((s) => s.player.avatarId)
  const setAvatar   = useGameStore((s) => s.setPlayerAvatar)
  const cls         = playerClass ? PLAYER_CLASSES[playerClass] : null
  const oCls        = oliverClass ? OLIVER_CLASSES[oliverClass] : null
  const avatar      = PLAYER_AVATARS.find((a) => a.id === avatarId) || PLAYER_AVATARS[0]

  return (
    // bottom-20 en móvil: la barra de pestañas inferior del Dashboard
    // (DashboardPage.jsx) solo se oculta a partir de md — con bottom-4/sm:bottom-6
    // la mascota le quedaba encima entre 0-767px. Coincide con ese mismo breakpoint.
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {open && (
        <div className="flex h-[80vh] w-[95vw] max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          {/* Header */}
          <div className="flex flex-col gap-2 border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!simpleMode && !isCourseMode && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-mono font-black text-primary" title="Sistema N48">
                    N48
                  </span>
                )}
                {isCourseMode && (
                  <span className="text-lg">🐾</span>
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

          {/* Entity tabs — solo en VR (fuera de VR la mascota queda fija) */}
          {!simpleMode && !lockedEntity && !isMascotOnly && (
            <div className="flex gap-1 px-3 pt-2.5">
              {ENTITY_TABS.map((t) => {
                const isActive = t.id === entity.id
                const eCls    = t.id === 'avatar' ? cls : oCls
                const eColor  = t.id === 'avatar' ? (cls?.color ?? avatar.color) : (oCls?.color ?? '#a855f7')
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
            {subTab === 'personaje'    && <CharacterPaperdoll owner={entity.owner} />}
            {subTab === 'arbol'        && <CharacterTree owner={entity.owner} hideEquipment />}
            {subTab === 'estadisticas' && <CharacterStats owner={entity.owner} />}
            {subTab === 'libros'       && <BooksPanel />}
            {subTab === 'notas'        && <Inventory className="h-full" />}

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
              <MissionsTab courseId={courseId} module={module} courseOnly={isCourseMode} onGoToChat={() => setSubTab('chat')} />
            )}

            {subTab === 'ficha'     && <TechDexPanel courseId={courseId} module={module} />}
            {subTab === 'registros' && <CodicePanel module={module} />}
            {subTab === 'tools'     && <ToolsPanel courseId={courseId} />}

            {subTab === 'bolsas' && (
              isMascotOnly ? (
                // Fuera de VR, "Objetos" muestra lo comprado en la Tienda + recompensas.
                <ObjetosBagPanel onActivate={() => setOpen(false)} />
              ) : (
                <div className="flex flex-col gap-2">
                  <EquipmentBagGrid owner={entity.owner} />
                  <p className="text-center text-[10px] text-text-muted">Toca un objeto para equiparlo o quitarlo.</p>
                </div>
              )
            )}

            {subTab === 'chat' && (
              <ChatTab courseId={courseId} module={module} className="h-full" />
            )}
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
