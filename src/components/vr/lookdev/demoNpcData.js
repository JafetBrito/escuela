import { getVrNpcById, OLIVER_NPC, EINSTEIN_NPC, JAFET_NPC } from '../../../data/vrNpcRegistry'
import { useNpcSpeechStore } from '../../../stores/useNpcSpeechStore'
import { LOCAL_SPEECH_EVENT } from '../NpcSpeechPlayer'
import { playMeow } from '../../../utils/meow'

// NPCs de la demo: usan los MISMOS modelos (mascotRegistry) y los MISMOS ids que el
// mundo real (vrNpcRegistry), para que NpcSpeechPlayer/NpcDialogueBox —el sistema de
// diálogo con voz que ya existe— los reconozca sin tocar nada. Lo único nuevo es
// cómo se ven: iluminados por la plaza nueva y, opcionalmente, "estilizados".
export const DEMO_NPCS = [
  {
    id: 'jafet', mascotId: 10, pos: [4.2, 9.5], size: 2.1,
    script: 'Bienvenido a la Plaza de las Academias. Esta es la nueva casa del campus: cada columna de luz que ves en el horizonte es un camino hacia una academia. Inteligencia Artificial, Medicina, Filosofía y Linux. Sigue la luz, recoge las gemas y deja que la curiosidad te guíe.',
  },
  {
    id: 'einstein', mascotId: 9, pos: [-5, 11.5], size: 1.9,
    script: 'Hola, soy Albert. Observa el cielo: relativamente hablando, el atardecer dura exactamente lo que tardas en decidir a qué academia ir. Prueba a cambiar la hora del día arriba a la derecha. El campus cambia de ánimo contigo.',
  },
  {
    id: 'oliver', mascotId: 8, pos: [2.5, 27], size: 1.0, wander: 3,
    script: 'Miau. Soy Oliver, el guía del campus. Ya me conoces, pero hoy tengo algo especial que enseñarte: ¿ves esa torre? Dicen que su luz se ve desde cualquier academia. Sígueme y te enseño el camino.',
  },
  {
    id: 'explorador', mascotId: 11, pos: [10.5, 17], size: 1.9,
    script: 'Los exploradores sabemos que los mejores secretos están fuera del camino. Hay veinte gemas escondidas por el campus, unas junto a los senderos y otras entre los árboles. ¿Cuántas encontrarás?',
  },
  {
    id: 'zafir', mascotId: 12, pos: [-11, 18.5], size: 2.0,
    script: 'Soy Zafir, guardián de los secretos naturales. Escucha con atención: el viento, los pájaros del atardecer, los grillos de la noche. Hasta el campus tiene su propia música. Cambia a la noche y escucha lo que cambia.',
  },
]

const NPC_DATA = { jafet: JAFET_NPC, einstein: EINSTEIN_NPC, oliver: OLIVER_NPC }
export const npcName = (id) => (NPC_DATA[id] ?? getVrNpcById(id))?.name ?? id
export const npcEmoji = (id) => (NPC_DATA[id] ?? getVrNpcById(id))?.emoji ?? '🗣️'

// Dispara el discurso por el mismo evento local que usa /discurso en el mundo real.
export function talkTo(id) {
  const spec = DEMO_NPCS.find((n) => n.id === id)
  if (!spec || useNpcSpeechStore.getState().activeNpcId) return
  if (id === 'oliver') playMeow()
  window.dispatchEvent(new CustomEvent(LOCAL_SPEECH_EVENT, { detail: { npcId: id, script: spec.script, position: [spec.pos[0], 0, spec.pos[1]] } }))
}

