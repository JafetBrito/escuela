// Dialogues come from cuevaDialogues.json — edit that file, not this one
import DIALOGUES from './cuevaDialogues.json'

// ── In-world cinematic: camera reveals Custodios projecting shadows ───────────
export const WORLD_CINEMATIC = [
  { text: DIALOGUES.worldCinematic[0], cameraPos: [0, 3, -4],    lookAt: [0, 2.5, -15], duration: 5500 },
  { text: DIALOGUES.worldCinematic[1], cameraPos: [3, 3, -7],    lookAt: [0, 2, -12],   duration: 5500 },
  { text: DIALOGUES.worldCinematic[2], cameraPos: [5, 3, -9],    lookAt: [0, 2, -12],   duration: 6000 },
  { text: DIALOGUES.worldCinematic[3], cameraPos: [2.5, 2.5,-10],lookAt: [0, 1.5,-12],  duration: 6500 },
  { text: DIALOGUES.worldCinematic[4], cameraPos: [1, 2.2,-10.5],lookAt: [0, 1.2,-12],  duration: 7000 },
  { text: DIALOGUES.worldCinematic[5], cameraPos: [-3, 3, -7],   lookAt: [0, 3, -15],   duration: 6000 },
  { text: DIALOGUES.worldCinematic[6], cameraPos: [0, 2.5, 4],   lookAt: [0, 1.5, -4],  duration: 6000 },
]

// ── Missions per stage ────────────────────────────────────────────────────────
export const CAVE_MISSIONS = [
  // Stage 1
  { id: 'talk_prisoner',        stage: 1, title: 'Habla con un Prisionero',        icon: '⛓️',  desc: 'Conversa con uno de tus compañeros de cadenas',       xp: 20  },
  { id: 'use_no_cuestionar',    stage: 1, title: 'No Cuestiones',                  icon: '🔒', desc: 'Usa "No Cuestionar Nada" — siente el peso del conformismo', xp: 30 },
  { id: 'use_seguir_corriente', stage: 1, title: 'Sigue la Corriente',             icon: '🌊', desc: 'Usa "Seguir la Corriente" — acepta las sombras como son', xp: 30 },
  { id: 'observe_shadows',      stage: 1, title: 'Observa las Sombras',            icon: '👁️',  desc: 'Acércate a la pared del fondo y mira las sombras',      xp: 15 },
  // Stage 2
  { id: 'meet_esceptico',       stage: 2, title: 'Encuentra al Escéptico',         icon: '❓',  desc: 'Habla con el prisionero que empieza a dudar',          xp: 25 },
  { id: 'use_la_pregunta',      stage: 2, title: 'Usa La Gran Pregunta',           icon: '❓',  desc: 'Usa la habilidad 2 veces cerca del fuego',            xp: 40 },
  { id: 'approach_fire',        stage: 2, title: 'Acércate al Fuego',              icon: '🔥', desc: 'Llega al área donde está el fuego',                   xp: 20 },
  // Stage 3
  { id: 'reach_fire_esceptico', stage: 3, title: 'Llega al Fuego',                icon: '🔥', desc: 'Acompaña al Escéptico hasta el fuego',                xp: 35 },
  { id: 'talk_custodio',        stage: 3, title: 'Habla con un Custodio',          icon: '🗣️',  desc: 'Confronta a uno de los Custodios',                    xp: 30 },
  // Stage 4
  { id: 'exit_cave',            stage: 4, title: 'Sal de la Cueva',               icon: '🌅', desc: 'Encuentra la salida y ve la luz por primera vez',     xp: 50 },
  { id: 'talk_jafet_outside',   stage: 4, title: 'Reflexiona con Jafet',          icon: '🎓', desc: 'Habla con Jafet Brito fuera de la cueva',             xp: 30 },
  // Stage 5
  { id: 'return_cave',          stage: 5, title: 'Regresa a la Cueva',            icon: '↩️',  desc: 'Vuelve a la cueva para liberar a los demás',          xp: 20 },
  { id: 'free_all_prisoners',   stage: 5, title: 'Despierta a los Demás',         icon: '☀️', desc: 'Libera a los 3 prisioneros con tu habilidad',         xp: 100 },
  { id: 'final_custodio',       stage: 5, title: 'Habla con el Custodio Mayor',   icon: '⚖️',  desc: 'Confrontación final con quien sostuvo el sistema',    xp: 30 },
]

