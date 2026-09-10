import { useEffect, useRef, useState } from 'react'
import { BubbleStack } from './engine'
import { useVrSettingsStore } from '../../stores/useVrSettingsStore'
import { useNpcSpeechStore } from '../../stores/useNpcSpeechStore'
import { OLIVER_NPC, EINSTEIN_NPC, JAFET_NPC, getVrNpcById } from '../../data/vrNpcRegistry'

// El canal 'vr:campus' se abre con broadcast self:false (useVrMultiplayer.js)
// — a propósito para pos/action/chat, pero significa que quien DISPARA un
// npc_speech (el ciclo automático o /discurso) nunca recibe su propio
// mensaje por Realtime, solo lo verían otros jugadores conectados. Sin
// nadie más en la sala (el caso normal al probar esto), no pasaba nada
// visible para nadie. Este evento local completa el círculo: el emisor lo
// dispara también sobre sí mismo, sin tocar el self:false del canal
// compartido (que sigue evitando eco en pos/action/chat).
export const LOCAL_SPEECH_EVENT = 'oliver:npc-speech-local'

const SINGLETON_NPCS = { [OLIVER_NPC.id]: OLIVER_NPC, [EINSTEIN_NPC.id]: EINSTEIN_NPC, [JAFET_NPC.id]: JAFET_NPC }
function findNpc(npcId) {
  return SINGLETON_NPCS[npcId] ?? getVrNpcById(npcId)
}

// Mismo criterio de partir en oraciones de ~200 caracteres que
// getReadableChunks en TextLesson.jsx, pero sobre texto plano — el guion no
// trae HTML, así que no hace falta el paso de aplanarlo primero.
function chunkScript(text) {
  const clean = text.replace(/\s+/g, ' ').trim()
  const sentences = clean.match(/[^.!?]+[.!?]+|\S+$/g) || [clean]
  const chunks = []
  let current = ''
  for (const s of sentences) {
    if (current && (current + s).length > 200) {
      chunks.push(current.trim())
      current = ''
    }
    current += s
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks
}

// Escucha el broadcast 'npc_speech' (ver useNpcSpeechScheduler.js) en el
// mismo canal `vr:campus` que ya usa useVrMultiplayer/useVoiceChat, y
// reproduce el guion completo fragmento a fragmento como burbujas flotantes
// sobre el NPC — con audio si useVrSettingsStore.npcVoice está activado
// (mismo flag que ya respeta IdleNpc), solo subtítulos si no. Nunca lanza
// error hacia afuera: si el NPC del payload no existe en el registro, o no
// hay speechSynthesis, simplemente no reproduce nada.
export default function NpcSpeechPlayer({ channelRef }) {
  const [active, setActive] = useState(null) // { npc, bubble: { id, text } }
  const sessionRef = useRef(0)

  useEffect(() => {
    const onSpeech = ({ payload }) => {
      const npc = findNpc(payload?.npcId)
      if (!npc || !payload?.script) return
      const session = ++sessionRef.current
      const chunks = chunkScript(payload.script)
      useNpcSpeechStore.getState().setActive(npc.id)

      const speakChunk = (i) => {
        if (session !== sessionRef.current) return
        if (i >= chunks.length) {
          setActive(null)
          useNpcSpeechStore.getState().clear()
          return
        }
        const text = chunks[i]
        setActive({ npc, bubble: { id: i, text } })
        const advance = () => speakChunk(i + 1)
        if (useVrSettingsStore.getState().npcVoice && window.speechSynthesis) {
          const utt = new SpeechSynthesisUtterance(text)
          utt.lang = 'es-ES'
          utt.rate = 0.98
          utt.onend = advance
          utt.onerror = advance
          window.speechSynthesis.speak(utt)
        } else {
          // Sin voz: igual avanza el subtítulo, a un ritmo de lectura
          // razonable en vez de esperar un onend que nunca va a llegar.
          setTimeout(advance, Math.max(2000, text.length * 90))
        }
      }
      speakChunk(0)
    }

    // channelRef.current puede seguir siendo null en este primer efecto —
    // World vive dentro de un <Suspense> (carga de modelos GLB) que a veces
    // termina de montarse DESPUÉS de que useVrMultiplayer ya conectó, pero
    // otras veces antes; channelRef es la misma referencia toda la sesión,
    // así que un simple `if (!channel) return` nunca se volvería a intentar.
    // Reintenta cada 300ms hasta que el canal exista, después registra una
    // sola vez.
    let interval = null
    const tryRegister = () => {
      const channel = channelRef?.current
      if (!channel) return false
      channel.on('broadcast', { event: 'npc_speech' }, onSpeech)
      return true
    }
    if (!tryRegister()) interval = setInterval(() => { if (tryRegister()) clearInterval(interval) }, 300)

    const onLocalSpeech = (e) => onSpeech({ payload: e.detail })
    window.addEventListener(LOCAL_SPEECH_EVENT, onLocalSpeech)

    return () => {
      sessionRef.current += 1
      if (interval) clearInterval(interval)
      window.removeEventListener(LOCAL_SPEECH_EVENT, onLocalSpeech)
    }
  }, [channelRef])

  if (!active) return null
  // Mismo cálculo de baseY que IdleNpc en VRPage.jsx (npcScale*2 + 1.0) — si
  // el NPC tiene una escala propia (ej. OLIVER_NPC.scale), la burbuja flota
  // sobre su cabeza real en vez de quedar enterrada en un cuerpo agrandado.
  // 0.26 es el mismo NPC_SCALE por defecto que usa IdleNpc.
  const npcScale = active.npc.scale ?? 0.26
  return (
    <group position={active.npc.position}>
      <BubbleStack bubbles={[active.bubble]} baseY={npcScale * 2 + 1.0} color={active.npc.bubbleColor} />
    </group>
  )
}
