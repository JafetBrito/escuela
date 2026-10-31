// Ambiente sonoro de la Plaza (look-dev): viento + colchón armónico + pájaros al
// atardecer/amanecer y grillos de noche + pasos. Todo sintetizado con Web Audio,
// sin archivos — misma filosofía que utils/sound.js y utils/meow.js (el proyecto
// no descarga audio de fuentes externas). Las voces de los NPC NO pasan por aquí:
// siguen siendo las del sistema existente (SpeechSynthesis vía NpcSpeechPlayer).
let ctx = null, master = null, on = false, mode = 'atardecer', timer = null
let drone = [], nodes = [], stepBuf = null

// Acorde por hora del día (Hz): cálido al atardecer, abierto al amanecer, grave de noche.
const DRONE = {
  atardecer: [146.83, 220, 277.18, 329.63],
  amanecer: [196, 246.94, 293.66, 392],
  noche: [110, 164.81, 196, 246.94],
}

function noise(c, seconds, brown) {
  const len = Math.floor(c.sampleRate * seconds), b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0)
  let last = 0
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1
    if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5 } else d[i] = w
  }
  return b
}

function chirp() {
  const t = ctx.currentTime, n = 2 + Math.floor(Math.random() * 3), base = 2200 + Math.random() * 1400
  for (let i = 0; i < n; i++) {
    const o = ctx.createOscillator(), g = ctx.createGain(), s = t + i * 0.11
    o.type = 'sine'
    o.frequency.setValueAtTime(base, s); o.frequency.exponentialRampToValueAtTime(base * 1.5, s + 0.07)
    g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.05, s + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.09)
    o.connect(g); g.connect(master); o.start(s); o.stop(s + 0.1)
  }
}
function cricket() {
  const t = ctx.currentTime
  for (let i = 0; i < 4; i++) {
    const o = ctx.createOscillator(), g = ctx.createGain(), s = t + i * 0.055
    o.type = 'sine'; o.frequency.value = 4300
    g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.028, s + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.04)
    o.connect(g); g.connect(master); o.start(s); o.stop(s + 0.05)
  }
}
function schedule() {
  clearTimeout(timer)
  timer = setTimeout(() => {
    if (!on) return
    try { if (master.gain.value > 0.01) (mode === 'noche' ? cricket : chirp)() } catch { /* best-effort */ }
    schedule()
  }, mode === 'noche' ? 1200 + Math.random() * 2500 : 2500 + Math.random() * 6000)
}

// Idempotente. Debe llamarse tras un gesto del usuario (política de autoplay).
export function startAmbience(presetId) {
  if (on) return
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination)

    const wind = ctx.createBufferSource(); wind.buffer = noise(ctx, 3, true); wind.loop = true
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 380; bp.Q.value = 0.7
    const wg = ctx.createGain(); wg.gain.value = 0.2
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.11; lg.gain.value = 220
    lfo.connect(lg); lg.connect(bp.frequency)
    const lfo2 = ctx.createOscillator(), lg2 = ctx.createGain(); lfo2.frequency.value = 0.07; lg2.gain.value = 0.08
    lfo2.connect(lg2); lg2.connect(wg.gain)
    wind.connect(bp); bp.connect(wg); wg.connect(master)
    wind.start(); lfo.start(); lfo2.start()

    mode = presetId
    drone = DRONE[presetId].map((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = f; o.detune.value = (i - 1.5) * 4; g.gain.value = 0.011
      o.connect(g); g.connect(master); o.start()
      return o
    })
    nodes = [wind, lfo, lfo2, ...drone]
    on = true
    schedule()
  } catch { /* sin Web Audio: la escena sigue funcionando en silencio */ }
}

export function setAmbiencePreset(presetId) {
  mode = presetId
  if (!on) return
  drone.forEach((o, i) => o.frequency.setTargetAtTime(DRONE[presetId][i], ctx.currentTime, 1.2))
}
export function setAmbienceMuted(muted) { if (master) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.15) }

export function footstep(stone) {
  if (!on || !ctx || master.gain.value < 0.01) return
  try {
    stepBuf ??= noise(ctx, 0.12, false)
    const t = ctx.currentTime, b = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain()
    b.buffer = stepBuf; f.type = 'lowpass'; f.frequency.value = stone ? 1500 : 600
    g.gain.setValueAtTime(stone ? 0.12 : 0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1)
    b.connect(f); f.connect(g); g.connect(master); b.start(t); b.stop(t + 0.12)
  } catch { /* best-effort */ }
}

// El look-dev vive dentro de una SPA: al salir de la ruta hay que cortar el audio.
export function shutdownAmbience() {
  on = false; clearTimeout(timer)
  nodes.forEach((n) => { try { n.stop() } catch { /* ya detenido */ } })
  nodes = []; drone = []
  try { master?.disconnect() } catch { /* ya desconectado */ }
  master = null
}