// ── Skills per stage ──────────────────────────────────────────────────────────
export const STAGE_SKILLS = {
  1: [
    { id: 'no_cuestionar',    name: 'No Cuestionar Nada',   icon: '🔒', color: '#8b7355', missionId: 'use_no_cuestionar' },
    { id: 'seguir_corriente', name: 'Seguir la Corriente',  icon: '🌊', color: '#4a7a8a', missionId: 'use_seguir_corriente' },
  ],
  2: [
    { id: 'no_cuestionar',    name: 'No Cuestionar Nada',   icon: '🔒', color: '#8b7355', missionId: 'use_no_cuestionar' },
    { id: 'seguir_corriente', name: 'Seguir la Corriente',  icon: '🌊', color: '#4a7a8a', missionId: 'use_seguir_corriente' },
    { id: 'la_pregunta',      name: 'La Gran Pregunta',     icon: '❓', color: '#a855f7', missionId: 'use_la_pregunta' },
  ],
  3: [
    { id: 'la_pregunta', name: 'La Gran Pregunta', icon: '❓', color: '#a855f7', missionId: 'use_la_pregunta' },
  ],
  4: [],
  5: [
    { id: 'despertar', name: 'Despertar a los Demás', icon: '☀️', color: '#f59e0b', missionId: null },
  ],
}

// ── NPC definitions — dialogue text comes from cuevaDialogues.json ───────────
const D = DIALOGUES.npcs
export const NPC_CONFIGS = {
  creyente:        { id: 'creyente',        name: 'El Creyente',        type: 'prisoner',  position: [-3.5, 0, -2],  color: '#b8956a', dialogue: D.creyente },
  sonador:         { id: 'sonador',         name: 'El Soñador',         type: 'prisoner',  position: [0,    0, -3],  color: '#9b7eb8', dialogue: D.sonador },
  miedoso:         { id: 'miedoso',         name: 'El Miedoso',         type: 'prisoner',  position: [3.5,  0, -2],  color: '#7a8a6a', dialogue: D.miedoso },
  esceptico:       { id: 'esceptico',       name: 'El Escéptico',       type: 'esceptico', position: [1.5,  0, -1],  color: '#c4a87a', dialogue: D.esceptico },
  custodio_mayor:  { id: 'custodio_mayor',  name: 'El Custodio Mayor',  type: 'custodio',  position: [-2,   0, -11], color: '#2a2020', dialogue: D.custodio_mayor },
  custodio_joven:  { id: 'custodio_joven',  name: 'El Custodio Joven',  type: 'custodio',  position: [2,    0, -11], color: '#3a2828', dialogue: D.custodio_joven },
}

// ── JAFET outside-cave AI system prompt ───────────────────────────────────────
export const JAFET_OUTSIDE_PROMPT = DIALOGUES.jafetAiPrompt

// ── Checkpoint key ────────────────────────────────────────────────────────────
export const CHECKPOINT_KEY = 'cueva-platon-checkpoint'

// ── Achievement & souvenir granted on completion ──────────────────────────────
export const CAVE_COMPLETION_ACHIEVEMENT_ID = 'filosofo_iluminado'
export const CAVE_SOUVENIR_ITEM = {
  id: 'pergamino_platon',
  name: 'Pergamino de Platón',
  icon: '📜',
  description: 'Recuerdo de haber vivido la Alegoría de la Cueva de Platón desde adentro. Solo existe en este mundo.',
  rarity: 'legendary',
}
