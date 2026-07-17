// Texto-a-voz nativo del navegador (SpeechSynthesisUtterance) — mismo patrón
// ya usado para narración de NPCs en VrArbol.jsx/VRPage.jsx, extraído aquí
// para reutilizarse en anuncios cortos (Hub de clases en vivo: manos
// levantadas, pings, preguntas). Sin dependencias ni costo, best-effort.
export function speak(text) {
  try {
    if (!window.speechSynthesis || !text) return
    const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim()
    if (!clean) return
    window.speechSynthesis.cancel() // no encolar anuncios viejos sobre uno nuevo
    const utt = new SpeechSynthesisUtterance(clean)
    utt.lang = 'es-ES'
    utt.rate = 0.95
    utt.pitch = 1.05
    window.speechSynthesis.speak(utt)
  } catch {
    // Best-effort — degrada en silencio si el navegador lo bloquea/no lo soporta.
  }
}
