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

// Floating emoji + speech bubble shown above the mascot model, simulating
// emotions/reactions tied to the chat conversation.
export default function MascotEmotionOverlay() {
  const messages = useChatStore((s) => s.messages)
  const isSending = useChatStore((s) => s.isSending)
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')
  const [showBubble, setShowBubble] = useState(false)

  useEffect(() => {
    if (!lastAssistant) return
    setShowBubble(true)
    const timer = setTimeout(() => setShowBubble(false), 7000)
    return () => clearTimeout(timer)
  }, [lastAssistant?.content])

  const emoji = isSending ? '💭' : lastAssistant ? pickEmotion(lastAssistant.content) : '🙂'

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute right-4 top-4 text-3xl drop-shadow-lg motion-safe:animate-bounce"
        aria-hidden="true"
      >
        {emoji}
      </div>

      {showBubble && lastAssistant && (
        <div className="absolute left-4 top-4 max-w-[75%] rounded-2xl rounded-bl-sm border border-primary/40 bg-surface/90 px-3 py-2 text-xs text-text shadow-lg backdrop-blur-sm transition-opacity">
          {lastAssistant.content.length > 160
            ? `${lastAssistant.content.slice(0, 160)}…`
            : lastAssistant.content}
        </div>
      )}
    </div>
  )
}
