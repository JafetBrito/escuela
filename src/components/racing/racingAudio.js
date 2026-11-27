// Música y efectos de Oliver Racing, 100 % sintetizados con Web Audio (sin archivos): un secuenciador de 16avos con bombo, caja,
// hi-hat, bajo y una melodía en escala pentatónica propia de cada mundo (`world.music`). El tempo sube con el nivel del vehículo.
// El navegador exige un gesto del usuario: `initAudio()` se llama al pulsar "A correr".
const KEY = 'oliver_racing_prefs'
export const loadPrefs = () => { try { return { music: true, voice: true, story: true, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return { music: true, voice: true, story: true } } }
export const savePrefs = (p) => { try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* sin almacenamiento: no pasa nada */ } }

const MUSIC_VOL = 0.3
let ctx = null, master = null, music = null, sfxBus = null, noise = null, seq = null, musicOn = true, ducked = false

export function initAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return false
    ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination)
    music = ctx.createGain(); music.gain.value = MUSIC_VOL; music.connect(master)
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.7; sfxBus.connect(master)
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') ctx.resume()
  return true
}
const applyMusicGain = () => { if (music) music.gain.setTargetAtTime(musicOn ? (ducked ? MUSIC_VOL * 0.35 : MUSIC_VOL) : 0, ctx.currentTime, 0.15) }
export const setMusicOn = (on) => { musicOn = on; applyMusicGain() }
export const duck = (on) => { ducked = on; applyMusicGain() } // baja la música mientras habla el locutor

function tone(dest, freq, t, dur, type = 'sine', vol = 0.2, slideTo = null) {
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = type; o.frequency.setValueAtTime(freq, t); if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05)
}
function hit(dest, t, dur, vol, freq, q = 1) { // ráfaga de ruido filtrada (caja, hi-hat, choque)
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain()
  s.buffer = noise; f.type = 'highpass'; f.frequency.value = freq; f.Q.value = q
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t + dur + 0.02)
}

const MOTIF = [0, 2, 1, 3, 2, 4, 3, 1]
function playStep(cfg, tier, step, t) {
  const bar = (step >> 4) & 3, b = step & 15, off = cfg.bass[bar]
  if (b === 0 || b === 8 || (tier >= 2 && (b === 4 || b === 12))) tone(music, 150, t, 0.16, 'sine', 0.5, 42) // bombo
  if (b === 4 || b === 12) hit(music, t, 0.12, 0.16, 1800) // caja
  if (b % 2 === 0) hit(music, t, 0.04, b % 4 === 2 ? 0.08 : 0.04, 7000) // hi-hat
  if (b === 0 || b === 6 || b === 8 || b === 14) tone(music, (cfg.root * 2 ** (off / 12)) / 2, t, 0.22, 'triangle', 0.32) // bajo
  if (b % 2 === 0 && bar !== 3) { // melodía (en el último compás descansa para respirar)
    const deg = (MOTIF[(b >> 1) % 8] + (bar % 2)) % 5
    tone(music, cfg.root * 2 ** ((cfg.scale[deg] + off) / 12), t, 0.2, cfg.wave, 0.11)
    if (tier >= 3 && b % 4 === 2) tone(music, cfg.root * 4 * 2 ** ((cfg.scale[(deg + 2) % 5] + off) / 12), t, 0.12, 'sine', 0.07) // brillo cuando vas rápido
  }
}
function schedule() {
  if (!seq) return
  const spb = 60 / (seq.cfg.bpm + seq.tier * 7) / 4 // un 16avo
  while (seq.next < ctx.currentTime + 0.18) { playStep(seq.cfg, seq.tier, seq.step, seq.next); seq.next += spb; seq.step = (seq.step + 1) % 64 }
}
export function startMusic(cfg) {
  if (!initAudio()) return
  stopMusic(); applyMusicGain()
  seq = { cfg, step: 0, tier: 0, next: ctx.currentTime + 0.1, timer: setInterval(schedule, 40) }
}
export const setMusicTier = (tier) => { if (seq) seq.tier = tier }
export function stopMusic() { if (seq) { clearInterval(seq.timer); seq = null } }

// Efectos: ok, bad, up, down, jump, finish
export function sfx(name) {
  if (!ctx) return
  const t = ctx.currentTime + 0.01
  if (name === 'ok') { tone(sfxBus, 660, t, 0.18, 'sine', 0.3); tone(sfxBus, 990, t + 0.1, 0.3, 'sine', 0.3) }
  else if (name === 'up') [523, 659, 784, 1047].forEach((f, i) => tone(sfxBus, f, t + i * 0.09, 0.28, 'triangle', 0.3))
  else if (name === 'bad') { tone(sfxBus, 220, t, 0.5, 'sawtooth', 0.3, 60); hit(sfxBus, t, 0.35, 0.45, 300, 0.6) }
  else if (name === 'down') [494, 392, 311].forEach((f, i) => tone(sfxBus, f, t + i * 0.12, 0.3, 'square', 0.2))
  else if (name === 'jump') tone(sfxBus, 300, t, 0.25, 'sine', 0.3, 1400)
  else if (name === 'finish') [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(sfxBus, f, t + i * 0.13, 0.34, 'triangle', 0.3))
}
