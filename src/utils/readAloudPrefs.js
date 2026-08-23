// Preferencias de "Leer esta clase en voz alta" (TextLesson.jsx) — idioma,
// voz del sistema y velocidad. Mismo patrón que
// src/components/games/janulus/voicePrefs.js (localStorage, no hace falta
// backend: es una preferencia de reproducción por dispositivo, no progreso),
// pero en su propio archivo — son dos features distintas, no vale la pena
// acoplarlas solo porque comparten 3 funciones.

const LANG_KEY = 'readAloudLang'
const RATE_KEY = 'readAloudRate'
const VOICE_PREFIX = 'readAloudVoice-'

export function getMatchingVoices(langCode, voices) {
  const prefix = langCode.slice(0, 2).toLowerCase()
  return voices.filter((v) => v.lang.toLowerCase().startsWith(prefix))
}

export function getPreferredLang(fallback) {
  try {
    return localStorage.getItem(LANG_KEY) || fallback
  } catch {
    return fallback
  }
}

export function setPreferredLang(langCode) {
  try {
    localStorage.setItem(LANG_KEY, langCode)
  } catch {
    // localStorage no disponible — la preferencia simplemente no persiste
  }
}

export function getPreferredRate(fallback = 0.95) {
  try {
    const raw = localStorage.getItem(RATE_KEY)
    return raw ? Number(raw) : fallback
  } catch {
    return fallback
  }
}

export function setPreferredRate(rate) {
  try {
    localStorage.setItem(RATE_KEY, String(rate))
  } catch {
    // localStorage no disponible
  }
}

export function getPreferredVoiceURI(langCode) {
  try {
    return localStorage.getItem(VOICE_PREFIX + langCode)
  } catch {
    return null
  }
}

export function setPreferredVoiceURI(langCode, voiceURI) {
  try {
    localStorage.setItem(VOICE_PREFIX + langCode, voiceURI)
  } catch {
    // localStorage no disponible
  }
}
