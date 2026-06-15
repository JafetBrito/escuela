// NPCs placed around the VR world. Each one hands out (and later checks /
// rewards) one of the catálogo fijo de misiones generales from
// globalMissionsRegistry.js, so walking up to an NPC in the 3D world is
// another way to accept/claim those same missions.
export const VR_NPCS = [
  {
    id: 'mago-misiones',
    emoji: '🧙',
    name: 'Maestro de Misiones',
    color: '#9b5a3a',
    position: [0, 0, -16],
    // Mascot model rendered for this NPC (see mascotRegistry.js ids).
    mascotId: 10,
    dialogue: '¡Saludos, viajero! Habla con tu mascota para empezar tu aventura.',
    missionId: 'habla-con-mascota',
  },
  {
    id: 'director',
    emoji: '📘',
    name: 'Director Académico',
    color: '#3f9e7a',
    position: [13.9, 0, -8],
    mascotId: 9,
    dialogue: 'Completa tu primera clase y vuelve a verme para tu recompensa.',
    missionId: 'completa-una-clase',
  },
  {
    id: 'explorador',
    emoji: '🎒',
    name: 'Explorador',
    color: '#caa46c',
    position: [13.9, 0, 8],
    mascotId: 11,
    dialogue: 'Activa un objeto de tu inventario para demostrar que estás listo.',
    missionId: 'activa-objeto',
  },
  {
    id: 'zafir',
    emoji: '🧞',
    name: 'Zafir',
    color: '#e8c477',
    position: [0, 0, 16],
    mascotId: 12,
    dialogue: '¡Bienvenido a mi rincón! Compra algo en la Tienda y vuelve por tu premio.',
    missionId: 'compra-tienda',
  },
  {
    id: 'bibliotecaria',
    emoji: '📚',
    name: 'Bibliotecaria',
    color: '#7d8597',
    position: [-13.9, 0, 8],
    mascotId: 13,
    dialogue: 'Abre un libro de la Librería y cuéntame qué aprendiste.',
    missionId: 'lee-libro',
  },
  {
    id: 'sastre',
    emoji: '🎨',
    name: 'Sastre Mágico',
    color: '#c2703d',
    position: [-13.9, 0, -8],
    mascotId: 8,
    dialogue: 'Cambia el aspecto de tu mascota y muéstramelo con orgullo.',
    missionId: 'cambia-apariencia',
  },
]

export function getVrNpcById(id) {
  return VR_NPCS.find((npc) => npc.id === id)
}

// Oliver: a friendly NPC who hangs out near the plaza and periodically says
// one of these lines as a floating speech bubble, Habbo-style — independent
// of the mission system (rendered even in SIMPLE_MODE).
//
// `lines` are the offline/fallback dialogue. When the account has a real
// DeepSeek/Minimax API key configured (see useSettingsStore), <IdleNpc>
// instead asks the AI to improvise a line using `aiPrompt` as its system
// prompt, so the NPC feels "alive" — falling back to `lines` on any error or
// when no key is configured.
export const OLIVER_NPC = {
  id: 'oliver',
  emoji: '🐾',
  name: 'Oliver',
  mascotId: 8,
  position: [4, 0, 4],
  bubbleColor: '#fde68a',
  lines: [
    '¡Hola! Soy Oliver 🐾',
    '¿Ya exploraste todo el campus?',
    'Pulsa C para chatear con otros estudiantes.',
    'Recuerda completar tus misiones para ganar monedas.',
    '¡Que tengas un gran día de aprendizaje!',
  ],
  aiPrompt:
    'Eres Oliver, un gato naranja muy amigable que vive en el campus virtual de una escuela online. ' +
    'Hablas en español, en tono cálido y motivador, animando a los estudiantes a explorar el campus, ' +
    'chatear con otros, y completar sus misiones y clases. Responde con una sola frase corta, ' +
    'puedes usar emojis. Nunca rompas el personaje ni menciones que eres una IA.',
  intervalMs: 12000,
}

// Albert Einstein: the "new NPC of the week" — uses the wizard ("Mago")
// mascot model for now. Like Oliver, has predetermined `lines` (jokes about
// the site still being "under construction", playing on relativity) and an
// `aiPrompt` for <IdleNpc> to use when an AI provider is configured.
export const EINSTEIN_NPC = {
  id: 'einstein',
  emoji: '🧙',
  name: 'Albert Einstein',
  mascotId: 9,
  position: [-4, 0, -4],
  bubbleColor: '#c7d2fe',
  lines: [
    '¿Sabías que el tiempo es relativo? Por eso esta sección "está casi lista" desde hace ya un buen rato. ⏳',
    'E = mc²... la "C" últimamente también significa "Construcción". 🚧',
    'Para mí este campus ya está terminado. Para ti, dale unos días más: todo depende del observador. 😄',
    '¡Hola! Soy Albert. Vine a explicarte la relatividad y por qué el botón de "Próximamente" nunca cambia de marco de referencia.',
    'Un consejo: si algo en el sitio no funciona, no es un bug... es solo curvatura del espacio-tiempo. 🌌',
  ],
  aiPrompt:
    'Eres Albert Einstein dentro del campus virtual de una escuela online. Hablas en español, con humor ' +
    'inteligente y carismático, haciendo bromas breves (una sola frase, puedes usar emojis) sobre física, ' +
    'la relatividad, y sobre que el campus todavía está en construcción y "todo es relativo". ' +
    'Nunca rompas el personaje ni menciones que eres una IA.',
  intervalMs: 16000,
}
