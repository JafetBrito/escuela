import { useEffect, useState } from 'react'
import { useChatStore } from '../../stores/useChatStore'

// Picks an emoji "emotion" for the mascot based on the latest assistant
// message, so the model feels alive without constant 3D animation.
const EMOTION_RULES = [
  { test: /\?/, emoji: '🤔' },
  { test: /gracias|genial|excelente|felicidades|bien hecho|increíble/i, emoji: '🤩' },
  { test: /error|no pude|lo siento|perdón/i, emoji: '😅' },
  { test: /[!¡]/, emoji: '✨' },
]

function pickEmotion(text = '') {
  const rule = EMOTION_RULES.find((r) => r.test.test(text))
  return rule?.emoji ?? '🙂'
}

// Pre-written flavor lines the mascot says on its own from time to time.
// These are NOT tied to the chat conversation — just small bits of life so
// the model doesn't feel static while it sits in its house.
const IDLE_PHRASES = [
  '¡Sigue así, vas muy bien! 🐾',
  '¿Ya revisaste tus misiones de hoy?',
  'Recuerda guardar tu progreso desde Ajustes.',
  '¡Miau! Estoy listo cuando quieras estudiar.',
  'Cada clase completada te da experiencia ✨',
  '¿Sabías que puedes personalizarme en Aspecto?',
  'No olvides visitar la Tienda, hay objetos nuevos.',
  'Un pequeño descanso también ayuda a aprender mejor.',
  '¡Vamos por el siguiente nivel!',
  'Tu constancia es lo que más importa.',
]

// Floating emoji + occasional speech bubble shown above the mascot model.
// The emoji reacts to the chat, but the bubble text is always a pre-written
// idle phrase — it never repeats what's said in the chat panel.
export default function MascotEmotionOverlay() {
  const messages = useChatStore((s) => s.messages)
  const isSending = useChatStore((s) => s.isSending)
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')

  const [phrase, setPhrase] = useState(null)

  useEffect(() => {
    const showRandomPhrase = () => {
      const next = IDLE_PHRASES[Math.floor(Math.random() * IDLE_PHRASES.length)]
      setPhrase(next)
      setTimeout(() => setPhrase(null), 6000)
    }

    const firstTimer = setTimeout(showRandomPhrase, 4000)
    const interval = setInterval(showRandomPhrase, 18000)
    return () => {
      clearTimeout(firstTimer)
      clearInterval(interval)
    }
  }, [])

  const emoji = isSending ? '💭' : lastAssistant ? pickEmotion(lastAssistant.content) : '🙂'

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute right-4 top-4 text-3xl drop-shadow-lg motion-safe:animate-bounce"
        aria-hidden="true"
      >
        {emoji}
      </div>

      {phrase && (
        <div className="absolute left-4 top-4 max-w-[75%] rounded-2xl rounded-bl-sm border border-primary/40 bg-surface/90 px-3 py-2 text-xs text-text shadow-lg backdrop-blur-sm transition-opacity">
          {phrase}
        </div>
      )}
    </div>
  )
}
