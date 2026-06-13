import { useEffect, useState } from 'react'

// Best-effort screen-capture deterrent. The Web platform has no reliable way
// to detect OS-level recorders (OBS, Game Bar, etc.) — this hook only reacts
// to signals a recorder/screenshot tool typically *causes*: the tab losing
// focus/visibility (e.g. switching to a recording overlay) and, where
// available, an active getDisplayMedia capture initiated from this page.
// Document this limitation to users rather than overclaiming protection.
export function useScreenCaptureGuard({ enabled = true } = {}) {
  const [isObscured, setIsObscured] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const handleVisibility = () => {
      setIsObscured(document.visibilityState !== 'visible')
    }
    const handleBlur = () => setIsObscured(true)
    const handleFocus = () => setIsObscured(false)

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [enabled])

  return isObscured
}
