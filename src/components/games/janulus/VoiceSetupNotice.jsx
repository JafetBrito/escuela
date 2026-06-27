import { useEffect, useState } from 'react'
import { getMatchingVoices, getPreferredVoiceURI, setPreferredVoiceURI } from './voicePrefs'

// ms-settings: deep links only resolve on Windows. Everywhere else we can't
// jump straight to the right settings screen, so we just explain where to look.
function openOsVoiceSettings() {
  if (navigator.userAgent.includes('Windows')) {
    window.location.href = 'ms-settings:regionlanguage'
    return
  }
  alert(
    'Para instalar una voz nueva:\n\n' +
    '🍎 Mac: Preferencias del Sistema → Accesibilidad → Contenido hablado → Voces del sistema\n' +
    '🤖 Android: Ajustes → Accesibilidad → Salida de texto a voz → motor de Google → Instalar datos de voz\n' +
    '📱 iPhone/iPad: Ajustes → Accesibilidad → Contenido hablado → Voces'
  )
}

export default function VoiceSetupNotice({ langCode, langName }) {
  const [voices, setVoices] = useState(() => window.speechSynthesis?.getVoices() ?? [])

  useEffect(() => {
    const synth = window.speechSynthesis
    if (!synth) return
    const update = () => setVoices(synth.getVoices())
    synth.addEventListener('voiceschanged', update)
    update()
    return () => synth.removeEventListener('voiceschanged', update)
  }, [])

  if (voices.length === 0) return null // not loaded yet — avoid flashing a false warning

  const matches = getMatchingVoices(langCode, voices)

  if (matches.length === 0) {
    return (
      <div className="mx-4 mb-4 flex flex-col gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs text-amber-200">
        <p>⚠️ Tu dispositivo no tiene una voz de <strong>{langName}</strong> instalada. Puedes jugar igual, pero lo que escuches va a sonar a otro idioma.</p>
        <button
          type="button"
          onClick={openOsVoiceSettings}
          className="self-start rounded-lg border border-amber-400/40 px-3 py-1.5 font-bold text-amber-100 transition-colors hover:bg-amber-400/15"
        >
          Instalar voz de {langName} →
        </button>
      </div>
    )
  }

  if (matches.length === 1) return null // only one option — nothing to pick, nothing to warn about

  const savedURI = getPreferredVoiceURI(langCode)
  const current = matches.find((v) => v.voiceURI === savedURI) ?? matches[0]

  return (
    <div className="mx-4 mb-4 flex items-center gap-2 rounded-xl border border-border/40 bg-surface/60 px-4 py-2.5 text-xs">
      <span className="shrink-0 text-text-muted">🔊 Voz de {langName}:</span>
      <select
        value={current.voiceURI}
        onChange={(e) => setPreferredVoiceURI(langCode, e.target.value)}
        className="flex-1 rounded-lg border border-border/40 bg-background px-2 py-1 text-text"
      >
        {matches.map((v) => (
          <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
        ))}
      </select>
    </div>
  )
}
