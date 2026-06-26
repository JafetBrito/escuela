import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useGameStore } from '../../stores/useGameStore'
import { useSyncStatusStore } from '../../stores/useSyncStatusStore'
import { useVoiceStore } from '../../stores/useVoiceStore'
import { useDayNightStore } from '../../stores/useDayNightStore'
import { useDevCalibrationStore } from '../../stores/useDevCalibrationStore'
import { useLevelStore, levelProgress, MAX_LEVEL } from '../../stores/useLevelStore'
import { setVoicePermission } from '../../services/admin/gmCommands'
import { pushSnapshotToCloud } from '../../services/persistence/autoSave'
import GmConsole from './GmConsole'

const XP_TEST_AMOUNTS = [500, 2500, 5000]

const SEASONS = ['primavera', 'verano', 'otoño', 'invierno']
const WEATHERS = ['despejado', 'nublado', 'lluvia']

const SYNC_LABEL = {
  idle: '⚪ Sin sincronizar aún',
  saving: '🟡 Guardando en la nube…',
  saved: '🟢 Sincronizado',
  error: '🔴 Error de sincronización',
}

// ponytail: flat link list, no route-scanning abstraction — add grouping/search if this grows past ~20 links.
const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tienda', label: 'Tienda' },
  { to: '/ajustes', label: 'Ajustes' },
  { to: '/logros', label: 'Logros' },
  { to: '/misiones', label: 'Misiones' },
  { to: '/notas', label: 'Notas' },
  { to: '/amigos', label: 'Amigos' },
  { to: '/chats', label: 'Chats' },
  { to: '/biblioteca', label: 'Biblioteca' },
  { to: '/arbol', label: 'Árbol de Habilidades (no-VR)' },
  { to: '/arena', label: 'Arena' },
  { to: '/vr', label: '🥽 VR: Campus' },
  { to: '/vr/room', label: '🥽 VR: Mi Room' },
  { to: '/vr/anfiteatro', label: '🥽 VR: Anfiteatro' },
  { to: '/vr/world-tree', label: '🥽 VR: Árbol del Mundo' },
  { to: '/vr/graffiti', label: '🥽 VR: Calle Graffiti (st.glb)' },
  { to: '/vr-templo', label: '🥽 VR: Templo (tutorial)' },
  { to: '/vr/cueva-platon', label: '🥽 VR: Cueva de Platón' },
  { to: '/admin-setup', label: '⚙️ Admin Setup' },
  { to: '/admin/flipbook-test', label: '📖 Flipbook 3D (test)' },
]

