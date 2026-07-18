// Texto-a-voz nativo del navegador (SpeechSynthesisUtterance) — mismo patrón
// ya usado para narración de NPCs en VrArbol.jsx/VRPage.jsx.
//
// ponytail: `speechSynthesis.cancel()` seguido de `.speak()` en la misma
// llamada es una carrera conocida en Chrome — si llegan varios anuncios
// seguidos (ej. el alumno manda 5 pings rápido), cancelar el anterior justo
// cuando el motor todavía lo está preparando hace que ALGUNOS se pierdan en
// silencio sin error visible. La solución es una cola simple: cada llamada a
// speak() se encola y se reproduce una por una (onend/onerror avanzan la
// cola), nunca se cancela nada — así ningún anuncio se pierde, solo se
// retrasa un poco si llegan varios casi al mismo tiempo.
const queue = []
let speaking = false
const MAX_QUEUE = 6 // si se acumulan muchos, se descartan los más viejos (no tiene caso anunciar 20 manos levantadas hace un minuto)

function processQueue() {
  if (speaking || queue.length === 0) return
  const text = queue.shift()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'es-ES'
  utt.rate = 0.95
  utt.pitch = 1.05
  const advance = () => { speaking = false; processQueue() }
  utt.onend = advance
  utt.onerror = advance
  speaking = true
  try {
    window.speechSynthesis.speak(utt)
  } catch {
    advance()
  }
}

export function speak(text) {
  try {
    if (!window.speechSynthesis || !text) return
    const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim()
    if (!clean) return
    queue.push(clean)
    if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE)
    processQueue()
  } catch {
    // Best-effort — degrada en silencio si el navegador lo bloquea/no lo soporta.
  }
}
