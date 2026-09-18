import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BubbleStack } from './engine'
import { useVrSettingsStore } from '../../stores/useVrSettingsStore'
import { useNpcSpeechStore } from '../../stores/useNpcSpeechStore'
import { useWorldChatStore } from '../../stores/useWorldChatStore'
import { useClassSessionStore } from '../../stores/useClassSessionStore'
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

// Disparado por el botón "Saltar conversación" de <NpcDialogueBox> — corta
// el discurso completo para quien lo dispara (solo local, no afecta a
// otros jugadores que también estén escuchando).
export const NPC_SPEECH_SKIP_EVENT = 'oliver:npc-speech-skip'

// Radio dentro del cual se ve/escucha el discurso — pedido explícito: el
// diálogo (caja RPG + audio) solo existe para quien está físicamente cerca
// del NPC que habla, no para todo el mundo conectado. Quien está lejos no
// se entera hasta que camina hacia allá.
const SPEECH_HEAR_RADIUS = 14

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
// reproduce el guion completo fragmento a fragmento — como burbuja flotante
// sobre el NPC en el mundo 3D, Y como una caja de diálogo estilo RPG en la
// interfaz 2D (ver <NpcDialogueBox>, que lee el mismo useNpcSpeechStore).
// El audio (y la caja 2D) solo se activan para quien está cerca del NPC
// (SPEECH_HEAR_RADIUS); quien está lejos ve avanzar el guion en silencio
// para que la sesión no se quede esperando a que alguien se acerque.
// Nunca lanza error hacia afuera: si el NPC del payload no existe en el
// registro, o no hay speechSynthesis, simplemente no reproduce nada.
export default function NpcSpeechPlayer({ channelRef, playerPositionRef }) {
  const [active, setActive] = useState(null) // { npc, bubble: { id, text } }
  const sessionRef = useRef(0)
  const nearRef = useRef(false)
  const npcVecRef = useRef(new THREE.Vector3())
  // Leído por onSkip (que no tiene el `payload` del onSpeech que originó el
  // discurso en curso) para avisar a ClassEndPanel incluso si el alumno
  // salta la clase en vez de dejarla terminar sola.
  const activeClassIdRef = useRef(null)

  // Proximidad jugador↔NPC recalculada cada frame (por eso vive en un
  // useFrame dentro del <Canvas>, no en el componente 2D) — solo escribe al
  // store cuando el valor realmente cambia, para no disparar un re-render
  // de <NpcDialogueBox> en cada frame.
  useFrame(() => {
    if (!active || !playerPositionRef?.current) return
    npcVecRef.current.set(...active.npc.position)
    const near = playerPositionRef.current.distanceTo(npcVecRef.current) <= SPEECH_HEAR_RADIUS
    if (near !== nearRef.current) {
      nearRef.current = near
      useNpcSpeechStore.getState().setIsNear(near)
    }
  })

  useEffect(() => {
    const onSpeech = ({ payload }) => {
      const baseNpc = findNpc(payload?.npcId)
      if (!baseNpc || !payload?.script) return
      // Un guion de clase (ver ClassroomWorld) puede traer su propia
      // `position` — el registro fijo (vrNpcRegistry) solo conoce dónde
      // vive ese NPC en el Campus, no en cada Salón de Clases donde
      // también puede aparecer para dar una clase.
      const npc = payload.position ? { ...baseNpc, position: payload.position } : baseNpc
      activeClassIdRef.current = payload.classId ?? null
      const session = ++sessionRef.current
      const chunks = chunkScript(payload.script)
      useNpcSpeechStore.getState().setActive(npc)
      // Anuncio en el chat del mundo — mismo mecanismo para cualquier NPC
      // con discurso programado, no solo Oliver, pensado como "sistema"
      // reutilizable para cuando existan más NPCs-maestro con diálogos.
      useWorldChatStore.getState().addSystemMessage(
        `🗣️ ${npc.name} está compartiendo algo — acércate para escucharlo.`,
      )

      const speakChunk = (i) => {
        if (session !== sessionRef.current) return
        if (i >= chunks.length) {
          setActive(null)
          useNpcSpeechStore.getState().clear()
          // Si este guion era el de una clase (ClassroomWorld), avisa que
          // terminó para que <ClassEndPanel> habilite la pregunta libre.
          if (payload.classId) useClassSessionStore.getState().end()
          return
        }
        const text = chunks[i]
        setActive({ npc, bubble: { id: i, text } })
        useNpcSpeechStore.getState().setChunk(text, i, chunks.length)
        const advance = () => speakChunk(i + 1)
        const canHear = useVrSettingsStore.getState().npcVoice && window.speechSynthesis && nearRef.current
        if (canHear) {
          const utt = new SpeechSynthesisUtterance(text)
          utt.lang = 'es-ES'
          utt.rate = 0.98
          utt.onend = advance
          utt.onerror = advance
          window.speechSynthesis.speak(utt)
        } else {
          // Lejos del NPC, o sin voz activada: igual avanza el guion en
          // silencio, a un ritmo de lectura razonable, para que la
          // conversación no se quede congelada esperando a nadie.
          setTimeout(advance, Math.max(2000, text.length * 90))
        }
      }
      speakChunk(0)
    }

    // "Saltar conversación" — corta el discurso completo para este cliente
    // (invalida la sesión para que ningún speakChunk en curso siga
    // avanzando) y calla la voz si estaba sonando. Es un corte deliberado
    // de la PROPIA conversación del jugador, no una interrupción ajena —
    // por eso sí es correcto llamar aquí a speechSynthesis.cancel().
    const onSkip = () => {
      sessionRef.current += 1
      if (window.speechSynthesis) window.speechSynthesis.cancel()
      setActive(null)
      useNpcSpeechStore.getState().clear()
      // Saltar una clase también cuenta como "terminarla" — si no, el
      // alumno que salta nunca vería el panel de preguntas.
      if (activeClassIdRef.current) useClassSessionStore.getState().end()
    }
    window.addEventListener(NPC_SPEECH_SKIP_EVENT, onSkip)

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
      window.removeEventListener(NPC_SPEECH_SKIP_EVENT, onSkip)
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
