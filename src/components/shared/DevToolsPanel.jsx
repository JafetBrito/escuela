import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useGameStore } from '../../stores/useGameStore'
import { useSyncStatusStore } from '../../stores/useSyncStatusStore'
import { useVoiceStore } from '../../stores/useVoiceStore'
import { useDayNightStore } from '../../stores/useDayNightStore'
import { useAdminThemeStore } from '../../stores/useAdminThemeStore'
import { useLevelStore, levelProgress, MAX_LEVEL } from '../../stores/useLevelStore'
import { useTutorialStore } from '../../stores/useTutorialStore'
import { useMobStore } from '../../stores/useMobStore'
import { TUTORIAL_MISSIONS } from '../../data/tutorialMissions'
import { MOB_TYPES } from '../../data/mobRegistry'
import { SHOP_ITEMS, SHOP_CATEGORIES } from '../../data/shopRegistry'
import { findPlayers, runGmCommand, SELF_TARGET, setVoicePermission } from '../../services/admin/gmCommands'
import { pushSnapshotToCloud } from '../../services/persistence/autoSave'
import { useHolidayStore, HOLIDAYS } from '../../stores/useHolidayStore'
import { useDraggablePopup } from '../../hooks/useDraggablePopup'
import GmConsole from './GmConsole'

// ─── Constants ─────────────────────────────────────────────────────────────

const XP_TEST_AMOUNTS = [500, 2500, 5000]
const SEASONS = ['primavera', 'verano', 'otoño', 'invierno']
const WEATHERS = ['despejado', 'nublado', 'lluvia']
const NPC_SPAWN_FALLBACK = [0, 0, -48] // cerca del spawn del Gran Aula

const SYNC_LABEL = {
  idle: '⚪ Sin sincronizar',
  saving: '🟡 Guardando…',
  saved: '🟢 Sincronizado',
  error: '🔴 Error de sync',
}

// Grouped navigation links — one source of truth, no duplicates.
const NAV_GROUPS = [
  {
    label: 'Plataforma',
    links: [
      { to: '/dashboard',    label: 'Dashboard' },
      { to: '/tienda',       label: 'Tienda' },
      { to: '/ajustes',      label: 'Ajustes' },
      { to: '/logros',       label: 'Logros' },
      { to: '/misiones',     label: 'Misiones' },
      { to: '/notas',        label: 'Notas' },
      { to: '/amigos',       label: 'Amigos' },
      { to: '/chats',        label: 'Chats' },
      { to: '/biblioteca',   label: 'Biblioteca' },
      { to: '/herramientas', label: 'Herramientas' },
      { to: '/arbol',        label: 'Árbol de Habilidades' },
      { to: '/arena',        label: 'Arena' },
      { to: '/anuncios',     label: '📋 Anuncios' },
      { to: '/mis-tareas',   label: '📋 Mis Tareas' },
    ],
  },
  {
    label: 'VR',
    links: [
      { to: '/vr-templo',       label: '🥽 Tutorial (Templo)' },
      { to: '/vr',              label: '🥽 Campus' },
      { to: '/vr/room',         label: '🥽 Mi Room' },
      { to: '/vr/anfiteatro',   label: '🥽 Anfiteatro' },
      { to: '/vr/graffiti',     label: '🥽 Graffiti' },
      { to: '/vr/cueva-platon', label: '🥽 Cueva de Platón' },
      { to: '/vr/pruebas',      label: '🧪 Mapa de Pruebas' },
    ],
  },
  {
    label: 'Admin',
    links: [
      { to: '/admin-setup',         label: '⚙️ Admin Setup' },
      { to: '/admin/flipbook-test', label: '📖 Flipbook (test)' },
      { to: '/admin/tareas',        label: '📋 Gestión de Tareas' },
      { to: '/admin/proyectos',     label: '📁 Gestión de Proyectos' },
      { to: '/admin/clases',        label: '🎓 Mis Clases (Admin)' },
    ],
  },
]

