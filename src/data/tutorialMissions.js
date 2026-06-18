export const TUTORIAL_MISSIONS = [
  {
    id: 'meet_jafet',
    step: 1,
    icon: '🧙‍♂️',
    title: 'Conoce a Jafet',
    desc: 'Acércate al guardián del Árbol y escucha su bienvenida.',
    xp: 50,
    skippable: false,
  },
  {
    id: 'choose_mascot',
    step: 2,
    icon: '🐾',
    title: 'Elige tu compañero',
    desc: 'Escoge el modelo y el nombre de tu primera mascota.',
    xp: 30,
    skippable: false,
  },
  {
    id: 'mascot_class',
    step: 3,
    icon: '⚔️',
    title: 'Define su clase',
    desc: 'Elige la clase de tu mascota para desbloquear sus poderes únicos.',
    xp: 80,
    skippable: false,
  },
  {
    id: 'setup_ai',
    step: 4,
    icon: '🤖',
    title: 'Despierta su mente',
    desc: 'Configura la clave de IA de tu mascota (opcional). Puedes hacerlo después en Ajustes.',
    xp: 50,
    skippable: true,
  },
  {
    id: 'first_chat',
    step: 5,
    icon: '💬',
    title: 'Primera conversación',
    desc: 'Abre el chat de tu mascota y envíale tu primer mensaje.',
    xp: 100,
    skippable: false,
  },
]

export function getTutorialMission(id) {
  return TUTORIAL_MISSIONS.find(m => m.id === id)
}
