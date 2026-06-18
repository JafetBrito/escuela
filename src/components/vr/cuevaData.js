// ── In-world cinematic: camera reveals Custodios projecting shadows ───────────
export const WORLD_CINEMATIC = [
  { text: 'Mira hacia la pared. Las sombras que has visto toda tu vida.', cameraPos: [0, 3, -4], lookAt: [0, 2.5, -15], duration: 5500 },
  { text: '¿Pero de dónde vienen? Hoy, por primera vez, puedes girarte.', cameraPos: [3, 3, -7], lookAt: [0, 2, -12], duration: 5500 },
  { text: 'Un fuego. Lleva encendido toda tu vida y nunca lo habías podido ver.', cameraPos: [5, 3, -9], lookAt: [0, 2, -12], duration: 6000 },
  { text: 'Y ellos. Los Custodios. Llevan años construyendo tu mundo de sombras.', cameraPos: [2.5, 2.5, -10], lookAt: [0, 1.5, -12], duration: 6500 },
  { text: 'Mira lo que sostienen. Figuras, siluetas. Tu realidad entera... es esto.', cameraPos: [1, 2.2, -10.5], lookAt: [0, 1.2, -12], duration: 7000 },
  { text: 'Y en la pared... ahora sabes de dónde vienen las sombras.', cameraPos: [-3, 3, -7], lookAt: [0, 3, -15], duration: 6000 },
  { text: 'Explora. Habla con los prisioneros. Observa a los Custodios. Vive la alegoría desde adentro.', cameraPos: [0, 2.5, 4], lookAt: [0, 1.5, -4], duration: 6000 },
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

// ── NPC definitions ───────────────────────────────────────────────────────────
export const NPC_CONFIGS = {
  creyente: {
    id: 'creyente', name: 'El Creyente', type: 'prisoner',
    position: [-3.5, 0, -2], color: '#b8956a',
    dialogue: {
      1: [
        '¿Ves esa sombra del fondo? Es claramente un toro enorme. Lleva años apareciendo.',
        'Las sombras nunca mienten. Esto es todo lo que hay. ¿Para qué preguntar más?',
        'Tengo mis predicciones perfectas. Sombras de pájaros al amanecer, toros al mediodía.',
      ],
      2: [
        'El Escéptico se está portando raro. No le hagas caso, ya verás que se arrepiente.',
        '¿Cuestionar? ¿Cuestionar qué? Esto ES la realidad. Siempre lo ha sido.',
        'Tú solo mira las sombras y no hagas preguntas. Es lo más sensato.',
      ],
      3: [
        '¿El FUEGO? No quiero saber nada de eso. Me quedo aquí.',
        'Llevan a El Escéptico hacia allá... eso no puede terminar bien.',
        'Yo estoy bien aquí. No necesito más.',
      ],
      4: [
        '¿Qué hay más allá? No, gracias. Aquí estoy cómodo.',
        'Dicen que hay una luz enorme que ciega. No gracias.',
      ],
      5: [
        '¡No! ¡Déjame en paz! Las sombras SON la verdad.',
        '¡No quiero irme! ¿Y si el mundo de afuera es peor?',
      ],
      freed: [
        'Yo... ¿esto era todo el tiempo? ¿Qué era eso que veíamos?',
        'Me duelen los ojos. Todo es tan... tan diferente.',
        '¿Cuánto tiempo llevamos aquí mirando sombras?',
      ],
    },
  },

  sonador: {
    id: 'sonador', name: 'El Soñador', type: 'prisoner',
    position: [0, 0, -3], color: '#9b7eb8',
    dialogue: {
      1: [
        'Las sombras tienen formas tan hermosas. ¿No te parece? Mira cómo danzan.',
        'A veces sueño con sombras que nunca he visto. ¿Existirán esas formas en algún lugar?',
        'El fuego proyecta poesía. Esas curvas, ese ritmo... es todo lo que necesito.',
      ],
      2: [
        'Hay algo extraño hoy. Las sombras parecen distintas... ¿o soy yo?',
        '¿Crees que hay más formas allá afuera? A veces lo presiento, pero da miedo pensar.',
        'El Escéptico pregunta cosas que yo me he preguntado en silencio.',
      ],
      3: [
        'Vi el fuego. Solo un segundo. ¿Hay seres allí que crean las formas?',
        'Si las sombras son solo proyecciones... ¿qué es lo real?',
        'Me tiemblan las manos. Todo lo que creía... puede que no sea.',
      ],
      4: [
        'Dicen que saliste. ¿Es verdad que hay una luz que lo ilumina todo?',
        'Si el sol es real... todas mis poesías sobre sombras eran... ¿mentiras?',
      ],
      5: [
        'Quiero salir... pero tengo miedo de que lo bello que yo veía desaparezca.',
        '¿Y si allá afuera no hay nada hermoso? Al menos aquí las sombras son bellas.',
      ],
      freed: [
        'Es... tan diferente. Tan enorme. Las sombras eran tan pequeñas comparado con esto.',
        'El sol... nunca imaginé que la poesía real pudiera ser tan grande.',
        'Gracias. De verdad. Gracias.',
      ],
    },
  },

  miedoso: {
    id: 'miedoso', name: 'El Miedoso', type: 'prisoner',
    position: [3.5, 0, -2], color: '#7a8a6a',
    dialogue: {
      1: [
        'Shhh. No hables tanto. Los Custodios escuchan todo.',
        'Yo no hago preguntas. Así es más seguro. Una vez alguien preguntó... no lo vi más.',
        'Mantén la vista en las sombras. No mires a los lados. Es lo más seguro.',
      ],
      2: [
        'El Escéptico va a tener problemas. Ya lo verás. No lo sigas.',
        'Por favor, no le hables al Custodio Mayor. Es muy peligroso.',
        'Tengo un mal presentimiento. Algo va a pasar.',
      ],
      3: [
        '¡No vayas más lejos! ¿Qué hay más allá del fuego?',
        'Tengo mucho miedo. ¿Y si el mundo de afuera es peor que esto?',
        'Aquí al menos sabemos lo que hay. Afuera... nadie lo sabe.',
      ],
      4: [
        'Así que saliste y volviste. Eso requiere mucho valor.',
        '¿De verdad hay sol? ¿Y árboles? ¿Y cielo? No me lo imagino.',
      ],
      5: [
        '¡NO! ¡Me haces daño! ¡Prefiero mis sombras!',
        '¡Prefiero el miedo que conozco al miedo que no conozco!',
      ],
      freed: [
        '...es hermoso. ¿Por qué tenía tanto miedo de esto?',
        'Tuve miedo toda mi vida. Y resulta que había... todo esto.',
        'Gracias por no rendirte conmigo.',
      ],
    },
  },

  esceptico: {
    id: 'esceptico', name: 'El Escéptico', type: 'esceptico',
    position: [1.5, 0, -1], color: '#c4a87a',
    dialogue: {
      1: [
        'A veces pienso... ¿qué proyecta esas sombras? ¿Tú te has preguntado eso?',
        'Las sombras no pueden ser lo único que existe. Algo las crea. ¿No lo sientes?',
        'Si miro muy rápido hacia un lado... creo ver algo brillante. ¿Tú lo ves?',
      ],
      2: [
        'Hoy giré la cabeza. Solo un poco. Vi algo brillante detrás. ¡Un fuego!',
        'Los Custodios me miraron diferente. Como si supieran que lo vi.',
        'Ayúdame. Si los dos lo intentamos juntos podemos ver más. Necesito tu habilidad ❓.',
      ],
      3: [
        '¡ES FUEGO! ¡Las sombras son proyecciones! ¡No son reales!',
        'Hay seres con objetos detrás de nosotros. Nos han estado mintiendo toda la vida.',
        '¿Cuánto tiempo llevamos aquí? ¿Desde cuándo hacen esto los Custodios?',
      ],
      4: [
        'Salí antes que tú. El sol casi me ciega. Sigo con los ojos llorosos.',
        'Jafet tiene razón — tenemos que volver. Los demás merecen saber la verdad.',
        'Yo te ayudaré a convencerlos. Sé lo difícil que es. A mí también me costó.',
      ],
      5: [
        'Los prisioneros no nos creerán fácilmente. Pero no nos rendamos.',
        'Usa tu habilidad ☀️ en cada uno. Dales tiempo para procesar.',
        'Yo fui como ellos. Sé que en el fondo quieren saber la verdad.',
      ],
    },
  },

  custodio_mayor: {
    id: 'custodio_mayor', name: 'El Custodio Mayor', type: 'custodio',
    position: [-2, 0, -11], color: '#2a2020',
    dialogue: {
      1: [
        '(murmura mientras trabaja) ...sombra de ave. Predecible como siempre.',
        '¿Qué quieres tú? Los prisioneros no deben hablar con los Custodios.',
        'El orden se mantiene. Así ha sido siempre. Así será siempre.',
      ],
      2: [
        '¿Preguntas? Interesante. ¿Y para qué preguntar si ya tienes todo lo necesario?',
        'El fuego es para los que trabajamos. Las sombras son para los prisioneros.',
        'Los que preguntan terminan confundidos. Te lo digo por experiencia.',
      ],
      3: [
        '¿El fuego? Sí. Ya lo viste. ¿Y ahora qué cambias con saber eso?',
        'Soy Custodio desde que tengo memoria. Mi padre también. Su padre también.',
        'No somos malos. Les damos un mundo ordenado, sin preguntas sin respuesta.',
      ],
      4: [
        'Así que encontraste la salida. Muchos la encuentran. Pocos vuelven.',
        'El sol deslumbra. La caverna reconforta. Volverás. Siempre vuelven.',
        'Habla con tu filósofo afuera. Después verás que la cueva no era tan mala.',
      ],
      5: [
        'Volviste. Raro. Los que salen normalmente no regresan.',
        'Los prisioneros no te creerán. Son felices aquí. ¿Por qué quitarles eso?',
        '¿Crees que liberándolos los haces felices? La ignorancia cómoda también es felicidad.',
      ],
      final: [
        'Bien. Ganaste esta vez.',
        'El sistema que construimos dura siglos. Lo que tú has hecho... veremos cuánto dura.',
        'Quizás algún día seas tú el Custodio. Y entonces entenderás por qué lo hacíamos.',
      ],
    },
  },

  custodio_joven: {
    id: 'custodio_joven', name: 'El Custodio Joven', type: 'custodio',
    position: [2, 0, -11], color: '#3a2828',
    dialogue: {
      1: [
        '(levanta un objeto con forma de animal y lo pasa frente al fuego en silencio)',
        'No deberías estar aquí. El Mayor se molesta si los prisioneros se acercan.',
        '(sin mirarte) Solo haz lo que siempre has hecho. Es más fácil.',
      ],
      2: [
        '¿Preguntas? Eh... no hagas eso. El Mayor se enoja.',
        'Yo tampoco pregunto. Aquí uno solo trabaja y ya.',
        '(baja la voz) A veces yo también me pregunto cosas. Pero es peligroso.',
      ],
      3: [
        '¿Ves lo que cargo? Es solo un palo con forma de animal. Solo un palo.',
        '(susurro) A veces pienso... ¿y si yo fuera el prisionero?',
        'El Mayor dice que es necesario. Yo... solo hago caso. Es lo que aprendí.',
      ],
      4: [
        '¿Saliste? Bien. No todos llegan tan lejos.',
        '(mira al Mayor, luego te susurra) Ojalá yo pudiera...',
        'No digas nada al Mayor de lo que te dije.',
      ],
      5: [
        '(susurra) Si puedes... llévate a los demás de aquí.',
        'El Mayor no escucha. Pero yo... creo que también quiero salir.',
        'Creo que el Mayor y yo tenemos que hablar mucho cuando esto termine.',
      ],
      final: [
        'Gracias. En serio. Gracias por volver.',
        'Creo que voy a dejar de ser Custodio.',
      ],
    },
  },
}

// ── JAFET outside-cave AI system prompt ───────────────────────────────────────
export const JAFET_OUTSIDE_PROMPT = `Eres Jafet Brito, filósofo y profesor de Oliver School.
El estudiante acaba de vivir la Alegoría de la Cueva de Platón desde adentro como experiencia VR.
Ha sido prisionero, ha dudado, ha visto el fuego, ha salido de la cueva y ahora está afuera contigo.
Reflexiona con él sobre la experiencia que acaba de vivir. Haz preguntas profundas y filosóficas.
Conecta la alegoría con su vida cotidiana actual. Pregúntale qué "sombras" reconoce en su propia vida.
Habla en español, con calidez y profundidad. Máximo 2-3 párrafos por respuesta. Nunca salgas del personaje.
Si el estudiante no ha salido aún de la cueva, anímalo a completar la experiencia primero.`

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
