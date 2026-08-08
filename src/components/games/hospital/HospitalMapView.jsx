import { useEffect, useRef, useState, useCallback } from 'react'
import Phaser from 'phaser'
import HospitalScene, { bridge, roleLabel } from './hospitalScene'
import { HackerPanel, DoctorPanel, DoorLockedNotice, SecurityBar, HACK_DELTA, TREAT_DELTA, BLUE_PATCH_DELTA } from './HospitalPanels'
import { supabase } from '../../../services/supabase/client'

// Joystick táctil — copia recortada de World2dPage.jsx (no está exportado
// de ahí; es chico y self-contained, no vale la pena acoplar los dos
// features solo por esto).
function VirtualJoystick({ dirRef }) {
  const baseRef = useRef(null)
  const stickRef = useRef(null)
  const touchRef = useRef(null)
  const originRef = useRef({ x: 0, y: 0 })

  const move = useCallback((cx, cy) => {
    const o = originRef.current
    const dx = cx - o.x, dy = cy - o.y
    const dist = Math.hypot(dx, dy)
    const max = 44
    const clamped = Math.min(dist, max)
    const angle = Math.atan2(dy, dx)
    const ox = Math.cos(angle) * clamped
    const oy = Math.sin(angle) * clamped
    if (stickRef.current) {
      stickRef.current.style.transform = `translate(calc(-50% + ${ox}px), calc(-50% + ${oy}px))`
    }
    dirRef.current = dist > 8
      ? { x: Math.cos(angle) * Math.min(dist / max, 1), y: Math.sin(angle) * Math.min(dist / max, 1) }
      : { x: 0, y: 0 }
  }, [dirRef])

  const reset = useCallback(() => {
    if (stickRef.current) stickRef.current.style.transform = 'translate(-50%, -50%)'
    dirRef.current = { x: 0, y: 0 }
    touchRef.current = null
  }, [dirRef])

  const onTouchStart = useCallback((e) => {
    const t = e.changedTouches[0]
    touchRef.current = t.identifier
    const rect = baseRef.current.getBoundingClientRect()
    originRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    move(t.clientX, t.clientY)
  }, [move])

  const onTouchMove = useCallback((e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === touchRef.current) { move(t.clientX, t.clientY); break }
    }
  }, [move])

  return (
    <div ref={baseRef} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={reset} onTouchCancel={reset}
      className="relative h-24 w-24 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.18)', touchAction: 'none' }}>
      <div ref={stickRef} className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 rounded-full"
        style={{ transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.28)', border: '2px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)' }} />
    </div>
  )
}

// "Oliver Cyber Range: Hospital" — versión mapa. Ambos jugadores entran
// directo a un mapa 2D compartido (mismo motor que Mundo 2D/campusScene.js)
// en vez de una pantalla dividida estática: el Hacker camina hasta el
// Cuarto de Servidores y el Doctor hasta Recepción para que se abra su
// panel de objetivo. La partida en sí (medidor de seguridad, reloj,
// resultado) sigue siendo la misma lógica de HospitalRangeGame.jsx —
// este componente solo cambia CÓMO se llega al panel.
const ROLE_COLOR = { hacker: '#4ade80', hacker_red: '#ef4444', hacker_blue: '#22d3ee', doctor: '#60a5fa' }

// Lo que ve el Doctor al entrar a Recepción antes de acercarse a un
// paciente concreto — entrar al cuarto ya no abre el diagnóstico solo,
// hay que caminar hasta alguien (ver PATIENT_NPCS en hospitalScene.js).
function WaitingRoomHint() {
  return (
    <div className="flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-sky-900/50 bg-surface p-6 text-center">
      <p className="mb-3 text-5xl">🪑</p>
      <p className="text-lg font-bold text-text">Sala de espera</p>
      <p className="mt-2 max-w-xs text-sm text-text-muted">Hay pacientes esperando — camina hasta uno de ellos para atenderlo.</p>
    </div>
  )
}

