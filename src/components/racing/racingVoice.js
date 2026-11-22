// Locutor de Oliver Racing: usa la síntesis de voz del navegador (speechSynthesis), sin servicios externos. Prefiere una voz "natural"
// del idioma actual si existe. Mientras habla avisa con `onDuck` para que la música baje de volumen. `speak` acepta `onEnd` para saber
// cuándo terminó de leerse algo (el juego espera a que se lea la pregunta completa antes de mostrar las opciones).
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
let on = true, duckCb = null

export const voiceSupported = () => !!synth
export const voiceOn = () => on && !!synth
export const setVoiceOn = (v) => { on = v; if (!v) stopVoice() }
export const onDuck = (cb) => { duckCb = cb }

function pickVoice(lang) {
  const pre = lang.slice(0, 2).toLowerCase(), vs = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith(pre))
  return vs.find((v) => /natural|online|google/i.test(v.name) && v.lang.toLowerCase() === lang.toLowerCase()) || vs.find((v) => /natural|online|google/i.test(v.name)) || vs.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) || vs[0] || null
}

// speak(texto, { now, lang, onEnd }): `now` corta lo que esté diciendo; si no, se pone en cola. Devuelve false si no hay voz (el que llama debe resolver solo).
export function speak(text, { now = false, rate = 1.14, pitch = 1, lang = 'es-MX', onEnd } = {}) {
  if (!synth || !on || !text) return false
  if (now) synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang; u.rate = rate; u.pitch = pitch; u.voice = pickVoice(lang)
  u.onstart = () => duckCb?.(true)
  const end = () => { if (!synth.speaking && !synth.pending) duckCb?.(false); onEnd?.() }
  u.onend = end; u.onerror = end
  synth.speak(u)
  return true
}
export function stopVoice() { if (synth) { synth.cancel(); duckCb?.(false) } }

const pick = (a) => a[Math.floor(Math.random() * a.length)]
export const LINES = {
  es: { ok: () => pick(['¡Muy bien!', '¡Excelente!', '¡Así se hace!', '¡Correcto!']), bad: () => pick(['¡Ay, trampa!', 'Casi. ¡Cuidado!', 'No pasa nada: aprender también es equivocarse.', '¡Uy! Esa no era.']) },
  en: { ok: () => pick(['Well done!', 'Excellent!', "That's the way!", 'Correct!']), bad: () => pick(['Oops, a trap!', 'Close one. Careful!', "It's fine: mistakes help us learn.", "Oh! That wasn't it."]) },
  fr: { ok: () => pick(['Très bien !', 'Excellent !', 'Bien joué !', 'Correct !']), bad: () => pick(['Aïe, un piège !', 'Presque. Attention !', "Ce n'est pas grave : on apprend en se trompant.", "Oups ! Ce n'était pas ça."]) },
}
