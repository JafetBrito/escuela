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

// ponytail: los navegadores bloquean el audio hasta el primer gesto real del
// usuario (click/tecla/touch) — la campanita de notificaciones suena desde un
// evento de Supabase Realtime que llega en segundo plano, sin que haya un
// click justo antes, así que sin esto el AudioContext se queda "suspended"
// para siempre y nunca se escucha nada. Se desbloquea una sola vez con
// cualquier interacción normal de la persona navegando la app (no hace falta
// que sea un click relacionado con sonido).
if (typeof window !== 'undefined') {
  const unlock = () => {
    const ctx = getContext()
    if (ctx?.state === 'suspended') ctx.resume().catch(() => {})
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
  window.addEventListener('pointerdown', unlock)
  window.addEventListener('keydown', unlock)
}

// Toc corto y seco — jugada normal de ajedrez.
export function playChessMoveSound() {
  try {
    const ctx = getContext()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = 220
    const start = ctx.currentTime
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.18, start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + 0.12)
  } catch {
    // Best-effort.
  }
}

// Dos golpes — captura de pieza.
export function playChessCaptureSound() {
  try {
    const ctx = getContext()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime
    ;[196, 146.83].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = freq
      const start = now + i * 0.05
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.15, start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.15)
    })
  } catch {
    // Best-effort.
  }
}

// Nota aguda de alerta — jaque.
export function playChessCheckSound() {
  try {
    const ctx = getContext()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.value = 660
    const start = ctx.currentTime
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.16, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + 0.35)
  } catch {
    // Best-effort.
  }
}

// Acorde descendente — fin de la partida (jaque mate/ahogado).
export function playChessCheckmateSound() {
  try {
    const ctx = getContext()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime
    ;[523.25, 415.3, 329.63].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = now + i * 0.15
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.2, start + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.6)
    })
  } catch {
    // Best-effort.
  }
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

// Ping corto para la campanita de notificaciones — dos notas rápidas, mucho
// más discreto que el logro/level-up ya que puede sonar varias veces seguidas.
export function playNotificationSound() {
  try {
    const ctx = getContext()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()

    const notes = [784, 1046.5] // G5, C6
    const now = ctx.currentTime

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const start = now + i * 0.08
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.15, start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.25)
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
