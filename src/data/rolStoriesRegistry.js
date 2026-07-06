// ── ROL Stories Registry ───────────────────────────────────────────────────────
// Each story is a self-contained campaign for the board game.
// It provides its own questions, narrative flavor, and visual theme.

export const ROL_STORIES = [
  // ── STORY 1: La Senda del Programador ─────────────────────────────────────
  {
    id: 'senda-programador',
    title: 'La Senda del Programador',
    subtitle: 'Campaña de Código',
    icon: '💻',
    gradient: 'from-[#fb923c] to-[#facc15]',
    accentColor: '#fb923c',
    boardBg: '#0a1200',
    boardGlow: '#fb923c',
    description: 'El Bug Oscuro ha corrompido el Campus Digital. Como Aprendiz del Código, restaura el orden respondiendo desafíos de programación.',
    intro: [
      '⚡ El Bug Oscuro ha corrompido el Campus Digital...',
      '🧑‍💻 Tú, Aprendiz del Código, eres la última esperanza.',
      '📜 Derrota al Bug respondiendo desafíos de programación.',
      '🏆 El primer Programador en alcanzar la Maestría ganará.',
    ],
    winTitle: '¡Maestro Programador!',
    winText: 'Has derrotado al Bug Oscuro y restaurado el Campus Digital.',
    flavor: {
      reward:   { icon: '📦', title: 'Artefacto de Código',    body: 'Encuentras un módulo antiguo lleno de sabiduría. +300 💰 +30 ✨' },
      trap:     { icon: '🐛', title: 'Bug Emboscada',          body: 'Un Bug te atrapa desprevenido y corroe tus recursos. −150 💰' },
      safe:     { icon: '🛡️', title: 'Zona de Debugging',      body: 'Encuentras una zona libre del Bug. Recuperas energía.' },
      start:    { icon: '🖥️', title: 'Terminal de Inicio',     body: 'Pasas por el Terminal de Inicio. El sistema te recuerda.' },
      question: { icon: '🔍', prefix: 'El Compilador te desafía:' },
      battle:   { icon: '⚔️', prefix: 'El Bug Jefe te ataca con un acertijo difícil:' },
    },
    questions: [
      { q: '¿Qué significa HTML?', opts: ['HyperText Markup Language', 'High Tech Modern Language', 'HyperText Modern Link', 'High Transfer Markup Layer'], a: 0 },
      { q: '¿Cuál etiqueta define un párrafo en HTML?', opts: ['<p>', '<par>', '<para>', '<pg>'], a: 0 },
      { q: 'En CSS, ¿qué propiedad cambia el color de texto?', opts: ['color', 'text-color', 'font-color', 'text-style'], a: 0 },
      { q: '¿Qué devuelve typeof null en JavaScript?', opts: ['"object"', '"null"', '"undefined"', '"string"'], a: 0 },
      { q: '¿Cuál es el resultado de 2 ** 10 en Python?', opts: ['1024', '20', '200', '512'], a: 0 },
      { q: '¿Qué comando de Git guarda cambios en el repositorio local?', opts: ['git commit', 'git push', 'git save', 'git add'], a: 0 },
      { q: 'En CSS Flexbox, ¿qué propiedades centran elementos en ambos ejes?', opts: ['justify-content + align-items', 'text-align + vertical-align', 'margin: auto', 'display: center'], a: 0 },
      { q: '¿Qué es una función en programación?', opts: ['Un bloque reutilizable de código', 'Una variable especial', 'Un tipo de dato', 'Un operador lógico'], a: 0 },
      { q: '¿Cuál de estos es un tipo de dato en Python?', opts: ['list', 'array', 'vector', 'collection'], a: 0 },
      { q: '¿Qué significa SQL?', opts: ['Structured Query Language', 'Simple Query Language', 'System Query Logic', 'Standard Query Link'], a: 0 },
      { q: 'En JavaScript, ¿qué hace console.log()?', opts: ['Imprime en la consola del navegador', 'Guarda datos en disco', 'Crea un archivo de log', 'Envía datos al servidor'], a: 0 },
      { q: '¿Qué es un Array?', opts: ['Una colección ordenada de elementos', 'Un tipo de función', 'Un bucle especial', 'Una clase de objeto'], a: 0 },
      { q: '¿Qué hace el operador === en JavaScript?', opts: ['Compara valor y tipo estrictamente', 'Solo compara valor', 'Asigna valor', 'Compara objetos por referencia'], a: 0 },
      { q: '¿Cuál es el resultado de bool("") en Python?', opts: ['False', 'True', 'None', 'Error'], a: 0 },
      { q: '¿Qué hace git clone?', opts: ['Copia un repositorio remoto a tu máquina', 'Crea una nueva rama', 'Borra el historial de commits', 'Fusiona dos ramas'], a: 0 },
    ],
    battles: [
      { q: '¿Qué hace Array.prototype.map() en JavaScript?', opts: ['Crea un nuevo array transformando cada elemento', 'Filtra elementos según condición', 'Reduce a un solo valor', 'Ordena el array'], a: 0 },
      { q: '¿Cuál es la complejidad O(n²)?', opts: ['El tiempo crece con el cuadrado del input', 'El tiempo es constante', 'El tiempo crece linealmente', 'El tiempo crece logarítmicamente'], a: 0 },
      { q: '¿Qué es una Promise en JavaScript?', opts: ['Objeto que representa una operación asíncrona', 'Tipo de variable global', 'Función que devuelve undefined', 'Clase especial de Array'], a: 0 },
      { q: '¿Qué es una API REST?', opts: ['Interfaz que usa HTTP para intercambiar datos', 'Tipo de base de datos relacional', 'Un lenguaje de programación', 'Protocolo de cifrado'], a: 0 },
    ],
  },

  // ── STORY 2: El Camino del Mago IA ────────────────────────────────────────
  {
    id: 'camino-mago-ia',
    title: 'El Camino del Mago IA',
    subtitle: 'Campaña de Inteligencia Artificial',
    icon: '🤖',
    gradient: 'from-[#a855f7] to-[#3b82f6]',
    accentColor: '#a855f7',
    boardBg: '#08001a',
    boardGlow: '#a855f7',
    description: 'El Caos Algorítmico amenaza el Nexo Digital. Domina los hechizos de la inteligencia artificial para restaurar el orden.',
    intro: [
      '🌌 El Caos Algorítmico ha invadido el Nexo Digital...',
      '🧙 Tú, Mago de la IA, debes dominar las artes del lenguaje.',
      '📜 Responde los enigmas de inteligencia artificial y tecnología.',
      '🏆 El primer Mago en alcanzar la Sabiduría Suprema ganará.',
    ],
    winTitle: '¡Gran Mago de la IA!',
    winText: 'Has dominado el Caos Algorítmico y restaurado el Nexo Digital.',
    flavor: {
      reward:   { icon: '📿', title: 'Grimorio Algorítmico',  body: 'Encuentras un tomo de sabiduría del Nexo. +300 💰 +30 ✨' },
      trap:     { icon: '🌀', title: 'Trampa del Caos',        body: 'El Caos Algorítmico devora parte de tus recursos. −150 💰' },
      safe:     { icon: '🔮', title: 'Oráculo Benevolente',   body: 'El Oráculo te concede un momento de paz y reflexión.' },
      start:    { icon: '✨', title: 'Portal de Origen',       body: 'Cruzas el Portal de Origen. Tu magia se renueva.' },
      question: { icon: '🔮', prefix: 'El Oráculo del Nexo te pregunta:' },
      battle:   { icon: '🌌', prefix: 'El Caos Algorítmico te lanza un reto supremo:' },
    },
    questions: [
      { q: '¿Qué significa IA?', opts: ['Inteligencia Artificial', 'Interfaz Automatizada', 'Inteligencia Algorítmica', 'Acción Inteligente'], a: 0 },
      { q: '¿Qué es un modelo de lenguaje grande (LLM)?', opts: ['Sistema de IA entrenado en texto masivo', 'Un servidor de almacenamiento', 'Un tipo de base de datos', 'Un protocolo de red'], a: 0 },
      { q: '¿Qué es el aprendizaje supervisado?', opts: ['Entrenar un modelo con datos etiquetados', 'Programar reglas manualmente', 'Entrenar sin datos', 'Optimizar sin métricas'], a: 0 },
      { q: '¿Para qué sirve el "prompting" en IA?', opts: ['Dar instrucciones claras a un modelo de lenguaje', 'Programar la IA desde código', 'Entrenar el modelo desde cero', 'Medir la precisión del modelo'], a: 0 },
      { q: '¿Qué es una red neuronal?', opts: ['Sistema de cómputo inspirado en el cerebro humano', 'Tipo de base de datos distribuida', 'Un protocolo de comunicación', 'Un lenguaje de programación'], a: 0 },
      { q: 'En IA, ¿qué significa "overfitting"?', opts: ['El modelo memoriza datos de entrenamiento pero falla en datos nuevos', 'El modelo aprende muy poco', 'El modelo es demasiado rápido', 'El modelo usa demasiada memoria'], a: 0 },
      { q: '¿Qué es Claude?', opts: ['Un asistente de IA de Anthropic', 'Un lenguaje de programación', 'Un sistema operativo', 'Un protocolo de seguridad'], a: 0 },
      { q: '¿Qué significa GPT?', opts: ['Generative Pre-trained Transformer', 'General Processing Technology', 'Graphical Program Transfer', 'Generative Public Training'], a: 0 },
      { q: '¿Qué es el "context window" de un LLM?', opts: ['La cantidad de texto que el modelo procesa a la vez', 'La velocidad de respuesta', 'El número de usuarios activos', 'La memoria de largo plazo del modelo'], a: 0 },
      { q: '¿Qué es el aprendizaje por refuerzo?', opts: ['Entrenar un agente con recompensas y penalizaciones', 'Aprender de datos etiquetados', 'Programar reglas explícitas', 'Copiar comportamiento humano'], a: 0 },
      { q: '¿Qué es una "alucinación" en IA?', opts: ['Cuando el modelo genera información falsa con confianza', 'Cuando el modelo no responde', 'Cuando el modelo es muy lento', 'Cuando el modelo confunde idiomas'], a: 0 },
      { q: '¿Qué hace el fine-tuning?', opts: ['Ajustar un modelo preentrenado para tarea específica', 'Entrenarlo desde cero', 'Borrar el entrenamiento anterior', 'Acelerar la inferencia'], a: 0 },
      { q: '¿Qué es un embedding en IA?', opts: ['Representación numérica de datos en espacio vectorial', 'Un tipo de red neuronal', 'Un método de cifrado', 'Un formato de archivo'], a: 0 },
      { q: '¿Para qué se usa RAG en IA?', opts: ['Combinar recuperación de información con generación de texto', 'Entrenar modelos más rápido', 'Comprimir modelos de IA', 'Visualizar datos de entrenamiento'], a: 0 },
      { q: 'La IA generativa puede crear:', opts: ['Texto, imágenes, código y audio nuevos', 'Solo texto predefinido', 'Solo imágenes existentes', 'Solo código sin errores'], a: 0 },
    ],
    battles: [
      { q: '¿Qué es la "temperatura" en los LLMs?', opts: ['Parámetro que controla la aleatoriedad de las respuestas', 'El consumo energético del modelo', 'La velocidad de entrenamiento', 'El tamaño del vocabulario'], a: 0 },
      { q: '¿Qué es el "Chain of Thought" prompting?', opts: ['Pedir al modelo que razone paso a paso', 'Conectar múltiples modelos', 'Un método de fine-tuning', 'Una arquitectura de red neuronal'], a: 0 },
      { q: '¿Qué diferencia hay entre modelo generativo y discriminativo?', opts: ['El generativo crea datos, el discriminativo los clasifica', 'El generativo es más rápido siempre', 'Son exactamente iguales', 'El discriminativo crea datos'], a: 0 },
      { q: '¿Qué significa RLHF?', opts: ['Reinforcement Learning from Human Feedback', 'Random Learning Hierarchical Framework', 'Recursive Language Hyper Function', 'Real-time Language Human Flow'], a: 0 },
    ],
  },

  // ── STORY 3: La Aventura del Artista Digital ──────────────────────────────
  {
    id: 'aventura-artista',
    title: 'La Aventura del Artista Digital',
    subtitle: 'Campaña de Diseño y Creatividad',
    icon: '🎨',
    gradient: 'from-[#f472b6] to-[#a78bfa]',
    accentColor: '#f472b6',
    boardBg: '#1a0012',
    boardGlow: '#f472b6',
    description: 'El Caos Visual amenaza el mundo del diseño. Restaura la armonía con tu conocimiento creativo.',
    intro: [
      '🌈 El Caos Visual ha corrompido el Mundo del Diseño...',
      '🎨 Tú, Artista Digital, puedes restaurar la armonía.',
      '📐 Responde desafíos de diseño, color y creatividad.',
      '🏆 El primer Artista en alcanzar la Maestría Creativa ganará.',
    ],
    winTitle: '¡Maestro Artista Digital!',
    winText: 'Has restaurado la armonía visual al Mundo del Diseño.',
    flavor: {
      reward:   { icon: '🖼️', title: 'Obra Maestra',           body: 'Encuentras una paleta de colores legendaria. +300 💰 +30 ✨' },
      trap:     { icon: '🌑', title: 'Trampa del Caos Visual',  body: 'El desorden visual destruye parte de tu obra. −150 💰' },
      safe:     { icon: '🌿', title: 'Galería de la Paz',       body: 'Encuentras una galería serena. La inspiración te llena.' },
      start:    { icon: '🏠', title: 'Estudio de Origen',       body: 'Vuelves a tu Estudio de Origen. La creatividad te llama.' },
      question: { icon: '🖌️', prefix: 'El Maestro Artista te pregunta:' },
      battle:   { icon: '🎭', prefix: 'El Caos Visual te lanza un reto supremo:' },
    },
    questions: [
      { q: '¿Cuáles son los colores primarios de luz (RGB)?', opts: ['Rojo, Verde, Azul', 'Rojo, Amarillo, Azul', 'Cian, Magenta, Amarillo', 'Naranja, Verde, Morado'], a: 0 },
      { q: '¿Qué significa UX?', opts: ['User Experience (Experiencia de Usuario)', 'Universal Extension', 'User Exchange', 'Unified Expression'], a: 0 },
      { q: '¿Qué es la tipografía serif?', opts: ['Letras con remates pequeños en los extremos', 'Letras sin remates', 'Letras manuscritas', 'Letras solo decorativas'], a: 0 },
      { q: '¿Cuál es la regla de los tercios en diseño?', opts: ['Dividir la composición en 9 partes para guiar la atención', 'Usar solo 3 colores', 'Dejar 1/3 del espacio vacío', 'Usar 3 fuentes tipográficas'], a: 0 },
      { q: '¿Qué hace el "kerning" en tipografía?', opts: ['Ajusta el espacio entre caracteres individuales', 'Cambia el tamaño de la fuente', 'Cambia el color del texto', 'Define la alineación del texto'], a: 0 },
      { q: '¿Qué es el espacio negativo en diseño?', opts: ['El área vacía alrededor del sujeto principal', 'El color negro de una composición', 'Las sombras de los elementos', 'El color de fondo'], a: 0 },
      { q: '¿Qué significa DPI?', opts: ['Dots Per Inch (Puntos por Pulgada)', 'Design Print Index', 'Digital Pixel Interface', 'Display Pixel Intensity'], a: 0 },
      { q: '¿Cuál es la diferencia entre PNG y JPG?', opts: ['PNG soporta transparencia, JPG no', 'JPG siempre es más grande', 'PNG solo es para fotografías', 'JPG es formato sin pérdida'], a: 0 },
      { q: '¿Qué es un prototipo en UX/UI?', opts: ['Versión interactiva preliminar de un diseño', 'El diseño final aprobado', 'El código fuente de la app', 'Un boceto a mano libre'], a: 0 },
      { q: '¿Qué es la jerarquía visual?', opts: ['Organizar elementos para guiar la atención del usuario', 'Usar solo colores oscuros', 'Colocar el logo siempre arriba', 'Usar solo una fuente tipográfica'], a: 0 },
      { q: '¿Qué hace el formato SVG?', opts: ['Gráficos vectoriales escalables sin pérdida', 'Comprime imágenes JPEG', 'Almacena videos', 'Define estilos CSS'], a: 0 },
      { q: '¿Qué es el contraste en diseño?', opts: ['La diferencia entre elementos para crear distinción visual', 'El brillo de una pantalla', 'La saturación del color', 'El tamaño de los márgenes'], a: 0 },
      { q: 'En diseño web, ¿qué es "mobile first"?', opts: ['Diseñar primero para móviles y luego adaptar a desktop', 'Crear apps solo para móvil', 'Usar colores simples', 'Evitar imágenes pesadas'], a: 0 },
      { q: '¿Qué es el sistema de grillas en diseño?', opts: ['Estructura invisible que organiza y alinea los elementos', 'El color de fondo de la página', 'El tamaño del texto base', 'Los bordes de las imágenes'], a: 0 },
      { q: '¿Cuáles colores son complementarios?', opts: ['Colores opuestos en el círculo cromático (ej: azul y naranja)', 'Colores del mismo tono', 'Colores neutros juntos', 'Colores primarios entre sí'], a: 0 },
    ],
    battles: [
      { q: '¿Cuál es la diferencia entre UI y UX?', opts: ['UI es la interfaz visual, UX es la experiencia completa', 'UI es más importante que UX', 'Son exactamente lo mismo', 'UX es solo para apps móviles'], a: 0 },
      { q: '¿Qué es un "design system"?', opts: ['Conjunto de reglas, componentes y estilos reutilizables', 'Un software de diseño específico', 'Un tipo de fuente tipográfica', 'Un formato de archivo de diseño'], a: 0 },
      { q: '¿Cuál es la diferencia entre vector y raster?', opts: ['Vector usa fórmulas matemáticas (escalable), raster usa píxeles', 'Raster siempre tiene mejor calidad', 'Vector solo se usa en impresión', 'Son formatos equivalentes'], a: 0 },
      { q: '¿Qué es el "affordance" en diseño?', opts: ['La percepción de cómo algo debe usarse por su forma/apariencia', 'El precio del diseño', 'La resolución de pantalla requerida', 'El número de colores usados'], a: 0 },
    ],
  },
]

export function getStoryById(id) {
  return ROL_STORIES.find((s) => s.id === id) ?? ROL_STORIES[0]
}

export function pickStoryQuestion(storyId) {
  const story = getStoryById(storyId)
  const list  = story.questions
  return list[Math.floor(Math.random() * list.length)]
}

export function pickStoryBattle(storyId) {
  const story = getStoryById(storyId)
  const list  = story.battles
  return list[Math.floor(Math.random() * list.length)]
}