export default function DevToolsPanel() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
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
  if (!isAdmin?.()) return null

  // Goes through addXp() (not loadXp) so the level-up banner/sound actually
  // fires — same command as /addxp in the GM console, just one click away.
  const handleAddXp = async (amount) => {
    useLevelStore.getState().addXp(amount)
    await pushSnapshotToCloud()
  }

  const handleVoiceGrant = async (enabled) => {
    if (!voiceQuery.trim() || voiceBusy) return
    setVoiceBusy(true)
    try {
      const player = await setVoicePermission(voiceQuery.trim(), enabled)
      setVoiceMsg(`${enabled ? '✅ Voz activada' : '🚫 Voz quitada'} para ${player.display_name || player.email}`)
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

  return (
    <div className="fixed bottom-4 left-4 z-[999]">
      {open && (
        <div className="mb-2 max-h-[70vh] w-64 overflow-y-auto rounded-xl border border-border bg-surface/95 p-2 text-sm shadow-xl backdrop-blur">
          <div className="mb-2 rounded-lg border border-border/60 bg-surface-hover px-2 py-1.5">
            <p className="text-xs font-semibold text-text-muted">☁️ Sincronización</p>
            <p className="text-xs text-text">{SYNC_LABEL[syncStatus]}</p>
            {lastSavedAt && (
              <p className="text-[10px] text-text-muted">
                Último guardado: {new Date(lastSavedAt).toLocaleTimeString()}
              </p>
            )}
            {syncStatus === 'error' && lastError && (
              <p className="text-[10px] text-danger">{lastError}</p>
            )}
            <button
              type="button"
              onClick={handleForceSync}
              disabled={syncing}
              className="mt-1 w-full rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-background disabled:opacity-50"
            >
              {syncing ? 'Guardando…' : '🔄 Forzar guardado en la nube'}
            </button>
            <button
              type="button"
              onClick={() => { setConsoleOpen((v) => !v); setOpen(false) }}
              className="mt-1 w-full rounded-lg border border-primary/40 px-2 py-1 text-xs font-semibold text-primary"
            >
              🖥️ Consola GM
            </button>
          </div>

          <div className="mb-2 rounded-lg border border-border/60 bg-surface-hover px-2 py-1.5">
            <p className="text-xs font-semibold text-text-muted">🎙️ Voz</p>
            <button
              type="button"
              onClick={toggleMyVoice}
              className="mt-1 w-full rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-background"
            >
              {myVoiceEnabled ? '🎙️ Mi voz: Activada' : '🔇 Mi voz: Desactivada'}
            </button>
            <p className="mt-2 text-[10px] text-text-muted">Dar/quitar voz a otro jugador (correo o nombre):</p>
            <input
              type="text"
              value={voiceQuery}
              onChange={(e) => setVoiceQuery(e.target.value)}
              placeholder="correo o nombre de usuario"
              className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs text-text outline-none focus:border-primary"
            />
            <div className="mt-1 flex gap-1">
              <button
                type="button"
                disabled={voiceBusy}
                onClick={() => handleVoiceGrant(true)}
                className="flex-1 rounded-lg border border-primary/40 px-2 py-1 text-xs font-semibold text-primary disabled:opacity-50"
              >
                ✅ Dar voz
              </button>
              <button
                type="button"
                disabled={voiceBusy}
                onClick={() => handleVoiceGrant(false)}
                className="flex-1 rounded-lg border border-danger/40 px-2 py-1 text-xs font-semibold text-danger disabled:opacity-50"
              >
                🚫 Quitar voz
              </button>
            </div>
            {voiceMsg && <p className="mt-1 text-[10px] text-text-muted">{voiceMsg}</p>}
          </div>

          <div className="mb-2 rounded-lg border border-border/60 bg-surface-hover px-2 py-1.5">
            <p className="text-xs font-semibold text-text-muted">⭐ Nivel y XP</p>
            <p className="mt-1 text-[10px] text-text-muted">
              Nivel {level}{isMaxLevel && ` (máx. ${MAX_LEVEL})`} — dispara el aviso de subir de nivel para probarlo.
            </p>
            <div className="mt-1 flex gap-1">
              {XP_TEST_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleAddXp(amount)}
                  className="flex-1 rounded-lg border border-primary/40 px-2 py-1 text-xs font-semibold text-primary"
                >
                  +{amount}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-2 rounded-lg border border-border/60 bg-surface-hover px-2 py-1.5">
            <p className="text-xs font-semibold text-text-muted">🧭 Calibrar giro del avatar</p>
            <p className="mt-1 text-[10px] text-text-muted">
              Ajusta en vivo (en cualquier mundo VR) hasta que camines y veas la espalda del personaje, no el costado. Cuando quede bien, dime el grado exacto para fijarlo en el código y borrar esto.
            </p>
            <p className="mt-1 text-xs text-text">
              Ajuste actual: {Math.round((avatarOverride * 180) / Math.PI)}°
            </p>
            <div className="mt-1 grid grid-cols-4 gap-1">
              {[-90, -15, -5, 5, 15, 90].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => useDevCalibrationStore.getState().nudge((deg * Math.PI) / 180)}
                  className="rounded-lg border border-primary/40 px-1 py-1 text-xs font-semibold text-primary"
                >
                  {deg > 0 ? `+${deg}°` : `${deg}°`}
                </button>
              ))}
              <button
                type="button"
                onClick={() => useDevCalibrationStore.getState().reset()}
                className="col-span-2 rounded-lg border border-danger/40 px-1 py-1 text-xs font-semibold text-danger"
              >
                ↺ Reiniciar
              </button>
            </div>
          </div>

          <div className="mb-2 rounded-lg border border-border/60 bg-surface-hover px-2 py-1.5">
            <p className="text-xs font-semibold text-text-muted">🌦️ Hora y Clima (campus VR)</p>
            <p className="mt-1 text-[10px] text-text-muted">
              {dnMode === 'real' ? '🟢 Siguiendo la hora real del sistema' : `🟠 Hora forzada: ${Math.floor(dnHour)}:00`}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <input
                type="range"
                min={0}
                max={23}
                step={1}
                value={Math.floor(dnHour)}
                onChange={(e) => useDayNightStore.getState().setManualHour(Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-10 text-right text-xs text-text">{Math.floor(dnHour)}:00</span>
            </div>
            <button
              type="button"
              onClick={() => useDayNightStore.getState().useRealTime()}
              disabled={dnMode === 'real'}
              className="mt-1 w-full rounded-lg border border-primary/40 px-2 py-1 text-xs font-semibold text-primary disabled:opacity-50"
            >
              🕐 Volver a la hora real
            </button>
            <div className="mt-2 flex gap-1">
              <select
                value={season}
                onChange={(e) => useDayNightStore.getState().setSeason(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-1 py-1 text-xs text-text outline-none focus:border-primary"
              >
                {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={weather}
                onChange={(e) => useDayNightStore.getState().setWeather(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-1 py-1 text-xs text-text outline-none focus:border-primary"
              >
                {WEATHERS.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <p className="mt-1 text-[10px] text-text-muted">Estación/clima: guardados, sin efectos visuales aún.</p>
          </div>

          <p className="mb-2 px-1 text-xs font-semibold text-text-muted">🛠️ Dev — saltar a ruta</p>
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-1.5 text-text hover:bg-primary/10"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/95 text-lg shadow-xl backdrop-blur"
        aria-label="Dev tools"
        title="Dev tools (admin)"
      >
        🛠️
      </button>
      <GmConsole open={consoleOpen} onClose={() => setConsoleOpen(false)} />
    </div>
  )
}
