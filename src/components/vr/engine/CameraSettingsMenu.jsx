import { useState } from 'react'
import { useVrSettingsStore } from '../../../stores/useVrSettingsStore'

const TABS = [
  { id: 'controles', label: 'Cámara', icon: '🎥' },
  { id: 'interfaz', label: 'Interfaz', icon: '🖥️' },
  { id: 'atajos', label: 'Atajos', icon: '⌨️' },
]

const CAMERA_DEFAULTS = {
  cameraDistance: 6.5, cameraHeight: 2.4, zoomMin: 1.2, zoomMax: 55, pitchMin: -0.6, pitchMax: 1.0, fov: 58,
}

// "Ajustes" panel opened from the HUD's ⚙️ button — camera mode (1st/3rd
// person), mouse/gamepad feel, FOV and noClip in the Cámara tab (the
// original content of this component), plus an Interfaz tab (HUD reset +
// what the 👁️ hide-UI button affects) and a read-only Atajos reference.
// Reads/writes useVrSettingsStore directly, so it works identically in any
// world without needing extra props.
export function CameraSettingsMenu({ open, onClose }) {
  const [tab, setTab] = useState('controles')
  const cameraMode = useVrSettingsStore((s) => s.cameraMode)
  const setCameraMode = useVrSettingsStore((s) => s.setCameraMode)
  const mouseSensitivity = useVrSettingsStore((s) => s.mouseSensitivity)
  const setMouseSensitivity = useVrSettingsStore((s) => s.setMouseSensitivity)
  const invertY = useVrSettingsStore((s) => s.invertY)
  const setInvertY = useVrSettingsStore((s) => s.setInvertY)
  const cameraDistance = useVrSettingsStore((s) => s.cameraDistance)
  const setCameraDistance = useVrSettingsStore((s) => s.setCameraDistance)
  const cameraHeight = useVrSettingsStore((s) => s.cameraHeight)
  const setCameraHeight = useVrSettingsStore((s) => s.setCameraHeight)
  const zoomMin = useVrSettingsStore((s) => s.zoomMin)
  const setZoomMin = useVrSettingsStore((s) => s.setZoomMin)
  const zoomMax = useVrSettingsStore((s) => s.zoomMax)
  const setZoomMax = useVrSettingsStore((s) => s.setZoomMax)
  const pitchMin = useVrSettingsStore((s) => s.pitchMin)
  const setPitchMin = useVrSettingsStore((s) => s.setPitchMin)
  const pitchMax = useVrSettingsStore((s) => s.pitchMax)
  const setPitchMax = useVrSettingsStore((s) => s.setPitchMax)
  const fov = useVrSettingsStore((s) => s.fov)
  const setFov = useVrSettingsStore((s) => s.setFov)
  const noClip = useVrSettingsStore((s) => s.noClip)
  const setNoClip = useVrSettingsStore((s) => s.setNoClip)
  const npcVoice = useVrSettingsStore((s) => s.npcVoice)
  const setNpcVoice = useVrSettingsStore((s) => s.setNpcVoice)

  return open ? (
    <div className="absolute right-2 top-16 z-30 flex flex-col items-end gap-2 md:right-4 md:top-14">
      <div className="w-72 rounded-xl border border-border bg-surface/95 p-3 text-sm text-text shadow-xl backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">⚙️ Ajustes</p>
            <button type="button" onClick={onClose} className="text-text-muted hover:text-text" aria-label="Cerrar">
              ✕
            </button>
          </div>

          <div className="mb-3 flex gap-1 border-b border-border pb-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${
                  tab === t.id ? 'bg-primary text-background' : 'text-text-muted hover:text-text'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {tab === 'controles' && (
          <>
          <p className="mb-1 text-xs font-semibold text-text-muted">Tipo de cámara</p>
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setCameraMode('third')}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                cameraMode === 'third'
                  ? 'bg-primary text-background'
                  : 'border border-border text-text-muted hover:text-text'
              }`}
            >
              🎥 3ra persona
            </button>
            <button
              type="button"
              onClick={() => setCameraMode('first')}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                cameraMode === 'first'
                  ? 'bg-primary text-background'
                  : 'border border-border text-text-muted hover:text-text'
              }`}
            >
              👁️ 1ra persona
            </button>
          </div>

          <label className="mb-1 block text-xs font-semibold text-text-muted" htmlFor="vr-mouse-sensitivity">
            Sensibilidad del mouse: {mouseSensitivity.toFixed(1)}x
          </label>
          <input
            id="vr-mouse-sensitivity"
            type="range"
            min="0.3"
            max="2.5"
            step="0.1"
            value={mouseSensitivity}
            onChange={(e) => setMouseSensitivity(Number(e.target.value))}
            className="mb-3 w-full accent-primary"
          />

          <label className="flex items-center gap-2 text-xs font-semibold text-text-muted">
            <input
              type="checkbox"
              checked={invertY}
              onChange={(e) => setInvertY(e.target.checked)}
              className="accent-primary"
            />
            Invertir vista vertical
          </label>

          <label className="mb-1 mt-3 block text-xs font-semibold text-text-muted" htmlFor="vr-fov">
            Campo de visión (FOV): {fov}°
          </label>
          <input
            id="vr-fov"
            type="range"
            min="40"
            max="100"
            step="1"
            value={fov}
            onChange={(e) => setFov(Number(e.target.value))}
            className="mb-3 w-full accent-primary"
          />

          {cameraMode === 'third' && (
            <div className="mt-1 border-t border-border pt-3">
              <p className="mb-2 text-xs font-semibold text-text-muted">
                Ajustes de cámara en 3ra persona
              </p>

              <label className="mb-1 block text-xs font-semibold text-text-muted" htmlFor="vr-cam-distance">
                Distancia: {cameraDistance.toFixed(1)}
              </label>
              <input
                id="vr-cam-distance"
                type="range"
                min="2"
                max="15"
                step="0.5"
                value={cameraDistance}
                onChange={(e) => setCameraDistance(Number(e.target.value))}
                className="mb-3 w-full accent-primary"
              />

              <label className="mb-1 block text-xs font-semibold text-text-muted" htmlFor="vr-cam-height">
                Altura: {cameraHeight.toFixed(1)}
              </label>
              <input
                id="vr-cam-height"
                type="range"
                min="0.5"
                max="6"
                step="0.1"
                value={cameraHeight}
                onChange={(e) => setCameraHeight(Number(e.target.value))}
                className="mb-3 w-full accent-primary"
              />

              <label className="mb-1 block text-xs font-semibold text-text-muted" htmlFor="vr-zoom-min">
                Zoom mínimo (más cerca): {zoomMin.toFixed(1)}
              </label>
              <input
                id="vr-zoom-min"
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={zoomMin}
                onChange={(e) => setZoomMin(Math.min(Number(e.target.value), zoomMax - 0.5))}
                className="mb-3 w-full accent-primary"
              />

              <label className="mb-1 block text-xs font-semibold text-text-muted" htmlFor="vr-zoom-max">
                Zoom máximo (más lejos): {zoomMax.toFixed(0)}
              </label>
              <input
                id="vr-zoom-max"
                type="range"
                min="10"
                max="80"
                step="1"
                value={zoomMax}
                onChange={(e) => setZoomMax(Math.max(Number(e.target.value), zoomMin + 0.5))}
                className="mb-3 w-full accent-primary"
              />

              <label className="mb-1 block text-xs font-semibold text-text-muted" htmlFor="vr-pitch-min">
                Límite al mirar hacia abajo: {pitchMin.toFixed(2)}
              </label>
              <input
                id="vr-pitch-min"
                type="range"
                min="-1.2"
                max="0"
                step="0.05"
                value={pitchMin}
                onChange={(e) => setPitchMin(Math.min(Number(e.target.value), pitchMax - 0.05))}
                className="mb-3 w-full accent-primary"
              />

              <label className="mb-1 block text-xs font-semibold text-text-muted" htmlFor="vr-pitch-max">
                Límite al mirar hacia arriba: {pitchMax.toFixed(2)}
              </label>
              <input
                id="vr-pitch-max"
                type="range"
                min="0"
                max="1.4"
                step="0.05"
                value={pitchMax}
                onChange={(e) => setPitchMax(Math.max(Number(e.target.value), pitchMin + 0.05))}
                className="mb-3 w-full accent-primary"
              />

              <p className="text-xs text-text-muted">
                💡 Sube "Límite al mirar hacia arriba" y aleja el zoom para ver los techos de los
                edificios. Sube el "Zoom mínimo" si quieres acercarte más a tu personaje.
              </p>
            </div>
          )}

          {cameraMode === 'first' && (
            <p className="mt-3 text-xs text-text-muted">
              👁️ Modo primera persona: arrastra para mirar alrededor, W A S D para moverte.
            </p>
          )}

          <div className="mt-3 border-t border-border pt-3 flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={noClip}
                onChange={(e) => setNoClip(e.target.checked)}
                className="accent-primary"
              />
              🚧 Atravesar paredes (noClip)
              {noClip && <span className="ml-auto text-yellow-400">ACTIVO</span>}
            </label>
            <p className="text-[10px] text-text-muted -mt-1">
              Actívalo si tu personaje quedó atrapado. Recuerda desactivarlo después.
            </p>
            <label className="flex items-center gap-2 text-xs font-semibold text-text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={npcVoice}
                onChange={(e) => setNpcVoice(e.target.checked)}
                className="accent-primary"
              />
              🔊 Leer voces (NPCs y chat en voz alta)
            </label>
          </div>
          </>
          )}

          {tab === 'interfaz' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-text-muted">
                El botón 👁️ de la barra lateral oculta TODA la interfaz (menús, chat, voz, mascota
                flotante y controles táctiles) para tomar capturas limpias del mundo — vuelve a
                presionarlo para mostrarla de nuevo.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCameraDistance(CAMERA_DEFAULTS.cameraDistance)
                  setCameraHeight(CAMERA_DEFAULTS.cameraHeight)
                  setZoomMin(CAMERA_DEFAULTS.zoomMin)
                  setZoomMax(CAMERA_DEFAULTS.zoomMax)
                  setPitchMin(CAMERA_DEFAULTS.pitchMin)
                  setPitchMax(CAMERA_DEFAULTS.pitchMax)
                  setFov(CAMERA_DEFAULTS.fov)
                }}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-muted transition-colors hover:border-primary hover:text-primary"
              >
                ↺ Restablecer cámara a valores por defecto
              </button>
              <p className="text-[10px] text-text-muted">
                La barra de habilidades (abajo, al centro) se puede arrastrar para reposicionarla
                — mantén presionado y suelta donde prefieras.
              </p>
            </div>
          )}

          {tab === 'atajos' && (
            <div className="flex flex-col gap-1.5 text-xs text-text-muted">
              {[
                ['WASD / flechas', 'Moverse'],
                ['R (mantener)', 'Correr (sprint)'],
                ['Espacio', 'Saltar'],
                ['Arrastrar / stick derecho', 'Mirar alrededor'],
                ['Rueda / pellizco', 'Zoom de cámara'],
                ['Enter / C', 'Abrir chat'],
                ['M', 'Abrir mapa'],
                ['E', 'Interactuar con NPCs/objetos'],
                ['F', 'Habilidad de ataque (según tu clase)'],
              ].map(([key, action]) => (
                <div key={key} className="flex items-center justify-between gap-2 rounded-lg bg-black/20 px-2 py-1.5">
                  <span className="font-mono font-bold text-text">{key}</span>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  ) : null
}
