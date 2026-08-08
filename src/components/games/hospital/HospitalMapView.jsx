import { useEffect, useRef, useState, useCallback } from 'react'
import Phaser from 'phaser'
import HospitalScene, { bridge } from './hospitalScene'
import { HackerPanel, DoctorPanel, SecurityBar, HACK_DELTA, TREAT_DELTA } from './HospitalPanels'
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
export default function HospitalMapView({ activeMatch, myId, myName, myRole, oppName, isOver, result, iWon, secondsLeft, onSolve, onExit }) {
  const containerRef = useRef(null)
  const gameRef = useRef(null)
  const dirRef = useRef({ x: 0, y: 0 })
  const channelRef = useRef(null)
  const [overlayOpen, setOverlayOpen] = useState(false)

  const roleColor = myRole === 'hacker' ? '#4ade80' : '#60a5fa'
  bridge.dir = dirRef
  bridge.meta = { name: myName, color: roleColor, role: myRole }

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

    gameRef.current = new Phaser.Game(config)

    return () => {
      bridge.onObjectiveNear = null
      bridge.onPosition = null
      bridge.scene = null
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOver])

  useEffect(() => {
    if (!activeMatch?.id || !myId || isOver) return
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
        scene.addOther(p.key, p.x ?? 650, p.y ?? 475, p.name, color)
        scene.moveOther(p.key, p.x ?? 650, p.y ?? 475)
      }
      for (const id of Object.keys(scene._others ?? {})) {
        if (!seen.has(id)) scene.removeOther(id)
      }
    })

    ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') ch.track({ x: 650, y: 475, name: myName, role: myRole })
    })

    channelRef.current = ch
    return () => { ch.unsubscribe(); channelRef.current = null }
  }, [activeMatch?.id, myId, myName, myRole, isOver])

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
          <span>{myRole === 'hacker' ? '🕶️ Hacker' : '🩺 Doctor'} vs {oppName}</span>
          <span className="font-mono">🕒 {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}</span>
          <span>💥 {activeMatch.hacks_completed} · 💉 {activeMatch.patients_saved}</span>
        </div>
      </div>

      <button type="button" onClick={onExit}
        className="absolute right-3 top-3 rounded-lg border border-white/20 bg-black/60 px-2.5 py-1.5 text-xs font-bold text-white/80 backdrop-blur hover:bg-black/80">
        ← Salir
      </button>

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
            {myRole === 'hacker'
              ? <HackerPanel onSolve={handleSolve} disabled={isOver} />
              : <DoctorPanel onSolve={handleSolve} disabled={isOver} />}
          </div>
        </div>
      )}
    </div>
  )
}

export { HACK_DELTA, TREAT_DELTA }