// ─── Accordion section ──────────────────────────────────────────────────────
// Todo el panel es un acordeón: cada sección arranca cerrada y se abre/cierra
// independiente de las demás — así el panel no es una lista gigante siempre
// desplegada (queja original: "ya tiene muchas cosas... tiene que verse mejor").
function AccordionSection({ id, title, openId, setOpenId, children }) {
  const isOpen = openId === id
  return (
    <div className="mb-1.5 overflow-hidden rounded-lg border border-border/60 bg-surface-hover">
      <button
        type="button"
        onClick={() => setOpenId(isOpen ? null : id)}
        className="flex w-full items-center justify-between px-2 py-1.5 text-left text-xs font-semibold text-text-muted hover:text-text"
      >
        <span>{title}</span>
        <span className="text-[10px]">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && <div className="border-t border-border/40 px-2 py-1.5">{children}</div>}
    </div>
  )
}

// ─── Main panel ────────────────────────────────────────────────────────────
export default function DevToolsPanel() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [openSection, setOpenSection] = useState(null)
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const syncStatus = useSyncStatusStore((s) => s.status)
  const lastSavedAt = useSyncStatusStore((s) => s.lastSavedAt)
  const lastError = useSyncStatusStore((s) => s.lastError)
  const myVoiceEnabled = useVoiceStore((s) => s.myVoiceEnabled)
  const toggleMyVoice = useVoiceStore((s) => s.toggleMyVoice)
  const [voiceQuery, setVoiceQuery] = useState('')
  const [voiceBusy, setVoiceBusy] = useState(false)
  const [voiceMsg, setVoiceMsg] = useState('')
  const dnMode = useDayNightStore((s) => s.mode)
  const dnHour = useDayNightStore((s) => s.manualBaseHour)
  const season = useDayNightStore((s) => s.season)
  const weather = useDayNightStore((s) => s.weather)
  const xp = useLevelStore((s) => s.xp)
  const { level, isMaxLevel } = levelProgress(xp)
  const activeHoliday = useHolidayStore((s) => s.activeHoliday)
  const setHoliday = useHolidayStore((s) => s.set)
  const hackerThemeEnabled = useAdminThemeStore((s) => s.enabled)
  const toggleHackerTheme = useAdminThemeStore((s) => s.toggle)

  // Dar objeto — a mí o a otro jugador (mismo /additem que la Consola GM,
  // pero con una cuadrícula buscable en vez de tener que saber el id de memoria).
  const [giveTarget, setGiveTarget] = useState({ id: SELF_TARGET, label: 'yo (tú)' })
  const [giveTargetQuery, setGiveTargetQuery] = useState('')
  const [giveSearch, setGiveSearch] = useState('')
  const [giveBusy, setGiveBusy] = useState(false)
  const [giveMsg, setGiveMsg] = useState('')

  // Agregar NPC — coloca un monstruo cerca del spawn del campus (mismo
  // /npcadd de la Consola GM); no depende de dónde esté parado el admin
  // porque este panel vive fuera del mundo VR también.
  const [npcMsg, setNpcMsg] = useState('')

  const { elRef, style, onPointerDown } = useDraggablePopup('admin-devtools')

  if (!isAdmin?.()) return null

  const handleAddXp = async (amount) => {
    useLevelStore.getState().addXp(amount)
    await pushSnapshotToCloud()
  }

  const handleVoiceGrant = async (enabled) => {
    if (!voiceQuery.trim() || voiceBusy) return
    setVoiceBusy(true)
    try {
      const player = await setVoicePermission(voiceQuery.trim(), enabled)
      setVoiceMsg(`${enabled ? '✅' : '🚫'} ${player.display_name || player.email}`)
    } catch (err) {
      setVoiceMsg(`❌ ${err.message}`)
    } finally {
      setVoiceBusy(false)
    }
  }

  const handleForceSync = async () => {
    setSyncing(true)
    await useGameStore.getState().forceSyncToCloud()
    setSyncing(false)
  }

  const jumpToTutorialStep = (stepId) => {
    const idx = TUTORIAL_MISSIONS.findIndex((m) => m.id === stepId)
    const done = TUTORIAL_MISSIONS.slice(0, idx).map((m) => m.id)
    useTutorialStore.setState({ done })
    setOpen(false)
    navigate('/vr-templo')
  }

  const resetTutorial = () => {
    useTutorialStore.getState().reset()
    setOpen(false)
    navigate('/vr-templo')
  }

  const handleGiveTargetSearch = async () => {
    const query = giveTargetQuery.trim()
    if (!query) { setGiveTarget({ id: SELF_TARGET, label: 'yo (tú)' }); return }
    const players = await findPlayers(query)
    if (!players.length) { setGiveMsg('❌ Sin resultados para ese jugador.'); return }
    const p = players[0]
    setGiveTarget({ id: p.id, label: `${p.display_name} <${p.email}>` })
    setGiveMsg(`🎯 Objetivo: ${p.display_name}`)
  }

  const handleGiveItem = async (itemId) => {
    if (giveBusy) return
    setGiveBusy(true)
    try {
      const msg = await runGmCommand(giveTarget.id, 'additem', [itemId])
      setGiveMsg(`${msg} → ${giveTarget.label}`)
    } catch (err) {
      setGiveMsg(`❌ ${err.message}`)
    } finally {
      setGiveBusy(false)
    }
  }

  const filteredShopItems = SHOP_ITEMS.filter((i) =>
    i.name.toLowerCase().includes(giveSearch.toLowerCase()) || i.id.includes(giveSearch.toLowerCase()),
  )

  const handleAddNpc = (typeId) => {
    const type = MOB_TYPES[typeId]
    useMobStore.getState().spawnAt(typeId, NPC_SPAWN_FALLBACK)
    setNpcMsg(`✅ ${type.icon} ${type.name} colocado cerca del spawn del campus (entra a 🥽 Campus para verlo).`)
  }

  return (
    <div ref={elRef} style={style} className="fixed bottom-4 left-4 z-[999]">
      {open && (
        <div className="mb-2 max-h-[80vh] w-72 overflow-y-auto rounded-xl border border-border bg-surface/95 p-2 text-sm shadow-xl backdrop-blur">

          {/* ── Sync + Consola ───────────────────────────────────── */}
          <AccordionSection id="sync" title="☁️ Sincronización" openId={openSection} setOpenId={setOpenSection}>
            <p className="text-xs text-text">{SYNC_LABEL[syncStatus]}</p>
            {lastSavedAt && (
              <p className="text-[10px] text-text-muted">
                Guardado: {new Date(lastSavedAt).toLocaleTimeString()}
              </p>
            )}
            {syncStatus === 'error' && lastError && (
              <p className="text-[10px] text-danger">{lastError}</p>
            )}
            <button type="button" onClick={handleForceSync} disabled={syncing}
              className="mt-1 w-full rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-background disabled:opacity-50">
              {syncing ? 'Guardando…' : '🔄 Forzar guardado'}
            </button>
          </AccordionSection>

          {/* ── Consola GM ───────────────────────────────────────── */}
          <AccordionSection id="console" title="🖥️ Consola de comandos" openId={openSection} setOpenId={setOpenSection}>
            <p className="text-[10px] text-text-muted">
              Ejecuta /additem, /addcoins, /setlevel, /npcadd, /target y más — abre la ventana de la consola para escribir comandos.
            </p>
            <button type="button" onClick={() => { setConsoleOpen(true); setOpen(false) }}
              className="mt-1 w-full rounded-lg border border-primary/40 px-2 py-1 text-xs font-semibold text-primary">
              🖥️ Abrir Consola GM
            </button>
          </AccordionSection>

          {/* ── Tema Admin (hacker theme on/off) ─────────────────── */}
          <AccordionSection id="admin-theme" title="🎨 Tema Admin" openId={openSection} setOpenId={setOpenSection}>
            <p className="text-[10px] text-text-muted">
              El tema "hacker" que solo tú ves como admin. Puedes apagarlo si ya no lo necesitas ver.
            </p>
            <button type="button" onClick={toggleHackerTheme}
              className="mt-1 w-full rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-background">
              {hackerThemeEnabled ? '⚡ Tema hacker: ON' : '⚪ Tema hacker: OFF'}
            </button>
          </AccordionSection>

          {/* ── Dar objeto ───────────────────────────────────────── */}
          <AccordionSection id="give-item" title="🎁 Dar objeto" openId={openSection} setOpenId={setOpenSection}>
            <p className="text-[10px] text-text-muted">Objetivo: <span className="font-semibold text-text">{giveTarget.label}</span></p>
            <div className="mt-1 flex gap-1">
              <input type="text" value={giveTargetQuery} onChange={(e) => setGiveTargetQuery(e.target.value)}
                placeholder="correo o nombre (vacío = yo)"
                className="flex-1 rounded-lg border border-border bg-background px-2 py-1 text-xs text-text outline-none focus:border-primary" />
              <button type="button" onClick={handleGiveTargetSearch}
                className="rounded-lg border border-primary/40 px-2 py-1 text-xs font-semibold text-primary">
                🎯
              </button>
            </div>
            <input type="text" value={giveSearch} onChange={(e) => setGiveSearch(e.target.value)}
              placeholder="Buscar objeto…"
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs text-text outline-none focus:border-primary" />
            <div className="mt-1.5 grid max-h-48 grid-cols-2 gap-1 overflow-y-auto">
              {filteredShopItems.map((item) => (
                <button key={item.id} type="button" disabled={giveBusy} onClick={() => handleGiveItem(item.id)}
                  title={`${SHOP_CATEGORIES[item.category]?.label ?? item.category}`}
                  className="flex items-center gap-1 rounded-lg border border-border px-1.5 py-1 text-left text-[11px] text-text hover:border-primary hover:bg-primary/10 disabled:opacity-50">
                  <span>{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
              {filteredShopItems.length === 0 && (
                <p className="col-span-2 py-2 text-center text-[10px] text-text-muted">Sin resultados.</p>
              )}
            </div>
            {giveMsg && <p className="mt-1 text-[10px] text-text-muted">{giveMsg}</p>}
          </AccordionSection>

          {/* ── Agregar NPC ──────────────────────────────────────── */}
          <AccordionSection id="add-npc" title="👹 Agregar NPC" openId={openSection} setOpenId={setOpenSection}>
            <p className="text-[10px] text-text-muted">Coloca un monstruo instanciado cerca del spawn del Campus VR.</p>
            <div className="mt-1.5 grid grid-cols-2 gap-1">
              {Object.values(MOB_TYPES).map((type) => (
                <button key={type.id} type="button" onClick={() => handleAddNpc(type.id)}
                  className="flex items-center gap-1 rounded-lg border border-border px-1.5 py-1 text-left text-[11px] text-text hover:border-primary hover:bg-primary/10">
                  <span>{type.icon}</span>
                  <span className="truncate">{type.name}</span>
                </button>
              ))}
            </div>
            {npcMsg && <p className="mt-1 text-[10px] text-text-muted">{npcMsg}</p>}
          </AccordionSection>

          {/* ── Tutorial ─────────────────────────────────────────── */}
          <AccordionSection id="tutorial" title="🎬 Tutorial — saltar a paso" openId={openSection} setOpenId={setOpenSection}>
            {TUTORIAL_MISSIONS.map((m) => (
              <button key={m.id} type="button" onClick={() => jumpToTutorialStep(m.id)}
                className="block w-full rounded-lg px-2 py-1 text-left text-xs text-text hover:bg-primary/10">
                {m.step}. {m.icon} {m.title}
              </button>
            ))}
            <button type="button" onClick={resetTutorial}
              className="mt-1 w-full rounded-lg border border-border px-2 py-1 text-xs text-text-muted hover:bg-surface">
              ↺ Reiniciar tutorial
            </button>
          </AccordionSection>

          {/* ── XP ───────────────────────────────────────────────── */}
          <AccordionSection id="xp" title="⭐ Nivel y XP" openId={openSection} setOpenId={setOpenSection}>
            <p className="text-[10px] text-text-muted">
              Nivel {level}{isMaxLevel && ` (máx. ${MAX_LEVEL})`}
            </p>
            <div className="mt-1 flex gap-1">
              {XP_TEST_AMOUNTS.map((amount) => (
                <button key={amount} type="button" onClick={() => handleAddXp(amount)}
                  className="flex-1 rounded-lg border border-primary/40 px-2 py-1 text-xs font-semibold text-primary">
                  +{amount}
                </button>
              ))}
            </div>
          </AccordionSection>

          {/* ── Voz ──────────────────────────────────────────────── */}
          <AccordionSection id="voice" title="🎙️ Voz" openId={openSection} setOpenId={setOpenSection}>
            <button type="button" onClick={toggleMyVoice}
              className="w-full rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-background">
              {myVoiceEnabled ? '🎙️ Mi voz: ON' : '🔇 Mi voz: OFF'}
            </button>
            <p className="mt-1.5 text-[10px] text-text-muted">Dar/quitar voz a jugador:</p>
            <input type="text" value={voiceQuery} onChange={(e) => setVoiceQuery(e.target.value)}
              placeholder="correo o nombre"
              className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs text-text outline-none focus:border-primary" />
            <div className="mt-1 flex gap-1">
              <button type="button" disabled={voiceBusy} onClick={() => handleVoiceGrant(true)}
                className="flex-1 rounded-lg border border-primary/40 px-2 py-1 text-xs font-semibold text-primary disabled:opacity-50">
                ✅ Dar
              </button>
              <button type="button" disabled={voiceBusy} onClick={() => handleVoiceGrant(false)}
                className="flex-1 rounded-lg border border-danger/40 px-2 py-1 text-xs font-semibold text-danger disabled:opacity-50">
                🚫 Quitar
              </button>
            </div>
            {voiceMsg && <p className="mt-1 text-[10px] text-text-muted">{voiceMsg}</p>}
          </AccordionSection>

          {/* ── Hora/Clima ───────────────────────────────────────── */}
          <AccordionSection id="daynight" title="🌦️ Hora y Clima (campus VR)" openId={openSection} setOpenId={setOpenSection}>
            <p className="text-[10px] text-text-muted">
              {dnMode === 'real' ? '🟢 Hora real' : `🟠 Forzada: ${Math.floor(dnHour)}:00`} — se guarda para todos.
            </p>
            <div className="mt-1 flex items-center gap-1">
              <input type="range" min={0} max={23} step={1} value={Math.floor(dnHour)}
                onChange={(e) => useDayNightStore.getState().setManualHour(Number(e.target.value))}
                className="flex-1" />
              <span className="w-10 text-right text-xs text-text">{Math.floor(dnHour)}:00</span>
            </div>
            <button type="button" onClick={() => useDayNightStore.getState().useRealTime()}
              disabled={dnMode === 'real'}
              className="mt-1 w-full rounded-lg border border-primary/40 px-2 py-1 text-xs font-semibold text-primary disabled:opacity-50">
              🕐 Volver a hora real
            </button>
            <div className="mt-1.5 flex gap-1">
              <select value={season} onChange={(e) => useDayNightStore.getState().setSeason(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-1 py-1 text-xs text-text outline-none focus:border-primary">
                {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={weather} onChange={(e) => useDayNightStore.getState().setWeather(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-1 py-1 text-xs text-text outline-none focus:border-primary">
                {WEATHERS.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </AccordionSection>

          {/* ── Tema festivo ─────────────────────────────────────── */}
          <AccordionSection id="holiday" title="🎉 Tema Festivo" openId={openSection} setOpenId={setOpenSection}>
            <p className="text-[10px] text-text-muted">
              Activo: <span className="font-bold text-text">{HOLIDAYS[activeHoliday]?.icon} {HOLIDAYS[activeHoliday]?.label}</span>
            </p>
            <div className="mt-1 grid grid-cols-2 gap-1">
              {Object.entries(HOLIDAYS).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setHoliday(key)}
                  className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                    activeHoliday === key
                      ? 'bg-primary text-background'
                      : 'border border-border text-text-muted hover:text-text'
                  }`}
                >
                  {meta.icon} {meta.label}
                </button>
              ))}
            </div>
          </AccordionSection>

          {/* ── Navigation (acordeón por grupo) ──────────────────── */}
          {NAV_GROUPS.map((group) => (
            <AccordionSection key={group.label} id={`nav-${group.label}`} title={group.label} openId={openSection} setOpenId={setOpenSection}>
              {group.links.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-1 text-xs text-text hover:bg-primary/10">
                  {l.label}
                </Link>
              ))}
            </AccordionSection>
          ))}
        </div>
      )}

      <button type="button" onClick={() => setOpen((v) => !v)} onPointerDown={onPointerDown}
        style={{ touchAction: 'none' }}
        className="flex h-10 w-10 cursor-grab items-center justify-center rounded-full border border-border bg-surface/95 text-lg shadow-xl backdrop-blur active:cursor-grabbing"
        aria-label="Dev tools" title="Dev tools (admin) — arrastra para mover">
        🛠️
      </button>

      <GmConsole open={consoleOpen} onClose={() => setConsoleOpen(false)} />
    </div>
  )
}
