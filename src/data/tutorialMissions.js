// Designed to take a fresh account from level 1 to level 5 by the time the
// tutorial ends (XP_PER_LEVEL=500, see useLevelStore.js): the 8 non-skippable
// steps sum to 2050 XP, landing in the 2000-2499 range = exactly level 5,
// whether or not the optional setup_ai step is taken along the way.
export const TUTORIAL_MISSIONS = [
  {
    id: 'meet_jafet',
    step: 1,
    icon: '🧙‍♂️',
    title: 'Conoce a Jafet',
    desc: 'Escucha la bienvenida de Jafet y descubre el Árbol de Oliver Academy.',
    xp: 150,
    skippable: false,
  },
  {
    id: 'practice_basics',
    step: 2,
    icon: '🚶',
    title: 'Primeros pasos',
    desc: 'Camina por el Árbol y cuéntale algo a Jafet — pon a prueba el sistema de chat.',
    xp: 200,
    skippable: false,
  },
  {
    id: 'choose_avatar_class',
    step: 3,
    icon: '⚔️',
    title: 'Elige tu camino',
    desc: 'Elige la clase de tu Avatar, ahí mismo frente al Árbol.',
    xp: 400,
    skippable: false,
  },
  {
    id: 'choose_mascot',
    step: 4,
    icon: '🐾',
    title: 'Elige tu compañero',
    desc: 'Escoge el modelo y el nombre de tu primera mascota.',
    xp: 150,
    skippable: false,
  },
  {
    id: 'mascot_class',
    step: 5,
    icon: '🔮',
    title: 'Define su clase',
    desc: 'Elige la clase de tu mascota para desbloquear sus poderes únicos.',
    xp: 300,
    skippable: false,
  },
  {
    id: 'test_ability',
    step: 6,
    icon: '✨',
    title: 'Prueba tus habilidades',
    desc: 'Revisa las habilidades iniciales que acaban de desbloquear tu Avatar y tu mascota.',
    xp: 200,
    skippable: false,
  },
  {
    id: 'setup_ai',
    step: 7,
    icon: '🤖',
    title: 'Despierta su mente',
    desc: 'Configura la clave de IA de tu mascota (opcional). Puedes hacerlo después en Ajustes.',
    xp: 150,
    skippable: true,
  },
  {
    id: 'first_chat',
    step: 8,
    icon: '💬',
    title: 'Primera conversación',
    desc: 'Abre el chat de tu mascota y envíale tu primer mensaje.',
    xp: 250,
    skippable: false,
  },
  {
    id: 'enter_campus',
    step: 9,
    icon: '🏛️',
    title: 'Entra al Campus',
    desc: 'Cruza el portal y entra al Campus de Oliver Academy.',
    xp: 400,
    skippable: false,
  },
]

export function getTutorialMission(id) {
  return TUTORIAL_MISSIONS.find(m => m.id === id)
}
