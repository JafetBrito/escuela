// Tiny Web Audio "ding" used for achievement unlock toasts — no audio asset
// needed, degrades silently if AudioContext is unavailable/blocked.
let sharedContext = null

function getContext() {
  if (typeof window === 'undefined') return null
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  if (!sharedContext) sharedContext = new Ctx()
  return sharedContext
}

export function playAchievementSound() {
  try {
    const ctx = getContext()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()

    const notes = [880, 1108.73, 1318.51] // A5, C#6, E6 — bright major arpeggio
    const now = ctx.currentTime

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = now + i * 0.09
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.5)
    })
  } catch {
    // Audio is best-effort; ignore failures (e.g. autoplay restrictions).
  }
}

// Bigger ascending fanfare for leveling up — same synth approach as the
// achievement ding, just longer/brighter so it reads as a bigger deal.
export function playLevelUpSound() {
  try {
    const ctx = getContext()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51] // C5, E5, G5, C6, E6
    const now = ctx.currentTime

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const start = now + i * 0.1
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.22, start + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.6)
    })
  } catch {
    // Audio is best-effort; ignore failures (e.g. autoplay restrictions).
  }
}
