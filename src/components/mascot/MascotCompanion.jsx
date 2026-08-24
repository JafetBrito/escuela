import { useRef, useState } from 'react'
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
import FourthWallPhone from '../vr/FourthWallPhone'
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

// Antes Avatar y Mascota tenían listas de pestañas DISTINTAS — Avatar no
// traía Misiones ni Chat, así que había que cambiar a la pestaña Mascota
// solo para verlas, aunque misiones/chat/bolsas no son cosas "de un
// personaje", son de la cuenta. Ahora ambas entidades muestran el mismo
// menú completo — lo único que cambia por entidad es el contenido de cada
// pestaña (CharacterPaperdoll/CharacterTree/CharacterStats/Bolsas ya leen
// `entity.owner` para eso), no cuáles pestañas existen.
const SUB_TABS_FULL = [
  { id: 'personaje',  label: 'Personaje', icon: '🧑' },
  { id: 'arbol',      label: 'Árbol',     icon: '🌳' },
  { id: 'apariencia', label: 'Apariencia',icon: '🎨' },
  { id: 'estadisticas',label:'Estadísticas',icon:'📊'},
  { id: 'bolsas',     label: 'Bolsas',    icon: '🎒' },
  { id: 'misiones',   label: 'Misiones',  icon: '🎯' },
  { id: 'chat',       label: 'Chat',      icon: '💬' },
  { id: 'libros',     label: 'Libros',    icon: '📚' },
  { id: 'notas',      label: 'Notas',     icon: '📝' },
  { id: '4pared',     label: '4 Pared',   icon: '📱' },
]
const SUB_TABS_AVATAR = SUB_TABS_FULL
const SUB_TABS_MASCOTA = SUB_TABS_FULL

// Simple mode for non-RPG audiences (e.g. claude-mayores)
const SIMPLE_MODE_COURSES = new Set(['course-claude-mayores'])
const SUB_TABS_SIMPLE = [
  { id: 'chat',   label: 'Chat',   icon: '💬' },
  { id: 'libros', label: 'Libros', icon: '📚' },
]

// Posición arrastrada de la burbuja colapsada — persistida por dispositivo
// (localStorage, no la cuenta: es una preferencia de pantalla, mismo
// criterio que courseTrack.js). "Ocultar" en cambio usa sessionStorage a
// propósito: se pidió poder quitarla de en medio, pero que desaparezca para
// siempre sin ninguna forma de regresarla sería peor — vuelve a aparecer en
// la próxima carga de página.
const BUBBLE_POS_KEY = 'mascotBubblePos'
const BUBBLE_HIDDEN_KEY = 'mascotBubbleHidden'
const BUBBLE_SIZE = 96 // aprox. h-24 en desktop; suficiente para el clamp, no necesita ser exacto

