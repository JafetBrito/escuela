import { useEffect, useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useWorldChatStore } from '../../../stores/useWorldChatStore'

// How long a Habbo-style speech bubble stays floating above a player's head
// after they send a world chat message, in milliseconds. Also reused by NPC
// dialogue bubbles, which queue/expire the same way but outside this hook.
export const CHAT_BUBBLE_DURATION = 10000

// Max number of speech bubbles stacked above a single head at once — if a
// player (or NPC) says several things within CHAT_BUBBLE_DURATION, the
// newest bubbles stack above the older ones instead of replacing them.
export const MAX_STACKED_BUBBLES = 3
// Vertical spacing between stacked bubbles in world units.
const BUBBLE_STACK_SPACING = 1.6

// Deterministically turns a player/connection id into a pastel HSL color, so
// each player's chat bubble has a consistent, distinguishable color. Used by
// <Player>, NPCs, and remote players alike — independent of which map/world
// it's rendered in.
export function colorFromId(id) {
  if (!id) return '#ffffff'
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  const hue = hash % 360
  return `hsl(${hue}, 85%, 88%)`
}

// Watches the world chat log for the latest message sent by the connection
// identified by `matchId` (the local player's `playerId`, or a remote
// player's presence id) and returns the (up to MAX_STACKED_BUBBLES) most
// recent ones so they can be rendered as floating speech bubbles stacked
// above their head, Habbo-style. Each bubble expires independently after
// CHAT_BUBBLE_DURATION, so several messages sent in quick succession stack
// instead of replacing each other.
// Matching by connection id (instead of display name) avoids bubbles
// appearing above the wrong avatar when two players share a display name.
export function useChatBubbles(matchId) {
  const messages = useWorldChatStore((s) => s.messages)
  const [bubbles, setBubbles] = useState([])
  const shownIdRef = useRef(null)

  useEffect(() => {
    const last = messages[messages.length - 1]
    if (
      !last ||
      !matchId ||
      last.system ||
      last.whisperTo ||
      last.whisperFrom ||
      last.authorId !== matchId ||
      last.id === shownIdRef.current
    ) {
      return
    }
    shownIdRef.current = last.id
    setBubbles((current) => [...current, { id: last.id, text: last.text }].slice(-MAX_STACKED_BUBBLES))
    const timer = setTimeout(() => {
      setBubbles((current) => current.filter((b) => b.id !== last.id))
    }, CHAT_BUBBLE_DURATION)
    return () => clearTimeout(timer)
  }, [messages, matchId])

  return bubbles
}

// Habbo-style floating speech bubble shown above a player's head for a few
// seconds after they send a world chat message. `color` tints the bubble so
// each player's speech is visually distinct.
export function ChatBubble({ text, y, color = '#ffffff' }) {
  return (
    <Html position={[0, y, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
      <div
        className="max-w-[22rem] whitespace-normal break-words rounded-2xl rounded-bl-sm px-4 py-2 text-center text-[0.75rem] font-semibold leading-relaxed tracking-wide text-gray-900 shadow-xl"
        style={{ backgroundColor: color, minWidth: '7rem' }}
      >
        {text}
      </div>
    </Html>
  )
}

// Renders a stack of speech bubbles above a head, oldest on top and newest
// closest to the head, each offset by BUBBLE_STACK_SPACING.
export function BubbleStack({ bubbles, baseY, color }) {
  return bubbles.map((b, i) => (
    <ChatBubble
      key={b.id}
      text={b.text}
      y={baseY + (bubbles.length - 1 - i) * BUBBLE_STACK_SPACING}
      color={color}
    />
  ))
}
