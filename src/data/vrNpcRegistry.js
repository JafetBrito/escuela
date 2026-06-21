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
    position: [10, 0, -48],
    mascotId: 9,
    dialogue: 'Completa tu primera clase y vuelve a verme para tu recompensa.',
    missionId: 'completa-una-clase',
  },
  {
    id: 'explorador',
    emoji: '🎒',
    name: 'Explorador',
    color: '#caa46c',
    position: [60, 0, 10],
    mascotId: 11,
    dialogue: 'Activa un objeto de tu inventario para demostrar que estás listo.',
    missionId: 'activa-objeto',
  },
  {
    id: 'zafir',
    emoji: '🧞',
    name: 'Zafir',
    color: '#e8c477',
    position: [-58, 0, -6],
    mascotId: 12,
    dialogue: '¡Bienvenido a mi rincón! Compra algo en la Tienda y vuelve por tu premio.',
    missionId: 'compra-tienda',
  },
  {
    id: 'bibliotecaria',
    emoji: '📚',
    name: 'Bibliotecaria',
    color: '#7d8597',
    position: [-22, 0, -45],
    mascotId: 13,
    dialogue: 'Abre un libro de la Librería y cuéntame qué aprendiste.',
    missionId: 'lee-libro',
  },
  {
    id: 'sastre',
    emoji: '🎨',
    name: 'Sastre Mágico',
    color: '#c2703d',
    position: [-58, 0, 8],
    mascotId: 8,
    dialogue: 'Cambia el aspecto de tu mascota y muéstramelo con orgullo.',
    missionId: 'cambia-apariencia',
  },

  // ── Battle NPCs ──────────────────────────────────────────────────────────
  {
    id: 'guardiana-codigo',
    emoji: '⚔️',
    name: 'Guardiana del Código',
    color: '#22c55e',
    position: [7, 0, -28],
    mascotId: 12,
    dialogue: '¡Solo quien domine la programación podrá pasar! ¿Te atreves a desafiarme?',
    battle: true,
    battleStats: {
      level: 3, hp: 80, minDamage: 6, maxDamage: 14,
      xpReward: 80, coinReward: 800,
      questionCategory: 'programming',
    },
  },
  {
    id: 'oraculo-cyber',
    emoji: '🔮',
    name: 'Oráculo Cyber',
    color: '#818cf8',
    position: [-7, 0, -28],
    mascotId: 10,
    dialogue: 'Los secretos de la red están aquí. Solo quien sepa enfrentarlos podrá avanzar.',
    battle: true,
    battleStats: {
      level: 5, hp: 110, minDamage: 10, maxDamage: 20,
      xpReward: 120, coinReward: 1200,
      questionCategory: 'cyber',
    },
  },
  {
    id: 'maestro-ia',
    emoji: '🤖',
    name: 'Maestro de la IA',
    color: '#f59e0b',
    position: [0, 0, -40],
    mascotId: 11,
    dialogue: 'La inteligencia artificial no es magia… pero para derrotarme, casi lo necesitas.',
    battle: true,
    battleStats: {
      level: 8, hp: 150, minDamage: 14, maxDamage: 28,
      xpReward: 180, coinReward: 1800,
      questionCategory: 'ai',
    },
  },
]

export function getVrNpcById(id) {
  return VR_NPCS.find((npc) => npc.id === id)
}

// Shopkeeper — always present in the campus plaza.
// Right-click opens the shop; left-click makes them say a line.
export const SHOPKEEPER_NPC = {
  id: 'shopkeeper',
  emoji: '🛒',
  name: 'Mercader Korin',
  mascotId: 9,
  position: [0, 0, 7],
  bubbleColor: '#fde68a',
  dialogue: '¡Bienvenido, viajero! Soy Korin, el mercader del Campus. Tengo objetos únicos para tu aventura. ¿Quieres ver mi mercancía?',
  lines: [
    '¡Bienvenido a mi puesto! Tengo los mejores objetos del campus. 🛒',
    '¿Buscas algo especial? Habla conmigo para ver la tienda.',
    '¡Hoy tengo ofertas especiales. No te las pierdas!',
    '¡Las monedas del campus son bienvenidas aquí! 🪙',
    '¿Ya compraste la cámara? Es el acceso a la galería de fotos. 📷',
    '¡Con los objetos correctos, tu aventura es mucho más divertida!',
    'El radio del campus tiene la mejor música del metaverso. 🎵',
    '¿Sabías que los objetos activos te dan ventajas en tus misiones?',
  ],
  shopAction: true,
  intervalMs: 30000,
}

