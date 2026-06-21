import { useEffect, useRef, useState } from 'react'
import { DIRECTION_KEYS } from './constants'

// True if the event target is a text input/textarea (or contenteditable),
// i.e. the player is typing somewhere — movement keys should be ignored
// while that's happening.
export function isTypingTarget(target) {
  return !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
}

// Tracks which movement keys (WASD + arrows) are currently held down, from
// either a physical keyboard or the on-screen touch D-pad.
export function useMovementKeys() {
  const keys = useRef({})

  useEffect(() => {
    const handleDown = (e) => {
      if (isTypingTarget(e.target)) return
      keys.current[e.key.toLowerCase()] = true
    }
    const handleUp = (e) => {
      keys.current[e.key.toLowerCase()] = false
    }
    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
    return () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
    }
  }, [])

  return keys
}

// True for touch/coarse-pointer devices (phones, tablets, consoles with a
// touchscreen), regardless of viewport width — a width-only check alone
// hides the D-pad on larger phones in landscape or on tablets, which makes
// movement look "broken" on those devices (the controls were simply
// invisible, not broken).
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window),
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(pointer: coarse)')
    const update = () => setIsTouch(mq.matches || 'ontouchstart' in window)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return isTouch
}

// Analog virtual joystick for phones/tablets. A draggable knob inside a fixed
// outer ring translates its (x,y) offset from center into WASD movement flags,
// so Player sees the exact same input as a physical keyboard. Pointer capture
// keeps tracking even when the finger drifts outside the ring.
export function VirtualJoystick({ keysRef, hidden }) {
  const isTouch = useIsTouchDevice()
  const outerRef = useRef(null)
  const knobRef  = useRef(null)
  const activeId = useRef(null)
  const DEAD = 0.28 // fraction of radius below which movement is ignored

  const getPos = (e) => {
    const el = outerRef.current
    if (!el) return { nx: 0, ny: 0, px: 0, py: 0 }
    const rect = el.getBoundingClientRect()
    const r    = rect.width / 2
    const dx   = e.clientX - (rect.left + r)
    const dy   = e.clientY - (rect.top  + r)
    const dist = Math.min(Math.hypot(dx, dy), r)
    const ang  = Math.atan2(dy, dx)
    const px   = Math.cos(ang) * dist
    const py   = Math.sin(ang) * dist
    return { nx: px / r, ny: py / r, px, py }
  }

  const applyKeys = (nx, ny) => {
    DIRECTION_KEYS.up.forEach((k)    => { keysRef.current[k] = ny < -DEAD })
    DIRECTION_KEYS.down.forEach((k)  => { keysRef.current[k] = ny >  DEAD })
    DIRECTION_KEYS.left.forEach((k)  => { keysRef.current[k] = nx < -DEAD })
    DIRECTION_KEYS.right.forEach((k) => { keysRef.current[k] = nx >  DEAD })
  }

  const moveKnob = (px, py) => {
    if (knobRef.current)
      knobRef.current.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`
  }

  const onDown = (e) => {
    if (activeId.current !== null) return
    e.preventDefault()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
    activeId.current = e.pointerId
    const { nx, ny, px, py } = getPos(e)
    moveKnob(px, py)
    applyKeys(nx, ny)
  }

  const onMove = (e) => {
    if (activeId.current !== e.pointerId) return
    e.preventDefault()
    const { nx, ny, px, py } = getPos(e)
    moveKnob(px, py)
    applyKeys(nx, ny)
  }

  const onUp = (e) => {
    if (activeId.current !== e.pointerId) return
    activeId.current = null
    moveKnob(0, 0)
    applyKeys(0, 0)
  }

  if (!isTouch || hidden) return null

  return (
    <div
      ref={outerRef}
      className="pointer-events-auto absolute bottom-6 left-5 z-20 h-28 w-28 rounded-full border-2 border-white/30 bg-black/30 backdrop-blur-sm"
      style={{ touchAction: 'none' }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* dead-zone indicator */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
      {/* draggable knob */}
      <div
        ref={knobRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 rounded-full bg-white/70 shadow-xl"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </div>
  )
}

// Jump + (optional) chat buttons for mobile, bottom-right corner.
// `onOpenChat` is optional — worlds without a chat feature can omit it and
// only the jump button renders.
export function MobileButtons({ keysRef, hidden, onOpenChat }) {
  const isTouch = useIsTouchDevice()
  if (!isTouch || hidden) return null

  const setJump = (v) => (e) => {
    e.preventDefault()
    try {
      if (v) e.currentTarget.setPointerCapture(e.pointerId)
      else   e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}
    keysRef.current[' '] = v
  }

  return (
    <div className="pointer-events-none absolute bottom-6 right-4 z-20 flex flex-col items-center gap-2">
      <button
        type="button"
        onPointerDown={setJump(true)}
        onPointerUp={setJump(false)}
        onPointerCancel={setJump(false)}
        onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: 'none' }}
        className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 bg-black/30 text-2xl text-white shadow-xl backdrop-blur-sm active:bg-primary/50"
        aria-label="saltar"
      >
        ↑
      </button>
      {onOpenChat && (
        <button
          type="button"
          onClick={onOpenChat}
          onContextMenu={(e) => e.preventDefault()}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/30 text-xl text-white shadow-lg backdrop-blur-sm active:bg-primary/40"
          aria-label="chat"
        >
          💬
        </button>
      )}
    </div>
  )
}
