import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRacingStore, levelOfXp, xpForLevel } from '../../stores/useRacingStore'
import { buildVehicle, ACCESSORY_LIST, CHARACTERS } from './vehicles'
import { tierSpeed, MAX_TIER, FLY_FROM } from './racingData'
import { tt, worldText, tierName } from './racingI18n'
import * as THREE from 'three'

// GARAJE de Oliver Racing: tu vehículo en 3D, los 14 de la escalera (se desbloquean al alcanzarlos en una carrera), tu nivel y progreso
// en este mundo, y la personalización (pintura, luces y accesorio) que se guarda en tu cuenta (useRacingStore).
const SOLID = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85 })
const GLOW = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })
const TRAILS = ['#7df9ff', '#fde047', '#f472b6', '#4ade80', '#fb923c', '#c084fc']
const WHEELS = ['#ef4444', '#facc15', '#38bdf8', '#e5e7eb', '#a855f7', '#22c55e']
const PRESETS = {
  medicina: ['#22d3ee', '#ef4444', '#f8fafc', '#22c55e', '#f97316', '#a78bfa'],
  programacion: ['#22c55e', '#38bdf8', '#a855f7', '#facc15', '#ef4444', '#f472b6'],
  filosofia: ['#eab308', '#f5f5f4', '#7c3aed', '#0ea5e9', '#b45309', '#14b8a6'],
}

export function Preview({ world, tier, custom }) {
  const group = useRef()
  const model = useMemo(() => buildVehicle(world.tiers[tier].kind, world.color, world.emblem, custom), [world, tier, custom])
  useEffect(() => () => { model.solid?.dispose(); model.glow?.dispose() }, [model])
  useFrame((_, dt) => { if (group.current) group.current.rotation.y += dt * 0.6 })
  const fly = tier >= FLY_FROM
  return (
    <>
      <color attach="background" args={['#0d1226']} />
      <hemisphereLight args={['#ffffff', '#1a2350', 1.3]} />
      <directionalLight position={[4, 8, 5]} intensity={2.2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}><circleGeometry args={[4.5, 40]} /><meshStandardMaterial color="#1a2350" /></mesh>
      <group ref={group} position={[0, fly ? 0.9 : 0, 0]} scale={tier >= 12 ? 0.62 : 1.15}>
        {model.solid && <mesh geometry={model.solid} material={SOLID} />}
        {model.glow && <mesh geometry={model.glow} material={GLOW} />}
      </group>
    </>
  )
}

