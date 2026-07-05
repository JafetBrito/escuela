import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useGameStore } from '../../stores/useGameStore'
import { useSyncStatusStore } from '../../stores/useSyncStatusStore'
import { useVoiceStore } from '../../stores/useVoiceStore'
import { useDayNightStore } from '../../stores/useDayNightStore'
import { useDevCalibrationStore } from '../../stores/useDevCalibrationStore'
import { useLevelStore, levelProgress, MAX_LEVEL } from '../../stores/useLevelStore'
import { useTutorialStore } from '../../stores/useTutorialStore'
import { TUTORIAL_MISSIONS } from '../../data/tutorialMissions'
import { setVoicePermission } from '../../services/admin/gmCommands'
import { pushSnapshotToCloud } from '../../services/persistence/autoSave'
import { useHolidayStore, HOLIDAYS } from '../../stores/useHolidayStore'
import GmConsole from './GmConsole'

// ─── Constants ─────────────────────────────────────────────────────────────

const XP_TEST_AMOUNTS = [500, 2500, 5000]
const SEASONS = ['primavera', 'verano', 'otoño', 'invierno']
const WEATHERS = ['despejado', 'nublado', 'lluvia']

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
    ],
  },
  {
    label: 'Admin',
    links: [
      { to: '/admin-setup',         label: '⚙️ Admin Setup' },
      { to: '/admin/flipbook-test', label: '📖 Flipbook (test)' },
      { to: '/admin/tareas',        label: '📋 Gestión de Tareas' },
    ],
  },
]

// ─── Section wrapper ────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="mb-2 rounded-lg border border-border/60 bg-surface-hover px-2 py-1.5">
      <p className="mb-1 text-xs font-semibold text-text-muted">{title}</p>
      {children}
    </div>
  )
}

// ─── Main panel ────────────────────────────────────────────────────────────
export default function DevToolsPanel() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
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
  const avatarOverride = useDevCalibrationStore((s) => s.avatarRotationOverride)
  const activeHoliday = useHolidayStore((s) => s.activeHoliday)
  const setHoliday = useHolidayStore((s) => s.set)

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

  return (
    <div className="fixed bottom-4 left-4 z-[999]">
      {open && (
        <div className="mb-2 max-h-[80vh] w-64 overflow-y-auto rounded-xl border border-border bg-surface/95 p-2 text-sm shadow-xl backdrop-blur">

          {/* ── Sync ─────────────────────────────────────────────── */}
          <Section title="☁️ Sincronización">
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
            <button type="button" onClick={() => { setConsoleOpen(true); setOpen(false) }}
              className="mt-1 w-full rounded-lg border border-primary/40 px-2 py-1 text-xs font-semibold text-primary">
              🖥️ Consola GM
            </button>
          </Section>

          {/* ── Tutorial ─────────────────────────────────────────── */}
          <Section title="🎬 Tutorial — saltar a paso">
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
          </Section>

          {/* ── XP ───────────────────────────────────────────────── */}
          <Section title="⭐ Nivel y XP">
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
          </Section>

          {/* ── Voz ──────────────────────────────────────────────── */}
          <Section title="🎙️ Voz">
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
          </Section>

          {/* ── Hora/Clima ───────────────────────────────────────── */}
          <Section title="🌦️ Hora y Clima (campus VR)">
            <p className="text-[10px] text-text-muted">
              {dnMode === 'real' ? '🟢 Hora real' : `🟠 Forzada: ${Math.floor(dnHour)}:00`}
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
          </Section>

          {/* ── Tema festivo ─────────────────────────────────────── */}
          <Section title="🎉 Tema Festivo">
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
          </Section>

          {/* ── Avatar calibration ───────────────────────────────── */}
          <Section title="🧭 Calibrar giro del avatar">
            <p className="text-[10px] text-text-muted">
              Ajusta hasta ver la espalda del personaje al caminar.
            </p>
            <p className="mt-1 text-xs text-text">
              Ajuste actual: {Math.round((avatarOverride * 180) / Math.PI)}°
            </p>
            <div className="mt-1 grid grid-cols-3 gap-1">
              {[-90, -15, -5, 5, 15, 90].map((deg) => (
                <button key={deg} type="button"
                  onClick={() => useDevCalibrationStore.getState().nudge((deg * Math.PI) / 180)}
                  className="rounded-lg border border-primary/40 px-1 py-1 text-xs font-semibold text-primary">
                  {deg > 0 ? `+${deg}°` : `${deg}°`}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => useDevCalibrationStore.getState().reset()}
              className="mt-1 w-full rounded-lg border border-danger/40 px-1 py-1 text-xs font-semibold text-danger">
              ↺ Reiniciar
            </button>
          </Section>

          {/* ── Navigation ───────────────────────────────────────── */}
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-1">
              <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted/60">
                {group.label}
              </p>
              {group.links.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-1 text-xs text-text hover:bg-primary/10">
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}

      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/95 text-lg shadow-xl backdrop-blur"
        aria-label="Dev tools" title="Dev tools (admin)">
        🛠️
      </button>

      <GmConsole open={consoleOpen} onClose={() => setConsoleOpen(false)} />
    </div>
  )
}
