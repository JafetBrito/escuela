import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import MascotMesh from '../mascot/MascotMesh'
import { MASCOTS, getMascotById } from '../../data/mascotRegistry'
import { useMascotStore } from '../../stores/useMascotStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useGameStore, OLIVER_CLASSES } from '../../stores/useGameStore'

const SELECTABLE_MASCOTS = MASCOTS.filter((m) => m.modelPath)

// ─── Mascot card ──────────────────────────────────────────────────────────────

function MascotCard({ mascot, selected, onSelect, onShowDesc }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(mascot.id)}
      onContextMenu={(e) => { e.preventDefault(); onShowDesc(mascot) }}
      title="Clic para seleccionar · Clic derecho para ver descripción"
      className="relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all hover:scale-105 focus:outline-none"
      style={{
        borderColor: selected ? mascot.color : 'var(--color-border)',
        background:  selected ? `${mascot.color}22` : 'var(--color-surface)',
        boxShadow:   selected ? `0 0 18px ${mascot.color}55` : 'none',
      }}>
      {/* Info hint */}
      <button
        type="button"
        tabIndex={-1}
        onClick={(e) => { e.stopPropagation(); onShowDesc(mascot) }}
        className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface/80 text-[9px] font-black text-text-muted hover:bg-primary hover:text-white">
        i
      </button>

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
        style={{ background: `${mascot.color}22` }}>
        {mascot.icon || '✨'}
      </div>
      <span className="text-center text-[11px] font-bold leading-tight"
        style={{ color: selected ? mascot.color : 'var(--color-text-muted)' }}>
        {mascot.name}
      </span>
    </button>
  )
}

// ─── Description tooltip ─────────────────────────────────────────────────────

function DescTooltip({ mascot, onClose }) {
  if (!mascot) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-4xl"
            style={{ background: `${mascot.color}22` }}>
            {mascot.icon || '✨'}
          </span>
          <div>
            <p className="text-lg font-black text-text">{mascot.name}</p>
            <div className="mt-1 h-1.5 w-12 rounded-full" style={{ background: mascot.color }} />
          </div>
        </div>
        <p className="text-sm leading-relaxed text-text-muted">
          {mascot.description || 'Un compañero fiel para tu aventura en Oliver School.'}
        </p>
        <button type="button" onClick={onClose}
          className="mt-4 w-full rounded-xl bg-surface py-2 text-sm font-bold text-text-muted border border-border hover:bg-background">
          Cerrar
        </button>
      </div>
    </div>
  )
}

// ─── Main overlay ─────────────────────────────────────────────────────────────

