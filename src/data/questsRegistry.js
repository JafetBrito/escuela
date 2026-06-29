// Misiones encadenadas: varios pasos, cada uno entregado por un NPC distinto
// (o el mismo NPC varias veces, p. ej. para el saludo y la entrega final).
// A diferencia de globalMissionsRegistry.js (una sola condición booleana),
// aquí el jugador avanza paso a paso y el NPC correcto se calcula en
// VRPage.jsx según en qué paso esté cada quest activa.
//
// step.type === 'talk'      -> avanza con solo hablar (botón "Continuar").
// step.type === 'condition' -> solo avanza cuando check(missionState) es true
//                               (mismo `missionState` que usa useMissionState).
// step.type === 'terminal'  -> abre <BashTerminalModal> (VRPage.jsx) en vez del
//                               botón normal; avanza cuando el jugador completa
//                               todos los `checkpoints` (texto libre + validate()).
export const QUESTS = [
  {
    id: 'bienvenida-campus',
    title: 'Bienvenida al Campus',
    icon: '🗺️',
    description: 'Conoce a los guías cercanos al Gran Aula y demuestra tu progreso.',
    steps: [
      {
        npcId: 'viajero-encapuchado',
        type: 'talk',
        prompt: '¡Bienvenido! Habla con el Mago Novato para que evalúe tu progreso.',
      },
      {
        npcId: 'mago-novato',
        type: 'condition',
        check: (s) => s.level >= 2,
        prompt: 'Sube al nivel 2 y vuelve a verme.',
      },
      {
        npcId: 'viajero-encapuchado',
        type: 'talk',
        prompt: '¡Lo lograste! Toma tu recompensa.',
      },
    ],
    reward: { coins: 1500, xp: 50 },
  },
  {
    id: 'circulo-confianza',
    title: 'Círculo de Confianza',
    icon: '🤝',
    description: 'Conecta con otros estudiantes del campus.',
    steps: [
      {
        npcId: 'bibliotecario-menor',
        type: 'talk',
        prompt: 'Para crecer en el campus necesitas aliados. Habla con el Zorro Mensajero.',
      },
      {
        npcId: 'zorro-mensajero',
        type: 'condition',
        check: (s) => s.friendsCount > 0,
        prompt: 'Agrega al menos un amigo desde la página de Amigos.',
      },
      {
        npcId: 'guardian-lagarto',
        type: 'talk',
        prompt: '¡Bien hecho! Toma tu recompensa.',
      },
    ],
    reward: { coins: 1800, xp: 60 },
  },
  {
    // Misión de prueba: BashMishi "invita" al jugador al mundo de Bash que
    // todavía no existe. Pensada como plantilla para las muchas misiones de
    // este estilo que vendrán después — sin prisa, solo validando el formato.
    id: 'bash-basico',
    title: 'Primeros Pasos en Bash',
    icon: '💻',
    description: 'BashMishi te enseña tus primeros comandos en la terminal.',
    steps: [
      {
        npcId: 'bash-mishi',
        type: 'talk',
        prompt: '¡Miau! Soy BashMishi 🐾. Voy a enseñarte a hablar con la computadora usando Bash. ¿Listo para tu primera terminal?',
      },
      {
        npcId: 'bash-mishi',
        type: 'terminal',
        checkpoints: [
          {
            instruction: 'Para empezar, usa "echo" para imprimir un mensaje en pantalla.',
            placeholder: 'echo "Hola Mundo"',
            validate: (input) => /^echo\s+.+/i.test(input.trim()),
            success: '¡Perfecto! "echo" imprime texto en la terminal — es lo primero que aprende todo programador.',
            hint: 'Escribe la palabra "echo" seguida de un mensaje, por ejemplo: echo "Hola Mundo"',
          },
          {
            instruction: 'Ahora escribe un comentario explicando qué hace tu script. En Bash, los comentarios empiezan con "#" y la computadora los ignora — son para los humanos.',
            placeholder: '# Este script saluda al usuario',
            validate: (input) => /^#.+/.test(input.trim()),
            success: '¡Bien hecho! Los comentarios no se ejecutan, pero ayudan a entender el código después.',
            hint: 'La línea debe empezar con el símbolo #, por ejemplo: # Este script saluda al usuario',
          },
          {
            instruction: 'Último paso: combina "read" para pedir el nombre del usuario y "echo" para saludarlo usando esa variable. Ejemplo:\nread -p "¿Cómo te llamas? " nombre\necho "Hola, $nombre"',
            placeholder: 'read -p "¿Cómo te llamas? " nombre\necho "Hola, $nombre"',
            validate: (input) => /read\s/.test(input) && /echo\s+.*\$\w+/.test(input),
            success: '¡Excelente! Acabas de combinar entrada (read) y salida (echo) usando una variable. Eso es un programa real.',
            hint: 'Necesitas una línea con "read" que guarde el nombre en una variable, y otra con "echo" que use esa variable con "$".',
          },
        ],
      },
      {
        npcId: 'bash-mishi',
        type: 'talk',
        prompt: '¡Lo lograste! 🎉 Esto es solo el comienzo — pronto abriremos todo un mundo de Bash. Por ahora, toma tu recompensa.',
      },
    ],
    reward: { coins: 1200, xp: 40 },
  },
]

export function getQuestById(id) {
  return QUESTS.find((q) => q.id === id)
}

// A quest not yet accepted, not yet completed, whose first step belongs to
// this NPC — i.e. "this NPC can hand you this quest right now".
export function getStartableQuestForNpc(npcId, active, completed) {
  return QUESTS.find(
    (q) => q.steps[0].npcId === npcId && active[q.id] == null && !completed.includes(q.id),
  )
}

// Among the player's accepted quests, the one whose CURRENT step belongs to
// this NPC — i.e. "this NPC is who you need to talk to right now".
export function getActiveQuestStepForNpc(npcId, active) {
  for (const [questId, stepIndex] of Object.entries(active)) {
    const quest = getQuestById(questId)
    const step = quest?.steps[stepIndex]
    if (step?.npcId === npcId) return { quest, stepIndex, step }
  }
  return null
}