export default function RacingGarage({ world, lang, onBack, onStart, unlockAll = false }) {
  const T = (k) => tt(lang, k)
  const raw = useRacingStore((s) => s.worlds[world.id])
  const pr = useMemo(() => useRacingStore.getState().profile(world.id), [raw, world.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const { patch, setCustom } = useRacingStore.getState()
  const level = levelOfXp(pr.xp), lo = xpForLevel(level), hi = xpForLevel(level + 1)
  const best = unlockAll ? MAX_TIER : pr.bestTier // en el modo libre están todos los vehículos
  const sel = Math.min(pr.startTier, best)
  const custom = useMemo(() => ({ color: pr.custom.color, glow: pr.custom.glow, accessory: pr.custom.accessory, char: pr.custom.char, wheels: pr.custom.wheels }), [pr.custom.color, pr.custom.glow, pr.custom.accessory, pr.custom.char, pr.custom.wheels])
  const btn = 'rounded-xl px-4 py-2 text-sm font-bold transition active:scale-95'
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1020] to-[#1a1033] p-3 text-white sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3">
          <button className="text-xs opacity-70" onClick={onBack}>{tt(lang, 'back')}</button>
          <h1 className="text-2xl font-black">🔧 {T('garage')} · <span style={{ color: world.color }}>{world.icon} {worldText(lang, world, 'name')}</span></h1>
          <button className={`${btn} ml-auto bg-amber-400 text-black`} onClick={() => onStart(sel)}>{T('race')} →</button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="h-72 overflow-hidden rounded-2xl border border-white/15 sm:h-96">
              <Canvas camera={{ position: [5, 2.8, 6], fov: 40 }}><Preview world={world} tier={sel} custom={custom} /></Canvas>
            </div>
            <div className="mt-3 rounded-2xl bg-white/5 p-4">
              <div className="flex items-end justify-between">
                <div><div className="text-xl font-black" style={{ color: world.color }}>{tierName(lang, world, sel)}</div><div className="text-xs opacity-60">{T('speedStat')} {Math.round(tierSpeed(sel) * 3.6)} km/h {sel >= FLY_FROM ? `· ${T('flies')}` : ''}</div></div>
                <div className="text-right"><div className="text-sm font-bold">{T('level')} {level}</div><div className="text-[11px] opacity-60">{pr.xp} {T('xp')}</div></div>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${Math.min(100, ((pr.xp - lo) / (hi - lo)) * 100)}%`, background: world.color }} /></div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-lg bg-white/5 p-2"><b className="text-base">{pr.runs}</b><br />{T('runsN')}</div>
                <div className="rounded-lg bg-white/5 p-2"><b className="text-base text-emerald-400">{pr.correct}</b><br />{T('hits')}</div>
                <div className="rounded-lg bg-white/5 p-2"><b className="text-base text-amber-300">{pr.bestScore}</b><br />{T('bestScore')}</div>
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-white/5 p-4">
              <div className="mb-2 text-sm font-extrabold">🎨 {T('customize')}</div>
              <div className="text-[11px] opacity-60">{T('presets')}</div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {PRESETS[world.id].map((c) => <button key={c} className="h-7 w-7 rounded-full border-2" style={{ background: c, borderColor: pr.custom.color === c ? '#fff' : 'transparent' }} onClick={() => setCustom(world.id, { color: c })} />)}
                <label className="ml-2 flex items-center gap-1.5 text-xs">{T('paint')}<input type="color" className="h-7 w-9 rounded bg-transparent" value={pr.custom.color || world.color} onChange={(e) => setCustom(world.id, { color: e.target.value })} /></label>
                <label className="ml-2 flex items-center gap-1.5 text-xs">{T('glowC')}<input type="color" className="h-7 w-9 rounded bg-transparent" value={pr.custom.glow || '#ffffff'} onChange={(e) => setCustom(world.id, { glow: e.target.value })} /></label>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="opacity-60">{T('nick')}</span>
                <input value={pr.custom.name || ''} maxLength={14} placeholder={T('nickPh')} onChange={(e) => { for (const w of Object.keys(PRESETS)) setCustom(w, { name: e.target.value }) }} className="w-40 rounded-lg bg-black/40 px-3 py-1.5 text-sm font-bold" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="opacity-60">{T('trailC')}</span>
                {[null, ...TRAILS].map((c) => <button key={c || 'x'} className="h-6 w-6 rounded-full border-2 text-[10px]" style={{ background: c || '#222', borderColor: pr.custom.trail === c ? '#fff' : 'transparent' }} onClick={() => setCustom(world.id, { trail: c })}>{c ? '' : '∅'}</button>)}
                <span className="ml-3 opacity-60">{T('wheelC')}</span>
                {[null, ...WHEELS].map((c) => <button key={c || 'x'} className="h-6 w-6 rounded-full border-2 text-[10px]" style={{ background: c || '#23262d', borderColor: pr.custom.wheels === c ? '#fff' : 'transparent' }} onClick={() => setCustom(world.id, { wheels: c })}>{c ? '' : '∅'}</button>)}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="opacity-60">{T('pilot')}</span>
                {CHARACTERS.map((c) => <button key={c.id} className={`flex items-center gap-1 rounded-lg px-2 py-1 font-bold ${pr.custom.char === c.id ? 'bg-white text-black' : 'bg-white/10'}`} onClick={() => setCustom(world.id, { char: c.id })}><span className="h-3.5 w-3.5 rounded-full border border-black/30" style={{ background: c.skin }} />{c.name}</button>)}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="opacity-60">{T('accessory')}</span>
                {ACCESSORY_LIST.map((a) => <button key={a} className={`rounded-lg px-2.5 py-1 font-bold ${pr.custom.accessory === a ? 'bg-white text-black' : 'bg-white/10'}`} onClick={() => setCustom(world.id, { accessory: a })}>{T(`acc_${a}`)}</button>)}
                <button className="ml-auto rounded-lg bg-white/10 px-2.5 py-1" onClick={() => setCustom(world.id, { color: null, glow: null, accessory: 'none', char: 'doc', trail: null, wheels: null })}>{T('resetC')}</button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 p-3">
            <div className="mb-2 flex items-center justify-between text-sm font-extrabold"><span>🏎️ {T('vehicles')}</span><span className="text-xs font-semibold opacity-60">{best + 1} / {MAX_TIER + 1} {T('unlocked').toLowerCase()}</span></div>
            <div className="grid max-h-[70vh] gap-1.5 overflow-auto pr-1">
              {world.tiers.map((t, i) => {
                const open = i <= best
                return (
                  <button key={i} disabled={!open} onClick={() => patch(world.id, { startTier: i })}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${sel === i ? 'bg-white/15' : 'bg-white/5'} ${open ? 'hover:bg-white/10' : 'cursor-not-allowed opacity-50'}`}
                    style={{ borderColor: sel === i ? world.color : 'transparent' }}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-sm font-black">{open ? i + 1 : '🔒'}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{tierName(lang, world, i)}</span><span className="block text-[10px] opacity-60">{open ? `${Math.round(tierSpeed(i) * 3.6)} km/h${i >= FLY_FROM ? ` · ${T('flies')}` : ''}` : T('lockedHint')}</span></span>
                    {sel === i && <span className="text-xs font-black" style={{ color: world.color }}>▶ {T('startWith')}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
