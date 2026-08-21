// Maullido sintetizado con Web Audio API — ponytail: no hay ningún archivo
// de audio de gato en el proyecto, y no vamos a bajar uno de internet solo
// para esto (política del proyecto: nada de descargar assets de fuentes no
// confiables). Un tono puro con vibrato suena a "beep", no a gato — lo que
// de verdad da la sensación de maullido es el FORMANTE: un filtro
// pasa-banda cuya frecuencia central se mueve como si la boca pasara de
// abierta ("meh") a cerrada ("ow"), montado sobre un diente de sierra (rico
// en armónicos, a diferencia de una sinusoide) y un contorno de tono que
// primero SUBE un poco y luego baja — el patrón clásico "mee-ow".
let ctx = null

export function playMeow() {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    const dur = 0.42

    // Portadora: diente de sierra para armónicos, con el contorno de tono
    // "mee-OW" (sube rápido, luego cae despacio) más un vibrato leve.
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(520, now)
    osc.frequency.linearRampToValueAtTime(760, now + 0.07)
    osc.frequency.exponentialRampToValueAtTime(260, now + dur)

    const vibrato = ctx.createOscillator()
    const vibratoGain = ctx.createGain()
    vibrato.frequency.value = 14
    vibratoGain.gain.value = 18
    vibrato.connect(vibratoGain)
    vibratoGain.connect(osc.frequency)

    // Formante: pasa-banda que barre de brillante (boca abierta) a opaco
    // (boca cerrándose) — esto es lo que realmente distingue "miau" de un
    // simple silbido.
    const formant = ctx.createBiquadFilter()
    formant.type = 'bandpass'
    formant.Q.value = 6
    formant.frequency.setValueAtTime(2200, now)
    formant.frequency.linearRampToValueAtTime(2600, now + 0.07)
    formant.frequency.exponentialRampToValueAtTime(700, now + dur)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.5, now + 0.05)
    gain.gain.linearRampToValueAtTime(0.35, now + dur * 0.6)
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur)

    osc.connect(formant)
    formant.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    vibrato.start(now)
    osc.stop(now + dur + 0.02)
    vibrato.stop(now + dur + 0.02)
  } catch {
    // Audio bloqueado/no soportado — el click igual navega, solo sin sonido.
  }
}