function loadBubblePos() {
  try {
    const raw = localStorage.getItem(BUBBLE_POS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function clampBubblePos(right, bottom) {
  const maxRight = Math.max(0, window.innerWidth - BUBBLE_SIZE)
  const maxBottom = Math.max(0, window.innerHeight - BUBBLE_SIZE)
  return { right: Math.min(Math.max(right, 0), maxRight), bottom: Math.min(Math.max(bottom, 0), maxBottom) }
}

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
    // Ya no hace falta forzar 'personaje' al entrar a Avatar viniendo de
    // Chat — ahora Avatar también tiene pestaña Chat (ver SUB_TABS_FULL).
    setPanel(`${id}-${subTab}`)
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

  // Arrastrar y ocultar la burbuja colapsada — pedido explícito tras
  // reportar que tapaba contenido de la clase en móvil. Solo aplica cuando
  // el panel está cerrado (con el panel abierto, ya tiene su propio botón
  // ✕ para cerrarlo, y arrastrar un panel grande de 80vh es otro problema).
  const [bubblePos, setBubblePos] = useState(loadBubblePos)
  const [bubbleHidden, setBubbleHidden] = useState(() => sessionStorage.getItem(BUBBLE_HIDDEN_KEY) === '1')
  const dragRef = useRef({ dragging: false, moved: false })

  const onBubblePointerDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    dragRef.current = {
      dragging: true,
      moved: false,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startRight: window.innerWidth - rect.right,
      startBottom: window.innerHeight - rect.bottom,
      lastPos: null,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onBubblePointerMove = (e) => {
    const d = dragRef.current
    if (!d.dragging) return
    const dx = e.clientX - d.startClientX
    const dy = e.clientY - d.startClientY
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true
    if (!d.moved) return
    const next = clampBubblePos(d.startRight - dx, d.startBottom - dy)
    d.lastPos = next
    setBubblePos(next)
  }

  const onBubblePointerUp = () => {
    const d = dragRef.current
    if (!d.dragging) return
    d.dragging = false
    if (d.moved && d.lastPos) {
      try { localStorage.setItem(BUBBLE_POS_KEY, JSON.stringify(d.lastPos)) } catch { /* localStorage no disponible */ }
    } else {
      handlePawClick()
    }
  }

  const hideBubble = () => {
    setBubbleHidden(true)
    sessionStorage.setItem(BUBBLE_HIDDEN_KEY, '1')
  }
  const showBubble = () => {
    setBubbleHidden(false)
    sessionStorage.removeItem(BUBBLE_HIDDEN_KEY)
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
    <div
      // Posición por defecto (bottom-20/right-4, md:bottom-6/right-6) salvo
      // que la burbuja colapsada haya sido arrastrada — en ese caso, con el
      // panel CERRADO se usa esa posición guardada; con el panel ABIERTO
      // siempre vuelve a la posición segura por defecto (arrastrar un panel
      // de 80vh de alto es otro problema, y uno que nadie pidió).
      className={`fixed z-40 flex flex-col items-end gap-3 ${
        !open && bubblePos ? '' : 'bottom-20 right-4 md:bottom-6 md:right-6'
      }`}
      style={!open && bubblePos ? { right: bubblePos.right, bottom: bubblePos.bottom } : undefined}
    >
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

            {/* "4 Pared" — mismo componente que el botón flotante de
                VRPage.jsx, ahora también accesible desde aquí (más fácil de
                encontrar que un botón suelto en la esquina). Solo
                escritorio, misma razón que el botón flotante: el iframe
                completo no es usable en pantallas táctiles chicas. */}
            {subTab === '4pared' && (
              <>
                <div className="hidden md:block">
                  <FourthWallPhone onClose={() => setSubTab('personaje')} />
                </div>
                <p className="py-8 text-center text-sm text-text-muted md:hidden">
                  📱 4 Pared solo está disponible en pantallas de escritorio.
                </p>
              </>
            )}

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
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <EquipmentBagGrid owner={entity.owner} />
                    <p className="text-center text-[10px] text-text-muted">Toca un objeto para equiparlo o quitarlo.</p>
                  </div>
                  <div className="border-t border-border pt-3">
                    <ObjetosBagPanel owner={entity.owner} onActivate={() => setOpen(false)} />
                  </div>
                </div>
              )
            )}

            {subTab === 'chat' && (
              <ChatTab courseId={courseId} module={module} className="h-full" />
            )}
          </div>
        </div>
      )}

      {open ? (
        // Panel abierto: burbuja simple sin arrastre/ocultar — ya tiene su
        // propio botón ✕ en el header de arriba para cerrarla.
        <button
          onClick={handlePawClick}
          className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-surface shadow-lg transition-transform hover:scale-105 sm:h-24 sm:w-24"
          aria-label="Cerrar mascota"
        >
          {hideViewport ? (
            <span className="text-3xl sm:text-4xl">🐾</span>
          ) : (
            <MascotViewport className="h-full w-full" />
          )}
        </button>
      ) : bubbleHidden ? (
        // Oculta — una pastilla chica en vez de nada, para que siga siendo
        // fácil traerla de vuelta (desaparece por completo hasta la próxima
        // carga de página, no para siempre).
        <button
          type="button"
          onClick={showBubble}
          className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface/90 px-3 text-xs font-semibold text-text-muted shadow backdrop-blur hover:text-text"
          aria-label="Mostrar mascota"
        >
          🐾 Mostrar
        </button>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={hideBubble}
            className="absolute -left-1.5 -top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-xs text-text-muted shadow hover:text-text"
            aria-label="Ocultar mascota"
            title="Ocultar"
          >
            ✕
          </button>
          <button
            onPointerDown={onBubblePointerDown}
            onPointerMove={onBubblePointerMove}
            onPointerUp={onBubblePointerUp}
            onPointerCancel={onBubblePointerUp}
            className="flex h-20 w-20 cursor-grab touch-none items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-surface shadow-lg transition-transform active:scale-95 active:cursor-grabbing sm:h-24 sm:w-24"
            aria-label="Abrir mascota — mantén presionado y arrastra para moverla"
            title="Arrastra para moverla"
          >
            {hideViewport ? (
              <span className="text-3xl sm:text-4xl">🐾</span>
            ) : (
              <MascotViewport className="h-full w-full" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}
