import { useEffect, useState } from 'react'

// Reveals `text` character by character to simulate the mascot "typing".
// Re-runs whenever `text` changes (e.g. a new message arrives).
export default function TypedText({ text, speed = 18 }) {
  const [shown, setShown] = useState('')

  useEffect(() => {
    setShown('')
    if (!text) return

    let i = 0
    const interval = setInterval(() => {
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(interval)
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return <>{shown}</>
}
