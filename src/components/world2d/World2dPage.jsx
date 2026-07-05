import { useEffect, useRef, useState, useCallback } from 'react'
import Phaser from 'phaser'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import CampusScene, { bridge } from './campusScene'
import { useAuthStore } from '../../stores/useAuthStore'
import { useLevelStore } from '../../stores/useLevelStore'
import { supabase } from '../../services/supabase/client'

// ── Virtual Joystick ──────────────────────────────────────────────────────────
function VirtualJoystick({ dirRef }) {
  const baseRef   = useRef(null)
  const stickRef  = useRef(null)
  const touchRef  = useRef(null)
  const originRef = useRef({ x: 0, y: 0 })

  const move = useCallback((cx, cy) => {
    const o = originRef.current
    const dx = cx - o.x, dy = cy - o.y
    const dist = Math.hypot(dx, dy)
    const max  = 44
    const clamped = Math.min(dist, max)
    const angle   = Math.atan2(dy, dx)
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
    <div
      ref={baseRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={reset}
      onTouchCancel={reset}
      className="relative h-28 w-28 rounded-full"
      style={{ background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.18)', touchAction: 'none' }}
    >
      <div
        ref={stickRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 rounded-full"
        style={{
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255,255,255,0.28)',
          border: '2px solid rgba(255,255,255,0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />
    </div>
  )
}

// ── NPC bubble ────────────────────────────────────────────────────────────────
function NpcBubble({ npc }) {
  if (!npc) return null
  return (
    <div className="pointer-events-none absolute bottom-44 left-1/2 -translate-x-1/2 max-w-xs rounded-2xl border border-white/20 bg-black/70 px-4 py-3 text-center text-sm text-white shadow-xl backdrop-blur">
      <p className="mb-1 font-bold text-amber-300">{npc.emoji} {npc.name}</p>
      <p className="leading-snug text-white/90">{npc.dialogue}</p>
      <div className="mx-auto mt-2 h-0.5 w-16 rounded bg-white/20" />
      <p className="mt-1 text-[10px] text-white/40">acércate para hablar</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function World2dPage() {
  const containerRef = useRef(null)
  const gameRef      = useRef(null)
  const dirRef       = useRef({ x: 0, y: 0 })
  const channelRef   = useRef(null)

  const [nearNpc, setNearNpc]       = useState(null)
  const [onlineCount, setOnlineCount] = useState(1)
  const [zone, setZone]             = useState(null)

  const profile = useAuthStore((s) => s.profile)
  const session = useAuthStore((s) => s.session)
  const level   = useLevelStore((s) => s.level ?? 1)

  const playerName  = profile?.display_name ?? session?.user?.email?.split('@')[0] ?? 'Jugador'

  // Sync bridge meta (called once on mount, values won't change mid-session)
  bridge.dir  = dirRef
  bridge.meta = { name: playerName, color: '#98ca3f', level }

  // ── Phaser init ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return

    const config = {
      type: Phaser.AUTO,
      width:  containerRef.current.clientWidth  || window.innerWidth,
      height: containerRef.current.clientHeight || window.innerHeight - 56,
      parent: containerRef.current,
      backgroundColor: '#081208',
      physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
      scene: [CampusScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    }

    bridge.onNpcNear = setNearNpc
    bridge.onPosition = (x, y) => {
      channelRef.current?.track({ world: '2d', x: Math.round(x), y: Math.round(y), name: playerName })
    }

    gameRef.current = new Phaser.Game(config)

    return () => {
      bridge.onNpcNear  = null
      bridge.onPosition = null
      bridge.scene      = null
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Supabase presence ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return

    const userId = session.user.id
    const ch = supabase.channel('campus-presence-2d', { config: { presence: { key: userId } } })

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState()
      const all   = Object.values(state).flat()
      setOnlineCount(all.length)

      const scene = bridge.scene
      if (!scene) return

      const seen = new Set()
      for (const p of all) {
        if (p.key === userId || !p.name) continue
        seen.add(p.key)
        scene.addOther(p.key, p.x ?? 1200, p.y ?? 920, p.name, '#60a5fa')
        scene.moveOther(p.key, p.x ?? 1200, p.y ?? 920)
      }
      // Remove disconnected
      for (const id of Object.keys(bridge.scene?._others ?? {})) {
        if (!seen.has(id)) scene.removeOther(id)
      }
    })

    ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        ch.track({ world: '2d', x: 1200, y: 920, name: playerName })
      }
    })

    channelRef.current = ch
    return () => { ch.unsubscribe(); channelRef.current = null }
  }, [session?.user?.id, playerName])

  return (
    <div className="flex h-screen flex-col bg-background">
      <AppTopBar />

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden">
        <div ref={containerRef} className="h-full w-full" />

        {/* Online badge */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          {onlineCount} en línea · Mundo 2D
        </div>

        {/* Zone label placeholder — wired to zone state if added later */}
        {zone && (
          <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-white/20 bg-black/60 px-4 py-1 text-xs font-bold text-white backdrop-blur">
            {zone}
          </div>
        )}

        {/* NPC bubble */}
        <NpcBubble npc={nearNpc} />

        {/* Joystick (touch only) */}
        <div className="absolute bottom-6 left-6 touch-none select-none sm:hidden">
          <VirtualJoystick dirRef={dirRef} />
        </div>

        {/* Controls hint (desktop) */}
        <div className="absolute bottom-3 right-3 hidden rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[11px] text-white/50 backdrop-blur sm:block">
          WASD / ↑↓←→ para mover
        </div>
      </div>

      <MascotCompanion />
    </div>
  )
}
