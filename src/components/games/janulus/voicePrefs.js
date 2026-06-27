// ─── Janulingo TTS voice preferences ────────────────────────────────────────
// Lets a player pick which installed system voice to use per language, when
// more than one matches. Persisted in localStorage — no backend needed since
// it's a per-device playback preference, not game progress.

const STORAGE_PREFIX = 'janulingo-voice-'

export function getMatchingVoices(langCode, voices) {
  const prefix = langCode.slice(0, 2).toLowerCase()
  return voices.filter((v) => v.lang.toLowerCase().startsWith(prefix))
}

export function getPreferredVoiceURI(langCode) {
  return localStorage.getItem(STORAGE_PREFIX + langCode)
}

export function setPreferredVoiceURI(langCode, voiceURI) {
  localStorage.setItem(STORAGE_PREFIX + langCode, voiceURI)
}
