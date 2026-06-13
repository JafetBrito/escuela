import { useEffect, useState } from 'react'

const CHECK_INTERVAL_MS = 1000
const SIZE_THRESHOLD_PX = 160

// Aggressive DevTools deterrent: blocks common shortcuts/right-click and
// flags `detected` when a docked DevTools panel changes the viewport-vs-
// window size delta. Note: a `debugger`-pause timing loop was deliberately
// NOT used here — it freezes the page for *any* CDP-attached tooling
// (accessibility software, automated testing, browser extensions), not just
// "pirates," making it too disruptive for real users. This heuristic is a
// friction layer, not real DRM — the actual content protection is the AI
// companion (see architecture notes), which a static video rip cannot
// replicate.
export function useDevToolsGuard({ enabled = true } = {}) {
  const [detected, setDetected] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const blockContextMenu = (e) => e.preventDefault()

    const blockKeys = (e) => {
      const key = e.key?.toUpperCase()
      const isBlocked =
        key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(key)) ||
        (e.ctrlKey && key === 'U')
      if (isBlocked) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    document.addEventListener('contextmenu', blockContextMenu)
    document.addEventListener('keydown', blockKeys, true)

    // Baseline captures whatever chrome (toolbars, zoom, OS scrollbars) this
    // browser already has on load. Only an *increase* past that baseline —
    // a docked DevTools panel appearing — counts as detection. Using an
    // absolute threshold here caused false positives across browsers/zoom
    // levels even with DevTools closed.
    const baselineWidthDiff = window.outerWidth - window.innerWidth
    const baselineHeightDiff = window.outerHeight - window.innerHeight

    const checkSize = () => {
      const widthDiff = window.outerWidth - window.innerWidth - baselineWidthDiff
      const heightDiff = window.outerHeight - window.innerHeight - baselineHeightDiff
      if (widthDiff > SIZE_THRESHOLD_PX || heightDiff > SIZE_THRESHOLD_PX) {
        setDetected(true)
      }
    }

    const intervalId = setInterval(checkSize, CHECK_INTERVAL_MS)
    window.addEventListener('resize', checkSize)

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu)
      document.removeEventListener('keydown', blockKeys, true)
      window.removeEventListener('resize', checkSize)
      clearInterval(intervalId)
    }
  }, [enabled])

  return detected
}
