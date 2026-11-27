import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { Preview } from './RacingGarage'
import { WORLD_LIST, MAX_TIER, FLY_FROM, tierSpeed } from './racingData'
import { TRACK_LIST, trackOutline } from './trackMath'
import { tt, worldText, tierName } from './racingI18n'
import { useRacingStore, levelOfXp, xpForLevel, levelUnlocked } from '../../stores/useRacingStore'

// MENÚ PRINCIPAL de Oliver Racing, con aire de videojuego: barra superior con tu perfil, tres pestañas (MUNDO · MODO · PISTA), tu vehículo y piloto
// girando en 3D a la derecha y un botón enorme para correr. Todo el estado vive en RacingDemo (`c`); aquí solo se dibuja.
const MODES = [['race', '🏁'], ['free', '🛣️'], ['ai', '🤖'], ['online', '🌐']]

// Silueta de una pista vista desde arriba (para su tarjeta)
function TrackShape({ id, color }) {
  const d = useMemo(() => {
    const pts = trackOutline(id), xs = pts.map((p) => p.x), lo = Math.min(...xs), hi = Math.max(...xs), ys = pts.map((p) => p.y), top = Math.max(...ys)
    const k = Math.min(1.2, 70 / Math.max(1, hi - lo, 1)), kk = Math.min(k, 90 / top)
    return pts.map((p, i) => `${i ? 'L' : 'M'}${(50 + (p.x - (lo + hi) / 2) * kk).toFixed(1)},${(100 - (p.y / top) * 92 - 4).toFixed(1)}`).join(' ')
  }, [id])
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-16 shrink-0">
      <path d={d} fill="none" stroke="#ffffff33" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function RacingMenu({ c }) {
  const { lang, worldId, wsel, levelIdx, mode, trackId, room, codeIn, myId, racingWorlds, btn } = c
  const T = (k) => tt(lang, k)
  const [tab, setTab] = useState('world')
  const raw = useRacingStore((s) => s.worlds[worldId])
  const pr = useMemo(() => useRacingStore.getState().profile(worldId), [raw, worldId]) // eslint-disable-line react-hooks/exhaustive-deps
  const lvl = levelOfXp(pr.xp), lo = xpForLevel(lvl), hi = xpForLevel(lvl + 1)
  const best = mode === 'free' ? MAX_TIER : pr.bestTier, sel = Math.min(pr.startTier, best)
  const custom = useMemo(() => ({ color: pr.custom.color, glow: pr.custom.glow, accessory: pr.custom.accessory, char: pr.custom.char, wheels: pr.custom.wheels }), [pr.custom.color, pr.custom.glow, pr.custom.accessory, pr.custom.char, pr.custom.wheels])
  const lv = wsel.levels[Math.min(levelIdx, wsel.levels.length - 1)]
  const tabs = [['world', T('tabWorld')], ['mode', T('tabMode')], ['track', T('tabTrack')]]
  const online = mode === 'online'
  const isHost = room?.players[0]?.id === myId
  const goLabel = mode === 'free' ? T('freeGo') : online ? T('startOnline') : T('play')
  const canGo = !online || (isHost && (room?.players.length || 0) >= 2)
  const go = online ? c.startOnline : c.play

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070a18] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: `radial-gradient(900px 500px at 78% 30%, ${wsel.color}33, transparent 70%), radial-gradient(700px 500px at 5% 95%, #7c3aed33, transparent 70%)` }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-30" style={{ backgroundImage: 'linear-gradient(#ffffff22 1px, transparent 1px), linear-gradient(90deg, #ffffff22 1px, transparent 1px)', backgroundSize: '44px 44px', transform: 'perspective(500px) rotateX(62deg)', transformOrigin: 'bottom' }} />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col p-3 sm:p-6">
        {/* barra superior */}
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/dashboard" className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold">{T('back')}</Link>
          <h1 className="bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-300 bg-clip-text text-3xl font-black italic tracking-tight text-transparent sm:text-4xl">OLIVER RACING</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="min-w-[150px] rounded-xl bg-white/10 px-3 py-1.5">
              <div className="flex items-center justify-between text-xs font-black"><span>{pr.custom.name || T('you')}</span><span style={{ color: wsel.color }}>{T('level')} {lvl}</span></div>
              <div className="mt-1 h-1.5 rounded-full bg-black/40"><div className="h-full rounded-full" style={{ width: `${Math.min(100, ((pr.xp - lo) / (hi - lo)) * 100)}%`, background: wsel.color }} /></div>
            </div>
            {c.toggles}
          </div>
        </div>

        <div className="mt-4 grid flex-1 gap-4 lg:grid-cols-[1.15fr_1fr]">
          {/* izquierda: pestañas */}
          <div className="rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur">
            <div className="flex gap-2">
              {tabs.map(([k, label]) => <button key={k} onClick={() => setTab(k)} className={`flex-1 rounded-xl py-2 text-sm font-black tracking-wide transition ${tab === k ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>{label}</button>)}
            </div>

            {tab === 'world' && (
              <div className="mt-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  {WORLD_LIST.map((w) => {
                    const p = racingWorlds[w.id] || {}
                    return (
                      <button key={w.id} onClick={() => c.selectWorld(w.id)} className={`rounded-2xl border-2 p-3 text-left transition ${worldId === w.id ? 'scale-[1.03] bg-white/10' : 'bg-white/5 opacity-75 hover:opacity-100'}`} style={{ borderColor: worldId === w.id ? w.color : 'transparent', boxShadow: worldId === w.id ? `0 0 24px ${w.color}44` : 'none' }}>
                        <div className="text-3xl">{w.icon}</div>
                        <div className="mt-1 font-black" style={{ color: w.color }}>{worldText(lang, w, 'name')}</div>
                        <div className="text-[11px] opacity-70">{worldText(lang, w, 'tagline')}</div>
                        <div className="mt-2 text-[10px] opacity-60">{T('level')} {levelOfXp(p.xp || 0)} · {(p.bestTier || 0) + 1}/14 🏎️</div>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4 text-sm font-extrabold">{T('levelsTitle')}</div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {wsel.levels.map((l, i) => {
                    const open = levelUnlocked(racingWorlds[wsel.id] || {}, i, wsel.levels), stars = racingWorlds[wsel.id]?.levels?.[l.id]?.stars || 0
                    return (
                      <button key={l.id + i} disabled={!open} onClick={() => c.setLevelIdx(i)} className={`rounded-xl border-2 p-3 text-left transition ${levelIdx === i ? 'bg-white/10' : 'bg-white/5'} ${open ? 'hover:bg-white/10' : 'cursor-not-allowed opacity-45'}`} style={{ borderColor: levelIdx === i ? wsel.color : 'transparent' }}>
                        <div className="flex items-center justify-between gap-2"><span className="text-sm font-black">{open ? '' : '🔒 '}{l.name}</span><span className="shrink-0 text-xs text-amber-300">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</span></div>
                        <div className="mt-0.5 text-[11px] opacity-70">{open ? l.blurb : T('lockedLevel')}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {tab === 'mode' && (
              <div className="mt-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {MODES.map(([k, ic]) => (
                    <button key={k} onClick={() => c.setMode(k)} className={`rounded-2xl border-2 p-4 text-left transition ${mode === k ? 'bg-white/10' : 'bg-white/5 opacity-80 hover:opacity-100'}`} style={{ borderColor: mode === k ? wsel.color : 'transparent' }}>
                      <div className="text-2xl">{ic}</div>
                      <div className="mt-1 text-sm font-black">{T(`mode${k[0].toUpperCase()}${k.slice(1)}`)}</div>
                      <div className="mt-0.5 text-[11px] opacity-70">{T(`mode${k[0].toUpperCase()}${k.slice(1)}D`)}</div>
                    </button>
                  ))}
                </div>
                {online && (
                  <div className="mt-3 rounded-xl bg-white/5 p-3 text-sm">
                    {!c.netAvailable ? <div className="opacity-70">{T('noRealtime')}</div> : !room ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <button className={`${btn} bg-emerald-400 text-black`} onClick={c.createRoom}>{T('createRoom')}</button>
                        <input value={codeIn} onChange={(e) => c.setCodeIn(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4))} placeholder={T('roomCode')} className="w-32 rounded-lg bg-black/40 px-3 py-2 text-center text-sm font-black uppercase tracking-widest" />
                        <button disabled={codeIn.length !== 4} className={`${btn} bg-white/15 disabled:opacity-40`} onClick={() => c.enterRoom(codeIn)}>{T('joinRoom')}</button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-3"><span className="opacity-60">{T('roomCode')}</span><span className="rounded-lg bg-black/40 px-3 py-1 text-2xl font-black tracking-[0.3em]">{room.code}</span><button className="ml-auto rounded-lg bg-white/10 px-2.5 py-1 text-xs" onClick={c.leaveRoom}>{T('leaveRoom')}</button></div>
                        <div className="mt-2 text-xs opacity-70">{T('playersIn')} ({room.players.length})</div>
                        <div className="mt-1 flex flex-wrap gap-1.5">{room.players.map((p, i) => <span key={p.id} className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: `${p.color}55` }}>{i === 0 ? '👑 ' : ''}{p.name}{p.id === myId ? ` (${T('you')})` : ''}</span>)}</div>
                        <div className="mt-2 text-xs opacity-70">{isHost ? (room.players.length < 2 ? T('needTwo') : T('youHost')) : T('waitHost')}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {tab === 'track' && (
              <div className="mt-4">
                <div className="text-sm font-extrabold">{T('trackTitle')}</div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {TRACK_LIST.map((id) => (
                    <button key={id} onClick={() => c.setTrackId(id)} className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${trackId === id ? 'bg-white/10' : 'bg-white/5 opacity-80 hover:opacity-100'}`} style={{ borderColor: trackId === id ? wsel.color : 'transparent' }}>
                      <TrackShape id={id} color={wsel.color} />
                      <div className="min-w-0"><div className="text-sm font-black">{T(`trk_${id}`)}</div><div className="mt-0.5 text-[11px] opacity-70">{T(`trkd_${id}`)}</div></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* derecha: tu vehículo */}
          <div className="flex flex-col rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur">
            <div className="h-64 overflow-hidden rounded-2xl border border-white/10 sm:h-80">
              <Canvas camera={{ position: [5, 2.8, 6], fov: 40 }}><Preview world={wsel} tier={sel} custom={custom} /></Canvas>
            </div>
            <div className="mt-3 flex items-end justify-between gap-2">
              <div className="min-w-0"><div className="truncate text-xl font-black" style={{ color: wsel.color }}>{tierName(lang, wsel, sel)}</div><div className="text-xs opacity-70">{Math.round(tierSpeed(sel) * 3.6)} km/h {sel >= FLY_FROM ? `· ${T('flies')}` : ''}</div></div>
              <button className={`${btn} shrink-0 bg-white/15`} onClick={c.openGarage}>🔧 {T('garage')}</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold">
              {[[wsel.icon, worldText(lang, wsel, 'name')], ['📍', lv?.name], ['🎮', T(`mode${mode[0].toUpperCase()}${mode.slice(1)}`)], ['🛣️', T(`trk_${trackId}`)]].map(([ic, t], i) => <span key={i} className="rounded-full bg-white/10 px-2.5 py-1">{ic} {t}</span>)}
            </div>
            <div className="mt-auto pt-4">
              <button disabled={!canGo} onClick={go} className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-4 text-2xl font-black italic tracking-wider text-black shadow-[0_0_30px_#f59e0b66] transition hover:scale-[1.02] active:scale-95 disabled:opacity-40">{goLabel} ▶</button>
              <p className="mt-2 text-center text-[11px] opacity-60">{T('controls')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
