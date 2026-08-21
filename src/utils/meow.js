// Maullido sintetizado con Web Audio API — ponytail: no hay ningún archivo
// de audio de gato en el proyecto, y no vamos a bajar uno de internet solo
// para esto. Un barrido de frecuencia descendente con un poco de vibrato
// imita razonablemente el "miau" sin necesitar ningún asset.
let ctx = null

export function playMeow() {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const vibrato = ctx.createOscillator()
    const vibratoGain = ctx.createGain()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(850, now)
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.12)
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.32)

    vibrato.frequency.value = 18
    vibratoGain.gain.value = 25
    vibrato.connect(vibratoGain)
    vibratoGain.connect(osc.frequency)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.12, now + 0.04)
    gain.gain.linearRampToValueAtTime(0.09, now + 0.18)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    vibrato.start(now)
    osc.stop(now + 0.36)
    vibrato.stop(now + 0.36)
  } catch {
    // Audio bloqueado/no soportado — el click igual navega, solo sin sonido.
  }
}
