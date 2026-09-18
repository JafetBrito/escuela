import { useEffect, useState } from 'react'
import { Html } from '@react-three/drei'

// Mismo patrón de eco local que NpcSpeechPlayer.jsx (LOCAL_SPEECH_EVENT).
// BirthdayPartyWorld es un mundo privado de un solo jugador, así que solo
// se usa el evento local — el soporte de `channelRef` (broadcast real)
// queda por si algún día se reusa este componente en un mundo compartido.
export const LOCAL_PARTY_EVENT = 'oliver:birthday-party-local'

const PARTY_DURATION_MS = 5 * 60_000 // 5 minutos de globos tras dispararse

// Globos/confeti flotando sobre la plaza central del mundo de la fiesta
// (BirthdayPartyWorld — el mapa hecho con código, no el Campus GLB normal)
// — sprites Html igual que las burbujas de diálogo, sin modelos 3D nuevos.
const BALLOONS = [
  { emoji: '🎈', position: [-5, 6, 2] },
  { emoji: '🎉', position: [0, 8, 4] },
  { emoji: '🎈', position: [5, 6, 2] },
  { emoji: '🎂', position: [-3, 5, -2] },
  { emoji: '🎈', position: [3, 5, -2] },
]

export default function BirthdayDecorations({ channelRef }) {
  const [party, setParty] = useState(null) // { name } | null

  useEffect(() => {
    const onParty = ({ payload }) => {
      if (!payload) return
      setParty({ name: payload.name })
      const timer = setTimeout(() => setParty(null), PARTY_DURATION_MS)
      return () => clearTimeout(timer)
    }

    let interval = null
    const tryRegister = () => {
      const channel = channelRef?.current
      if (!channel) return false
      channel.on('broadcast', { event: 'birthday_party' }, onParty)
      return true
    }
    if (!tryRegister()) interval = setInterval(() => { if (tryRegister()) clearInterval(interval) }, 300)

    const onLocalParty = (e) => onParty({ payload: e.detail })
    window.addEventListener(LOCAL_PARTY_EVENT, onLocalParty)

    return () => {
      if (interval) clearInterval(interval)
      window.removeEventListener(LOCAL_PARTY_EVENT, onLocalParty)
    }
  }, [channelRef])

  if (!party) return null

  return (
    <>
      {BALLOONS.map((b, i) => (
        <Html key={i} position={b.position} center distanceFactor={18}>
          <div className="pointer-events-none animate-bounce text-5xl drop-shadow-lg">{b.emoji}</div>
        </Html>
      ))}
      <Html position={[0, 9.5, 3]} center distanceFactor={18}>
        <div className="pointer-events-none whitespace-nowrap rounded-full bg-primary px-4 py-1.5 text-sm font-black text-background shadow-lg">
          🎂 ¡Feliz cumpleaños, {party.name}! 🎂
        </div>
      </Html>
    </>
  )
}