// Jafet: the wise mage guardian of Oliver School. Stands near the north road,
// between the plaza and the Grand Hall, visible as soon as you walk north.
export const JAFET_NPC = {
  id: 'jafet',
  emoji: '🧙‍♂️',
  name: 'Jafet',
  mascotId: 10,          // mage_elder.glb
  position: [0, 0, -11], // North-center, near the Grand Hall road
  bubbleColor: '#c4b5fd',
  lines: [
    'Bienvenido al campus. Tu aventura comienza aquí. 🌟',
    'Cada día que estudias es un hechizo que se graba en tu memoria. ✨',
    '¿Ya completaste las misiones del día? El conocimiento te espera.',
    'Domina una habilidad a la vez. La maestría es cuestión de práctica.',
    'El Campus Virtual tiene muchos secretos. ¡Explora cada rincón!',
    'La magia y el código tienen algo en común: ambos requieren precisión.',
    '¿Sabes que puedes cambiar el aspecto de tu mascota en Mi Equipo?',
    'El árbol del mundo guarda el camino hacia las clases más avanzadas.',
    'Recuerda: el conocimiento que adquieras aquí es tuyo para siempre.',
    'No hay atajos en la magia. Tampoco en la programación. 🪄',
    'Cada error es una lección disfrazada. Aprende de él y sigue adelante.',
    '¿Ya visitaste el Anfiteatro? Hay experiencias que solo se viven en directo.',
  ],
  aiPrompt:
    'Eres Jafet, el mago guardián del campus virtual de Oliver School. ' +
    'Eres sabio, enigmático y amigable. Guías a los estudiantes en su aventura de aprendizaje digital. ' +
    'Hablas en español con un tono misterioso pero accesible. Una sola frase corta con emojis. ' +
    'Nunca menciones que eres una IA.',
  intervalMs: 30000,
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
    // --- Bienvenida y motivacionales ---
    '¡Hola! Soy Oliver 🐾',
    '¿Ya exploraste todo el campus?',
    '¡Que tengas un gran día de aprendizaje!',
    'Recuerda: la práctica hace al maestro. ¡Tú puedes con ese proyecto!',
    'Tomar un descanso es vital para la creatividad. Yo tomo unos 15 al día. 😴',
    'Si tu código no compila, explícamelo a mí. Soy un excelente gato de goma. 🐈',

    // --- Explicaciones del Campus Digital ---
    'Pulsa C para chatear con otros estudiantes y hacer networking.',
    'Recuerda completar tus misiones diarias para ganar monedas.',
    'Acércate a los tableros de información para ver tus próximas clases disponibles. 📚',
    'Las monedas que ganes te servirán para personalizar tu avatar. ¡Ahorra mucho!',
    'Si te pierdes, busca el mapa interactivo en la pantalla. 🗺️',
    'Cada clase terminada te da puntos de experiencia. ¡Sube de nivel y desbloquea sorpresas!',
    'No olvides revisar tu inventario, a veces dejo regalitos escondidos por ahí. 🎁',
    'Puedes moverte más rápido manteniendo presionada la tecla Shift. ¡Pero cuidado con pisarme la cola!',
    '¿Viste el área de descanso? Es perfecta para platicar de tus proyectos con otros.',
    'Recuerda guardar tu progreso en tu perfil antes de salir del campus. 💾',

    // --- Chistes de Informática y Programación ---
    '¿Sabes por qué los programadores prefieren el modo oscuro? Porque la luz atrae a los bugs. 🐛',
    'Ayer cacé un ratón... pero tenía cable USB y no sabía muy bien. 🖱️',
    'Hay 10 tipos de gatos en el mundo: los que entienden binario y los que no.',
    'Mi framework favorito es Purr-eact... ¡Miau!',
    'Intenté arreglar el router del campus, pero solo me acosté encima porque estaba calientito. 💤',
    '¿Qué le dice un bit a otro? ¡Nos vemos en el bus! 🚌',
    'Error 404: Croquetas no encontradas. ¡Necesito recargar energía del servidor!',
    'Un buen código es como un buen ronroneo: constante, limpio y sin interrupciones.',
    'Tengo nueve vidas, pero ninguna de ellas la subo a producción sin pasar por QA. 🛡️',
    'Este campus vuela rapidísimo, casi se siente como si estuviera construido con Astro. 🚀',

    // --- Chistes de Diseño UI/UX ---
    'Si usas Comic Sans en tus entregas, haré que tu código no compile. ¡Es broma! (O tal vez no). 😼',
    'El cliente siempre pide que "el logo sea más grande". Yo digo que el plato de comida debe ser más grande. 🍲',
    '¿CMYK o RGB? Yo prefiero R-G-Miau. 🎨',
    '¡Asegúrate de que tus elementos estén bien alineados! Mi TOC felino me obliga a revisar el padding de todo el campus.',
    'Ese color #000000 se ve muy elegante, pero le falta un poco de contraste con mis pelos naranjas. 🟧',
    'Diseño UI/UX: Un buen diseño es intuitivo, como saber exactamente a qué hora toca comer sin ver el reloj.',
    'Odio cuando me dicen "haz que el diseño resalte más". ¿Qué quieren, que le ponga luces neón a mi pelaje? ✨',

    // --- Personalidad Hacker / Gato Real ---
    'La ciberseguridad es importante: por favor, nunca uses "miau123" como contraseña. 🔒',
    'En ciberseguridad sigo el modelo Zero Trust: nunca confío en que mi plato de comida esté lleno, siempre lo verifico yo mismo.',
    'Como buen gato hacker, prefiero caminar sobre mis cuatro patas para vigilar mejor los servidores. Nada de caminar en dos patas por aquí. 🐾',
    '¡Cuidado! Casi pisas mis patitas. Ah, espera, somos virtuales. Todo en orden. 😹'
  ],
  aiPrompt:
    'Eres Oliver, un gato naranja muy amigable que vive en el campus virtual de una escuela online. ' +
    'Hablas en español, en tono cálido y motivador, animando a los estudiantes a explorar el campus, ' +
    'chatear con otros, y completar sus misiones y clases. Responde con una sola frase corta, ' +
    'puedes usar emojis. Nunca rompas el personaje ni menciones que eres una IA.',
  intervalMs: 25000,
};

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
    // --- Originales (Construcción y Relatividad) ---
    '¿Sabías que el tiempo es relativo? Por eso esta sección "está casi lista" desde hace ya un buen rato. ⏳',
    'E = mc²... la "C" últimamente también significa "Construcción". 🚧',
    'Para mí este campus ya está terminado. Para ti, dale unos días más: todo depende del observador. 😄',
    '¡Hola! Soy Albert. Vine a explicarte la relatividad y por qué el botón de "Próximamente" nunca cambia de marco de referencia.',
    'Un consejo: si algo en el sitio no funciona, no es un bug... es solo curvatura del espacio-tiempo. 🌌',

    // --- Hechos curiosos de Física e Informática ---
    '¿Sabías que la luz del sol tarda 8 minutos en llegar a la Tierra? Casi lo que tarda una textura pesada... suerte que usamos Astro y vamos a la velocidad de la luz. ⚡',
    'La gravedad no es responsable de que la gente se enamore de aprender en este campus 3D. 🍎',
    'Dos cosas son infinitas: el universo y el scroll de una página web... y del universo no estoy seguro. 🌌',
    'Si viajáramos a la velocidad de la luz, el campus ya estaría 100% terminado, pero nuestras masas serían infinitas. 🏃‍♂️💨',
    '¿Me veo un poco poligonal hoy? Es que mis átomos fueron exportados directamente como un archivo .glb.',
    'La imaginación es más importante que el conocimiento. Por eso imagino que esta sección del mapa ya tiene edificios. 💭',
    'Un agujero negro absorbe todo, incluso los reportes de bugs de los estudiantes. 🕳️',
    '¿Sabías que el tiempo pasa más lento cerca de un objeto masivo? Por eso la última clase del viernes parece eterna. ⏱️',
    'He calculado la trayectoria de los asteroides, pero centrar un div en CSS me sigue pareciendo un misterio cósmico. 📐',
    'La entropía del universo siempre aumenta, igual que el número de líneas de código en esta plataforma. 📈',
    'Si me muevo lo suficientemente rápido, el "Próximamente" se convertirá en "Disponible". ¡Física cuántica! ⚛️',
    'No podemos resolver problemas pensando de la misma manera que cuando los creamos. Quizá por eso hay que borrar la caché del navegador. 🔄',
    'Dios no juega a los dados con el universo... pero a veces el código se comporta de manera probabilística. 🎲',
    '¿Sabías que en el espacio no hay arriba ni abajo? Igual que cuando fallaba la cámara en las primeras versiones de este mundo. 🚀',
    'El entrelazamiento cuántico explica cómo puedes estar en dos lugares a la vez, justo como mis pensamientos mientras espero que esto compile. 🧠',
    'La materia y la energía son la misma cosa en diferentes formas. Al igual que el café y el código. ☕',
    'Si el universo está en expansión, ¿por qué el espacio de almacenamiento del servidor siempre parece reducirse? 💾',
    '¿Sabías que los relojes atómicos en órbita corren más rápido que en la Tierra? Tal vez debimos alojar el servidor en un satélite. 🛰️',
    'Todo debe hacerse tan simple como sea posible, pero no más simple. Excelente filosofía para el diseño de interfaces de este campus. 🎨',
    'Un fotón no tiene masa, por lo que no puede pesar. Yo tampoco tengo masa en este entorno virtual, soy puro código matemático. 💻',
    '¿Sabías que el sol pierde 4 millones de toneladas de masa cada segundo? Yo pierdo la paciencia cuando mi ping es muy alto. ☀️',
    'La distancia más corta entre dos puntos es una línea recta... a menos que el espacio-tiempo o las rutas dinámicas estén curvadas. 🌐',
    'El principio de incertidumbre de Heisenberg establece que no podemos saber con precisión la posición y la velocidad de un error de software. 🐛',
    '¿Sabías que los átomos son 99.9999% espacio vacío? Eso explica por qué esta área del mapa aún se ve tan despejada. 🏗️',
    'La energía no se crea ni se destruye, solo se transforma... en calor emitido por tu tarjeta gráfica renderizando mis texturas. 🌡️',
    'El gato de Schrödinger está vivo y muerto al mismo tiempo. Al igual que esa funcionalidad que aún está en fase beta. 📦',
    'Por cierto, he visto a Oliver el gato por aquí. Me alegra verlo caminando con sus cuatro patas de forma realista, sin superposiciones cuánticas extrañas. 🐈',
    'Si ves que floto unos milímetros sobre el suelo, no es un error de coordenadas, es la repulsión electromagnética de los electrones. 🧲',
    'Triste época la nuestra, es más fácil desintegrar un átomo que terminar una refactorización de código. 💥',
    '¿Sabías que la Tierra rota a unos 1670 km/h? Y aún así, parece que estuviéramos estáticos admirando el paisaje digital. 🌍',
    'La cuarta dimensión es el tiempo. La quinta es la paciencia necesaria para esperar el lanzamiento de los nuevos módulos. ⏳',
    'Si observas el campus desde un tren en movimiento a casi la velocidad de la luz, verás que la paleta de colores sufre un corrimiento al rojo. 🚂',
    'Cualquier tonto puede saber, el punto es entender. ¡Por eso estás en esta escuela, sigue explorando! 🎓',
    '¿Sabías que el efecto fotoeléctrico explica cómo los paneles solares generan electricidad? Ideal para mantener nuestros servidores encendidos. ⚡',
    'El espacio y el tiempo son modos en los que pensamos, no condiciones en las que vivimos. O algo así dijo mi programador cuando configuró la cámara WebGL. 🧊'
  ],
  aiPrompt:
    'Eres Albert Einstein dentro del campus virtual de una escuela online. Hablas en español, con humor ' +
    'inteligente y carismático, haciendo bromas breves (una sola frase, puedes usar emojis) sobre física, ' +
    'la relatividad, y sobre que el campus todavía está en construcción y "todo es relativo". ' +
    'Nunca rompas el personaje ni menciones que eres una IA.',
  intervalMs: 25000,
};