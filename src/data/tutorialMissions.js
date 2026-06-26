// Designed to take a fresh account from level 1 to level 5 by the time the
// tutorial ends (XP_PER_LEVEL=500, see useLevelStore.js): the 6 non-skippable
// steps sum to 2050 XP, landing in the 2000-2499 range = exactly level 5,
// whether or not the optional setup_ai step is taken along the way.
export const TUTORIAL_MISSIONS = [
  {
    id: 'meet_jafet',
    step: 1,
    icon: '🧙‍♂️',
    title: 'Conoce a Jafet',
    desc: 'Acércate al guardián del Árbol y escucha su bienvenida.',
    xp: 150,
    skippable: false,
  },
  {
    id: 'choose_avatar_class',
    step: 2,
    icon: '⚔️',
    title: 'Elige tu camino',
    desc: 'Ve al Árbol del Mundo y elige la clase de tu Avatar.',
    xp: 400,
    skippable: false,
  },
  {
    id: 'choose_mascot',
    step: 3,
    icon: '🐾',
    title: 'Elige tu compañero',
    desc: 'Escoge el modelo y el nombre de tu primera mascota.',
    xp: 150,
    skippable: false,
  },
  {
    id: 'mascot_class',
    step: 4,
    icon: '🔮',
    title: 'Define su clase',
    desc: 'Elige la clase de tu mascota para desbloquear sus poderes únicos.',
    xp: 350,
    skippable: false,
  },
  {
    id: 'setup_ai',
    step: 5,
    icon: '🤖',
    title: 'Despierta su mente',
    desc: 'Configura la clave de IA de tu mascota (opcional). Puedes hacerlo después en Ajustes.',
    xp: 150,
    skippable: true,
  },
  {
    id: 'first_chat',
    step: 6,
    icon: '💬',
    title: 'Primera conversación',
    desc: 'Abre el chat de tu mascota y envíale tu primer mensaje.',
    xp: 300,
    skippable: false,
  },
  {
    id: 'enter_campus',
    step: 7,
    icon: '🏛️',
    title: 'Entra al Campus',
    desc: 'Cruza el portal y entra al Campus de Oliver Academy.',
    xp: 700,
    skippable: false,
  },
]

export function getTutorialMission(id) {
  return TUTORIAL_MISSIONS.find(m => m.id === id)
}