export default function VrMascotOnboarding() {
  const [step, setStep]               = useState(0)   // 0: choose mascot, 1: oliver class
  const [mascotId, setMascotId]       = useState(SELECTABLE_MASCOTS[0]?.id ?? 8)
  const [petName, setPetName]         = useState('')
  const [oliverClassId, setOliverClassId] = useState(null)
  const [descMascot, setDescMascot]   = useState(null)
  const [saving, setSaving]           = useState(false)

  const selectMascot          = useMascotStore((s) => s.selectMascot)
  const setMascotName         = useSettingsStore((s) => s.setMascotName)
  const selectOliverClass     = useGameStore((s) => s.selectOliverClass)
  const setWorldTreeCompleted = useGameStore((s) => s.setWorldTreeCompleted)
  const forceSyncToCloud      = useGameStore((s) => s.forceSyncToCloud)
  const playerClassId         = useGameStore((s) => s.player.class)

  const selectedMascot = getMascotById(mascotId)

  const handleFinish = async () => {
    if (!oliverClassId) return
    setSaving(true)
    selectMascot(mascotId)
    setMascotName(petName.trim() || selectedMascot.name)
    selectOliverClass(oliverClassId)
    setWorldTreeCompleted(true)
    try { await forceSyncToCloud() } catch { /* best effort */ }
    // oliverClass is now set → parent component hides this overlay
  }

  const oCls = oliverClassId ? OLIVER_CLASSES[oliverClassId] : null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm">
        <div className="w-full max-w-xl rounded-3xl border border-border bg-background shadow-2xl">

          {/* Header */}
          <div className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🐾</span>
              <div>
                <h2 className="text-xl font-black text-text">
                  {step === 0 ? '¡Elige tu compañero!' : `Clase de ${petName.trim() || selectedMascot.name}`}
                </h2>
                <p className="text-xs text-text-muted">
                  {step === 0
                    ? 'Clic derecho o ℹ para ver la descripción de cada mascota'
                    : 'La clase define las habilidades especiales de tu compañero'}
                </p>
              </div>
            </div>
            {/* Step dots */}
            <div className="mt-3 flex gap-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
                  style={{ background: i <= step ? '#98ca3f' : 'var(--color-border)' }} />
              ))}
            </div>
          </div>

          {/* ── Step 0: Choose mascot ── */}
          {step === 0 && (
            <div className="flex flex-col gap-5 p-6">
              {/* 3D preview */}
              <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-surface to-background"
                style={{ borderColor: `${selectedMascot.color}44` }}>
                <div className="h-44 w-full">
                  <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[3, 4, 3]} intensity={1.3} />
                    <Suspense fallback={null}>
                      <MascotMesh mascot={selectedMascot} />
                    </Suspense>
                  </Canvas>
                </div>
                <div className="flex items-center gap-3 border-t border-border px-4 py-2.5"
                  style={{ background: `${selectedMascot.color}0c` }}>
                  <span className="text-xl">{selectedMascot.icon || '✨'}</span>
                  <div>
                    <p className="text-sm font-black text-text">{selectedMascot.name}</p>
                    {selectedMascot.description && (
                      <p className="text-[11px] text-text-muted line-clamp-1">{selectedMascot.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mascot grid */}
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {SELECTABLE_MASCOTS.map((m) => (
                  <MascotCard key={m.id} mascot={m}
                    selected={m.id === mascotId}
                    onSelect={setMascotId}
                    onShowDesc={setDescMascot} />
                ))}
              </div>

              {/* Custom name */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-text-muted">
                  Nombre personalizado (opcional)
                </label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder={selectedMascot.name}
                  maxLength={24}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none transition focus:border-primary"
                />
              </div>

              <button type="button" onClick={() => setStep(1)}
                className="w-full rounded-2xl py-3.5 text-base font-black text-white transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: `linear-gradient(135deg, ${selectedMascot.color}, ${selectedMascot.color}bb)` }}>
                Continuar →
              </button>
            </div>
          )}

          {/* ── Step 1: Oliver class ── */}
          {step === 1 && (
            <div className="flex flex-col gap-4 p-6">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Object.values(OLIVER_CLASSES).map((ocls) => {
                  const isPaired  = playerClassId && ocls.pairedWith === playerClassId
                  const isSelected = oliverClassId === ocls.id
                  return (
                    <button key={ocls.id} type="button" onClick={() => setOliverClassId(ocls.id)}
                      className="relative flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-all hover:scale-[1.02]"
                      style={{
                        borderColor: isSelected ? ocls.color : isPaired ? `${ocls.color}66` : 'var(--color-border)',
                        background:  isSelected ? `${ocls.color}18` : isPaired ? `${ocls.color}08` : 'var(--color-surface)',
                        boxShadow:   isSelected ? `0 0 16px ${ocls.color}44` : 'none',
                      }}>
                      {isPaired && (
                        <span className="absolute right-2 top-2 rounded-full px-1.5 py-0.5 text-[9px] font-black"
                          style={{ background: `${ocls.color}33`, color: ocls.color }}>
                          ★ Recomendada
                        </span>
                      )}
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{ocls.icon}</span>
                        <div>
                          <p className="font-black text-text">{ocls.name}</p>
                          <p className="text-[11px] text-text-muted">{ocls.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)}
                  className="rounded-xl border border-border px-4 py-3 text-sm font-bold text-text-muted hover:bg-surface">
                  ← Atrás
                </button>
                <button type="button"
                  onClick={handleFinish}
                  disabled={!oliverClassId || saving}
                  className="flex-1 rounded-2xl py-3.5 text-base font-black text-white transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  style={oCls ? { background: `linear-gradient(135deg, ${oCls.color}, ${oCls.color}bb)` } : { background: 'var(--color-primary)' }}>
                  {saving ? 'Guardando…' : oliverClassId ? '¡Entrar al Campus VR! 🌍' : 'Elige una clase'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description tooltip */}
      {descMascot && (
        <DescTooltip mascot={descMascot} onClose={() => setDescMascot(null)} />
      )}
    </>
  )
}
