import { useCallback, useRef } from 'react'
import { usePopupPositionStore } from '../stores/usePopupPositionStore'

// Makes a floating popup draggable anywhere on screen via a "drag handle"
// element (attach `onPointerDown` to it). Persists the chosen top-left
// position (in px) per `id` so it reopens in the same spot.
export function useDraggablePopup(id) {
  const position = usePopupPositionStore((s) => s.positions[id])
  const setPosition = usePopupPositionStore((s) => s.setPosition)
  const elRef = useRef(null)
  const dragRef = useRef(null)

  const onPointerDown = useCallback(
    (e) => {
      const el = elRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      dragRef.current = { offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top }
      e.preventDefault()

      const onMove = (ev) => {
        if (!dragRef.current) return
        const x = Math.min(Math.max(0, ev.clientX - dragRef.current.offsetX), window.innerWidth - rect.width)
        const y = Math.min(Math.max(0, ev.clientY - dragRef.current.offsetY), window.innerHeight - rect.height)
        setPosition(id, { x, y })
      }
      const onUp = () => {
        dragRef.current = null
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [id, setPosition],
  )

  const scale = position?.scale ?? 1
  const style = {
    ...(position?.x != null ? { position: 'fixed', left: position.x, top: position.y, right: 'auto', bottom: 'auto' } : null),
    ...(scale !== 1 ? { transform: `scale(${scale})` } : null),
  }

  return { elRef, style: Object.keys(style).length ? style : undefined, scale, onPointerDown }
}