export default function HospitalMapView({ activeMatch, myId, myName, myRole, oppName, isOver, result, iWon, secondsLeft, isSolo, doorLocked, onToggleDoor, onSolve, onExit }) {
  const containerRef = useRef(null)
  const gameRef = useRef(null)
  const dirRef = useRef({ x: 0, y: 0 })
  const channelRef = useRef(null)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [compass, setCompass] = useState(null)
  const [nearPatient, setNearPatient] = useState(false)

  bridge.dir = dirRef
  bridge.meta = { name: myName, color: ROLE_COLOR[myRole] ?? '#98ca3f', role: myRole }
  bridge.doorLocked = !!doorLocked

  useEffect(() => {
    if (!containerRef.current || isOver) return

    const config = {
      type: Phaser.AUTO,
      width: containerRef.current.clientWidth || window.innerWidth,
      height: containerRef.current.clientHeight || 480,
      parent: containerRef.current,
      backgroundColor: '#081018',
      physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
      scene: [HospitalScene],
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    }

    // Solo ABRE el panel al entrar al radio; cerrarlo queda en manos del
    // jugador (botón "Cerrar" en el overlay) para que no parpadee si se
    // queda parado justo en el borde de la zona.
    bridge.onObjectiveNear = (near) => { if (near) setOverlayOpen(true) }
    bridge.onPosition = (x, y) => {
      channelRef.current?.track({ x: Math.round(x), y: Math.round(y), name: myName, role: myRole })
    }
    // Brújula hacia tu zona de objetivo — sin esto no hay ninguna pista de
    // hacia dónde caminar en un mapa que puede sentirse grande al inicio.
    bridge.onObjectiveVector = (dx, dy, dist, near) => {
      setCompass(near ? null : { angle: Math.atan2(dy, dx), dist: Math.round(dist) })
    }
    // Solo el Doctor lo usa — entrar a Recepción abre el aviso de puerta
    // (si aplica), pero el panel de diagnóstico en sí espera a esto: estar
    // parado junto a un paciente concreto, no en cualquier punto del cuarto.
    bridge.onPatientNear = (near) => setNearPatient(near)

    gameRef.current = new Phaser.Game(config)

    return () => {
      bridge.onObjectiveNear = null
      bridge.onPosition = null
      bridge.onObjectiveVector = null
      bridge.onPatientNear = null
      bridge.scene = null
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOver])

  useEffect(() => {
    // En modo práctica solo no hay un segundo jugador real ni un match_id
    // real en la base — no tiene sentido abrir un canal de presencia.
    if (!activeMatch?.id || !myId || isOver || isSolo) return
    const ch = supabase.channel(`hospital_presence:${activeMatch.id}`, { config: { presence: { key: myId } } })

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState()
      const all = Object.values(state).flat()
      const scene = bridge.scene
      if (!scene) return
      const seen = new Set()
      for (const p of all) {
        if (p.key === myId || !p.name) continue
        seen.add(p.key)
        const color = p.role === 'hacker' ? '#4ade80' : '#60a5fa'
        scene.addOther(p.key, p.x ?? 1150, p.y ?? 725, p.name, color)
        scene.moveOther(p.key, p.x ?? 1150, p.y ?? 725)
      }
      for (const id of Object.keys(scene._others ?? {})) {
        if (!seen.has(id)) scene.removeOther(id)
      }
    })

    ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') ch.track({ x: 1150, y: 725, name: myName, role: myRole })
    })

    channelRef.current = ch
    return () => { ch.unsubscribe(); channelRef.current = null }
  }, [activeMatch?.id, myId, myName, myRole, isOver, isSolo])

  const handleSolve = () => { onSolve(); setOverlayOpen(false) }

  if (isOver) {
    return (
      <div className="flex h-full items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-3xl border-2 border-border bg-surface p-8 text-center">
          <p className="mb-2 text-5xl">{iWon ? '🏆' : '💔'}</p>
          <p className="mb-1 text-2xl font-black text-text">
            {result === 'hacker' ? '🕶️ El Hacker vulneró el hospital' : '🩺 El Doctor mantuvo el hospital en pie'}
          </p>
          <p className="mb-5 text-sm font-semibold text-text-muted">{iWon ? '¡Ganaste!' : 'Perdiste esta vez.'}</p>
          <button type="button" onClick={onExit} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-background">Volver al lobby</button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#081018]">
      <div ref={containerRef} className="h-full w-full" />

      <div className="absolute left-1/2 top-3 flex -translate-x-1/2 flex-col items-center gap-1.5 rounded-2xl border border-white/15 bg-black/70 px-4 py-2 backdrop-blur">
        <div className="w-64"><SecurityBar security={activeMatch.security} /></div>
        <div className="flex items-center gap-3 text-[11px] font-bold text-white/80">
          {isSolo && <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-300">🧪 Práctica</span>}
          <span>{roleLabel(myRole)} vs {oppName}</span>
          <span className="font-mono">🕒 {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}</span>
          <span>💥 {activeMatch.hacks_completed} · 💉 {activeMatch.patients_saved}</span>
        </div>
      </div>

      <button type="button" onClick={onExit}
        className="absolute right-3 top-3 rounded-lg border border-white/20 bg-black/60 px-2.5 py-1.5 text-xs font-bold text-white/80 backdrop-blur hover:bg-black/80">
        ← Salir
      </button>

      {compass && !overlayOpen && (
        <div className="absolute bottom-24 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 rounded-full border border-white/15 bg-black/70 px-4 py-2 backdrop-blur md:bottom-4">
          <span className="text-xl leading-none" style={{ display: 'inline-block', transform: `rotate(${(compass.angle * 180) / Math.PI}deg)` }}>➤</span>
          <span className="text-[10px] font-bold text-white/70">
            {myRole === 'doctor' ? '🏥 Recepción' : '🖥️ Cuarto de Servidores'} · {compass.dist}m
          </span>
        </div>
      )}

      <div className="absolute bottom-4 left-4 touch-none select-none md:hidden">
        <VirtualJoystick dirRef={dirRef} />
      </div>
      <div className="absolute bottom-4 right-3 hidden rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[11px] text-white/50 backdrop-blur md:block">
        WASD / ↑↓←→ para moverte hacia tu objetivo
      </div>

      {overlayOpen && (
        <div className="absolute inset-0 z-20 flex flex-col bg-black/80 p-3 backdrop-blur-sm sm:p-6">
          <button type="button" onClick={() => setOverlayOpen(false)}
            className="mb-2 self-end rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold text-white/80 hover:bg-white/10">
            Cerrar ✕
          </button>
          <div className="min-h-0 flex-1">
            {myRole === 'doctor'
              ? (doorLocked ? <DoorLockedNotice />
                : nearPatient ? <DoctorPanel onSolve={handleSolve} disabled={isOver} />
                : <WaitingRoomHint />)
              : (
                <HackerPanel
                  team={myRole === 'hacker_red' ? 'red' : myRole === 'hacker_blue' ? 'blue' : undefined}
                  onSolve={handleSolve} disabled={isOver}
                  doorLocked={doorLocked} onToggleDoor={onToggleDoor}
                />
              )}
          </div>
        </div>
      )}
    </div>
  )
}

export { HACK_DELTA, TREAT_DELTA, BLUE_PATCH_DELTA }
