// Designed to take a fresh account from level 1 to level 5 by the time the
// tutorial ends (XP_PER_LEVEL=500, see useLevelStore.js): the 8 non-skippable
// steps sum to 2050 XP, landing in the 2000-2499 range = exactly level 5,
// whether or not the optional setup_ai step is taken along the way.
//
// Each step also carries everything VrArbol.jsx needs to RUN it, so adding a
// step is "add one object here" instead of touching half a dozen places in
// that file (a switch-statement branch, a dialogue map entry, a CTA-label
// map entry, a new boolean + render block...):
//   speaker   — 'jafet' | 'oliver' | null. Who says `dialogue` once this step
//               becomes active, and whose ❗ lights up. null = no dialogue box
//               for this step (e.g. meet_jafet completes via the cinematic).
//   dialogue  — lines spoken by `speaker`, same line-by-line typing effect
//               for every step.
//   cta       — the action button shown inside DialogueBox, if any:
//                 { label, open }      → VrArbol sets openOverlayId=open
//                 { label, navigate }  → VrArbol navigates there
//                 { label, hint }      → VrArbol just pushes `hint` as a line
//                 { label, navigate, completeFirst, announce, delayMs } →
//                   the enter_campus shape: complete the step, speak
//                   `announce`, then navigate after delayMs.
//               null = no button (auto-completes elsewhere, e.g. via a
//               tracker, or — mascot_class — inside another step's modal).
//   skipLabel — only on skippable steps; the secondary "skip" button text.
//
// `open` ids map to VrArbol.jsx's OVERLAY_COMPONENTS. Steps whose mechanic
// doesn't fit this (practice_basics' move+chat tracker, first_chat's
// chat-store watcher, test_ability's chained AbilityRevealCard→SkillTrial)
// keep their bespoke detection code in VrArbol.jsx — this schema covers the
// repetitive 80%, not every mechanic that could ever exist.
export const TUTORIAL_MISSIONS = [
  {
    id: 'meet_jafet',
    step: 1,
    icon: '🧙‍♂️',
    title: 'Conoce a Jafet',
    desc: 'Escucha la bienvenida de Jafet y descubre el Templo de Oliver Academy.',
    xp: 150,
    skippable: false,
    speaker: null,
    dialogue: null,
    cta: null,
  },
  {
    id: 'practice_basics',
    step: 2,
    icon: '🚶',
    title: 'Primeros pasos',
    desc: 'Camina por el Templo y cuéntale algo a Jafet — pon a prueba el sistema de chat.',
    xp: 200,
    skippable: false,
    speaker: 'jafet',
    dialogue: [
      '¡Aquí estás! Antes de nada, quiero que te sueltes un poco. 🚶',
      'Camina por aquí — usa WASD o el joystick — y cuando quieras, cuéntame algo. Así pruebas el sistema con el que vamos a hablar de ahora en adelante.',
      'Ah, y ya que estamos: muy pronto vas a conocer a Oliver, él te va a guiar de aquí en adelante. 🐱',
    ],
    cta: null, // completes via MovementTracker + a free-text message, both real
  },
  {
    id: 'choose_avatar_class',
    step: 3,
    icon: '⚔️',
    title: 'Elige tu camino',
    desc: 'Elige la clase de tu Avatar, ahí mismo frente al Templo.',
    xp: 400,
    skippable: false,
    speaker: 'oliver',
    dialogue: [
      '¡Miau! 🐱 Soy Oliver — de aquí en adelante, yo te voy guiando con las misiones.',
      'Jafet ya te dio la bienvenida — ahora vamos a lo divertido: elegir tu camino.',
      'Revisa cada clase con calma, te cuento un poco de cada una antes de que decidas. 😼',
    ],
    cta: { label: '🌳 Elegir mi clase', open: 'classPicker' },
  },
  {
    id: 'choose_mascot',
    step: 4,
    icon: '🐾',
    title: 'Elige tu compañero',
    desc: 'Escoge el modelo y el nombre de tu primera mascota.',
    xp: 150,
    skippable: false,
    speaker: 'oliver',
    dialogue: [
      '¡Excelente elección! ⚔️ Ahora necesitas un compañero de viaje.',
      'Elige la mascota que sientas más cercana a ti — cada una tiene su propio estilo.',
    ],
    cta: { label: '🐾 Elegir compañero', open: 'mascotOnboarding' },
  },
  {
    id: 'mascot_class',
    step: 5,
    icon: '🔮',
    title: 'Define su clase',
    desc: 'Elige la clase de tu mascota para desbloquear sus poderes únicos.',
    xp: 300,
    skippable: false,
    speaker: 'oliver',
    dialogue: [
      '¡Un compañero increíble! 🐾 Pero un compañero sin clase es como un gato sin sus uñas…',
      'Elige su clase con cuidado: algunas combinan mejor con tu camino que otras, aunque al final la decisión es toda tuya.',
    ],
    cta: null, // handled inside the same VrMascotOnboarding modal as choose_mascot
  },
  {
    id: 'test_ability',
    step: 6,
    icon: '✨',
    title: 'Prueba tus habilidades',
    desc: 'Prueba las habilidades iniciales que acaba de desbloquear tu Avatar.',
    xp: 200,
    skippable: false,
    speaker: 'oliver',
    dialogue: [
      '¡Ya tienen camino los dos! ✨ Y eso significa que ya tienen sus primeras habilidades.',
      'Vamos a probarlas de verdad, no solo a leerlas. 😼',
    ],
    cta: { label: '✨ Ver mis habilidades', open: 'abilityReveal' },
  },
  {
    id: 'setup_ai',
    step: 7,
    icon: '🤖',
    title: 'Despierta su mente',
    desc: 'Configura la clave de IA de tu mascota (opcional). Puedes hacerlo después en Ajustes.',
    xp: 150,
    skippable: true,
    skipLabel: '⏭️ Saltar por ahora',
    speaker: 'oliver',
    dialogue: [
      '¡Perfecto! Tu compañero ya tiene poderes únicos. 🔮',
      'Ahora viene algo opcional pero muy poderoso: darle una mente de IA real para que piense y responda por sí mismo.',
    ],
    cta: { label: '⚙️ Ir a Ajustes', navigate: '/ajustes' },
  },
  {
    id: 'first_chat',
    step: 8,
    icon: '💬',
    title: 'Primera conversación',
    desc: 'Abre el chat de tu mascota y envíale tu primer mensaje.',
    xp: 250,
    skippable: false,
    speaker: 'oliver',
    dialogue: [
      '¡Tu compañero está casi listo! 🤖',
      'Ahora pruébalo: abre su menú y dile algo. Una primera conversación siempre se recuerda.',
    ],
    cta: { label: '💬 Abrir chat', hint: '¡Abre el menú de tu mascota (el botón 🐱 abajo a la derecha) y envíale un mensaje!' },
  },
  {
    id: 'enter_campus',
    step: 9,
    icon: '🏛️',
    title: 'Entra al Campus',
    desc: 'Cruza el portal y entra al Campus de Oliver Academy.',
    xp: 400,
    skippable: false,
    speaker: 'oliver',
    dialogue: [
      '¡Los escuché conversar! 💬 Ese es un vínculo que solo crece con el tiempo.',
      'Ya completaste todo lo que el Templo tenía para enseñarte. Solo falta un paso: cruzar hacia Oliver Academy.',
    ],
    cta: { label: '🏛️ Entrar al Campus', navigate: '/vr', completeFirst: true, announce: 'done', delayMs: 2400 },
  },
]

// Terminal state once every step above is done — not a real mission (no
// xp/step/icon), just who speaks the closing lines.
export const TUTORIAL_DONE_STEP = {
  speaker: 'oliver',
  dialogue: [
    '¡Has llegado lejos, estudiante! 🎉 El campus de Oliver Academy te espera con nuevas clases, batallas y aventuras.',
    '¡Nos vemos por ahí! 🌍',
  ],
}

export function getTutorialMission(id) {
  return TUTORIAL_MISSIONS.find(m => m.id === id)
}
