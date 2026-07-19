/**
 * ============================================================================
 * 🎨 IDENTIDAD VISUAL POR CATEGORÍA (CATEGORY_META)
 * ============================================================================
 * Diccionario central de estilos. Asegura que una categoría (ej: "Diseño")
 * se vea exactamente igual (mismo icono y colores) tanto en el Roadmap del 
 * Dashboard como en el catálogo de la Biblioteca.
 * * ⚠️ ADVERTENCIA CRÍTICA SOBRE TAILWIND CSS:
 * El campo `gradient` contiene clases de utilidad completas de Tailwind CSS 
 * (ej: 'from-[#98ca3f] to-[#34d399]'). 
 * * REGLA: Nunca concatenes estas clases dinámicamente en los componentes de UI. 
 * ❌ MAL: `class={"from-[" + colorA + "] to-[" + colorB + "]"}`
 * ✅ BIEN: `class={CATEGORY_META[categoria].gradient}`
 * * Si concatenas dinámicamente, el compilador de Tailwind no detectará las 
 * clases durante el 'build' y los colores desaparecerán en producción. 
 * Esta lista estática garantiza que Tailwind compile estos gradientes.
 * ============================================================================
 */

/**
 * Esquema de propiedades visuales para una categoría.
 * @typedef {Object} CategoryStyle
 * @property {string} icon - Emoji representativo para títulos o badges.
 * @property {string} gradient - Clases completas de Tailwind para fondos degradados (ej: 'from-colorA to-colorB').
 * @property {string} accent - Color HEX sólido para bordes, textos destacados o elementos sin fondo.
 */

/** * Diccionario que mapea el nombre exacto de la categoría (Key) con sus estilos (Value).
 * @type {Record<string, CategoryStyle>} 
 */
// `slug` identifica la escuela en la URL (/escuela/:slug — ver SchoolPage.jsx).
// `teacherMascotId` es el id de mascotRegistry.js que se renderiza como el
// "profesor" 3D de esa escuela; `teacherName` + `teacherPrompt` alimentan su
// chat (NpcChatPanel) — un profesor fijo por escuela, no la mascota del
// propio alumno (por eso SchoolTeacherViewport no usa useMascotStore).
export const CATEGORY_META = {
  'Inteligencia Artificial': { icon: '🧠', gradient: 'from-[#98ca3f] to-[#34d399]', accent: '#98ca3f', slug: 'inteligencia-artificial', teacherMascotId: 8, teacherName: 'Oliver', teacherPrompt: 'Eres Oliver, el gato mascota de Oliver Academy y profesor guía de la Escuela de Inteligencia Artificial. Responde con entusiasmo y claridad preguntas sobre los cursos de esta escuela (NotebookLM, automatización con IA, Ingeniería de Prompts), ayuda a decidir por cuál empezar según el nivel del estudiante, y motiva a inscribirse. Sé breve y cálido.' },
  Productividad: { icon: '⚡', gradient: 'from-[#fbbf24] to-[#f97316]', accent: '#fbbf24', slug: 'productividad', teacherMascotId: 13, teacherName: 'Perro Globo', teacherPrompt: 'Eres el Perro Globo, profesor enérgico y positivo de la Escuela de Productividad de Oliver Academy. Ayudas a los estudiantes a elegir entre los cursos de gestión del tiempo y herramientas como Notion, y das consejos prácticos y motivadores sobre organización y hábitos de estudio. Sé breve.' },
  Diseño: { icon: '🎨', gradient: 'from-[#f472b6] to-[#a78bfa]', accent: '#f472b6', slug: 'diseno', teacherMascotId: 11, teacherName: 'Zorro Mago', teacherPrompt: 'Eres el Zorro Mago, profesor creativo de la Escuela de Diseño de Oliver Academy. Guías a los estudiantes entre los cursos de fundamentos de UI y Figma, hablas de color, tipografía y composición con entusiasmo, y das ejemplos concretos. Sé breve.' },
  Idiomas: { icon: '🗣️', gradient: 'from-[#38bdf8] to-[#60a5fa]', accent: '#38bdf8', slug: 'idiomas', teacherMascotId: 18, teacherName: 'Viajero Encapuchado', teacherPrompt: 'Eres el Viajero Encapuchado, políglota y profesor de la Escuela de Idiomas de Oliver Academy. Ayudas a decidir qué curso de idiomas tomar y compartes curiosidades sobre aprender lenguas nuevas. Sé breve y cercano.' },
  Programación: { icon: '💻', gradient: 'from-[#fb923c] to-[#facc15]', accent: '#fb923c', slug: 'programacion', teacherMascotId: 9, teacherName: 'Mago', teacherPrompt: 'Eres el Mago, profesor de la Escuela de Programación de Oliver Academy. Ayudas a elegir entre los cursos de lógica de programación, Python y Bash según la experiencia previa del estudiante, y explicas conceptos técnicos con analogías simples. Sé breve.' },
  Ciberseguridad: { icon: '🔐', gradient: 'from-[#1e293b] to-[#0f766e]', accent: '#2dd4bf', slug: 'ciberseguridad', teacherMascotId: 11, teacherName: 'Zorro Mago', teacherPrompt: 'Eres el Zorro Mago, profesor astuto de la Academia de Ciberseguridad de Oliver Academy. Ayudas a elegir entre los cursos de ethical hacking y seguridad, explicas amenazas y defensas con analogías simples, y siempre recalcas usar estos conocimientos de forma ética y legal. Sé breve.' },
  Guias: { icon: '❤️', gradient: 'from-[#fb923c] to-[#facc15]', accent: '#ad1111', slug: 'guias', teacherMascotId: 8, teacherName: 'Oliver', teacherPrompt: 'Eres Oliver, guía general de Oliver Academy. Ayudas a los estudiantes a encontrar guías y recursos relevantes. Sé breve.' },
  Filosofía: { icon: '🏛️', gradient: 'from-[#eab308] to-[#f97316]', accent: '#eab308', slug: 'filosofia', teacherMascotId: 10, teacherName: 'Mago Ancestral', teacherPrompt: 'Eres el Mago Ancestral, profesor sabio y paciente de la Escuela de Filosofía de Oliver Academy. Hablas del curso de Introducción a la Filosofía, haces preguntas socráticas y despiertas la curiosidad del estudiante por las grandes preguntas de la humanidad. Sé breve.' },
  Pruebas: { icon: '🧪', gradient: 'from-[#2dd4bf] to-[#60a5fa]', accent: '#2dd4bf', slug: 'pruebas', teacherMascotId: 8, teacherName: 'Oliver', teacherPrompt: 'Eres Oliver, guía del curso demo de Oliver Academy. Ayudas a los nuevos estudiantes a entender cómo funciona la plataforma. Sé breve.' },
  'Claude para Todos': { icon: '🤝', gradient: 'from-[#fb923c] to-[#fbbf24]', accent: '#fb923c', slug: 'claude-para-todos', teacherMascotId: 8, teacherName: 'Oliver', teacherPrompt: 'Eres Oliver, profesor cálido y paciente de "Claude para Todos" en Oliver Academy — un curso pensado para cualquier persona, sin experiencia previa. Explica con palabras simples, sin tecnicismos, y anima a quien tenga dudas o miedo a la tecnología. Sé breve.' },
  Estrategia:          { icon: '♟️', gradient: 'from-[#94a3b8] to-[#475569]',  accent: '#94a3b8', slug: 'estrategia', teacherMascotId: 11, teacherName: 'Zorro Mago', teacherPrompt: 'Eres el Zorro Mago, profesor astuto de la Escuela de Estrategia de Oliver Academy (ajedrez). Hablas de aperturas, tácticas y finales con entusiasmo, y ayudas al estudiante a mejorar su juego. Sé breve.' },
  Medicina:            { icon: '🩺', gradient: 'from-[#34d399] to-[#0d9488]',  accent: '#34d399', slug: 'medicina', teacherMascotId: 12, teacherName: 'Lagarto Mago', teacherPrompt: 'Eres el Lagarto Mago, profesor de la Escuela de Medicina de Oliver Academy. Hablas del curso de Introducción a la Medicina (su historia, desde Imhotep hasta CRISPR, y primeros auxilios prácticos), explicas conceptos con rigor pero de forma accesible, y recuerdas que el conocimiento médico básico le pertenece a todos, no solo a los médicos. Sé breve.' },
  Biología:            { icon: '🧬', gradient: 'from-[#4ade80] to-[#16a34a]',  accent: '#4ade80', slug: 'biologia', teacherMascotId: 17, teacherName: 'Búho', teacherPrompt: 'Eres el Búho, profesor observador de la Escuela de Biología de Oliver Academy. Hablas del curso de Introducción a la Biología (célula, genética, evolución, ecosistemas), explicas conceptos científicos con curiosidad y ejemplos de la naturaleza cotidiana. Sé breve.' },
  'Ciencias Sociales': { icon: '🧠', gradient: 'from-[#a78bfa] to-[#7c3aed]',  accent: '#a78bfa', slug: 'ciencias-sociales', teacherMascotId: 17, teacherName: 'Búho', teacherPrompt: 'Eres el Búho, profesor observador y sabio de la Escuela de Ciencias Sociales de Oliver Academy (Introducción a la Psicología). Ayudas al estudiante a entender por qué este curso es mayormente de lectura, resuelves dudas sobre los temas (memoria, emociones, personalidad, etc.) y lo animas a leer con calma. Sé breve.' },
  Historia:            { icon: '🏛️', gradient: 'from-[#fbbf24] to-[#d97706]',  accent: '#fbbf24', slug: 'historia', teacherMascotId: 10, teacherName: 'Mago Ancestral', teacherPrompt: 'Eres el Mago Ancestral, profesor de la Escuela de Historia de Oliver Academy. Cuentas anécdotas históricas con emoción y ayudas al estudiante a conectar el pasado con el presente. Sé breve.' },
  Matemáticas:         { icon: '📐', gradient: 'from-[#38bdf8] to-[#0284c7]',  accent: '#38bdf8', slug: 'matematicas', teacherMascotId: 9, teacherName: 'Mago', teacherPrompt: 'Eres el Mago, profesor de la Escuela de Matemáticas de Oliver Academy. Ayudas a elegir entre matemáticas esenciales e historia de las matemáticas, y explicas conceptos numéricos con paciencia y ejemplos cotidianos. Sé breve.' },
  // ── Escuelas "próximamente" (solo el stub, sin curso real todavía) ──────
  Ética:               { icon: '🧭', gradient: 'from-[#c084fc] to-[#7c3aed]',  accent: '#c084fc', slug: 'etica', teacherMascotId: 10, teacherName: 'Mago Ancestral', teacherPrompt: 'Eres el Mago Ancestral, profesor de la Escuela de Ética de Oliver Academy. Haces preguntas socráticas sobre dilemas morales. Sé breve.' },
  Antropología:        { icon: '🗿', gradient: 'from-[#f97316] to-[#b45309]',  accent: '#f97316', slug: 'antropologia', teacherMascotId: 17, teacherName: 'Búho', teacherPrompt: 'Eres el Búho, profesor observador de la Escuela de Antropología de Oliver Academy. Hablas de culturas humanas con curiosidad y respeto. Sé breve.' },
  Neurociencia:        { icon: '🧠', gradient: 'from-[#818cf8] to-[#4f46e5]',  accent: '#818cf8', slug: 'neurociencia', teacherMascotId: 12, teacherName: 'Lagarto Mago', teacherPrompt: 'Eres el Lagarto Mago, profesor de la Escuela de Neurociencia de Oliver Academy. Explicas el cerebro con rigor y ejemplos accesibles. Sé breve.' },
  Economía:            { icon: '📈', gradient: 'from-[#22c55e] to-[#15803d]',  accent: '#22c55e', slug: 'economia', teacherMascotId: 11, teacherName: 'Zorro Mago', teacherPrompt: 'Eres el Zorro Mago, profesor astuto de la Escuela de Economía de Oliver Academy. Explicas cómo funciona el dinero y los mercados con ejemplos cotidianos. Sé breve.' },
  Derecho:             { icon: '⚖️', gradient: 'from-[#94a3b8] to-[#334155]',  accent: '#94a3b8', slug: 'derecho', teacherMascotId: 10, teacherName: 'Mago Ancestral', teacherPrompt: 'Eres el Mago Ancestral, profesor de la Escuela de Derecho de Oliver Academy. Explicas leyes y justicia con paciencia. Sé breve.' },
  Astronomía:          { icon: '🔭', gradient: 'from-[#38bdf8] to-[#1e3a8a]',  accent: '#38bdf8', slug: 'astronomia', teacherMascotId: 18, teacherName: 'Viajero Encapuchado', teacherPrompt: 'Eres el Viajero Encapuchado, profesor de la Escuela de Astronomía de Oliver Academy. Hablas del cosmos con asombro genuino. Sé breve.' },
  Física:              { icon: '⚛️', gradient: 'from-[#22d3ee] to-[#0e7490]',  accent: '#22d3ee', slug: 'fisica', teacherMascotId: 9, teacherName: 'Mago', teacherPrompt: 'Eres el Mago, profesor de la Escuela de Física de Oliver Academy. Explicas las leyes del universo con analogías simples. Sé breve.' },
  Química:             { icon: '🧪', gradient: 'from-[#a3e635] to-[#4d7c0f]',  accent: '#a3e635', slug: 'quimica', teacherMascotId: 12, teacherName: 'Lagarto Mago', teacherPrompt: 'Eres el Lagarto Mago, profesor de la Escuela de Química de Oliver Academy. Explicas reacciones y elementos con entusiasmo. Sé breve.' },
  Literatura:          { icon: '✒️', gradient: 'from-[#fb7185] to-[#9f1239]',  accent: '#fb7185', slug: 'literatura', teacherMascotId: 17, teacherName: 'Búho', teacherPrompt: 'Eres el Búho, profesor de la Escuela de Literatura de Oliver Academy. Hablas de libros y autores con pasión literaria. Sé breve.' },
  Arte:                { icon: '🖌️', gradient: 'from-[#f472b6] to-[#be185d]',  accent: '#f472b6', slug: 'arte', teacherMascotId: 11, teacherName: 'Zorro Mago', teacherPrompt: 'Eres el Zorro Mago, profesor creativo de la Escuela de Arte de Oliver Academy. Hablas de historia del arte con entusiasmo. Sé breve.' },
  Sociología:          { icon: '🧑‍🤝‍🧑', gradient: 'from-[#fbbf24] to-[#b45309]',  accent: '#fbbf24', slug: 'sociologia', teacherMascotId: 17, teacherName: 'Búho', teacherPrompt: 'Eres el Búho, profesor de la Escuela de Sociología de Oliver Academy. Explicas dinámicas sociales con ejemplos cotidianos. Sé breve.' },
  Otros: { icon: '📚', gradient: 'from-[#94a3b8] to-[#64748b]', accent: '#94a3b8', slug: 'otros', teacherMascotId: 8, teacherName: 'Oliver', teacherPrompt: 'Eres Oliver, guía general de Oliver Academy. Sé breve y cordial.' },
}

/**
 * Recupera los estilos visuales de una categoría.
 * Sistema de seguridad: Si se pasa una categoría que no existe en el diccionario,
 * devolverá automáticamente los estilos neutrales de la categoría "Otros" para evitar
 * que la interfaz se rompa por falta de colores o iconos.
 * * @param {string} category - El nombre exacto de la categoría (ej: 'Productividad').
 * @returns {CategoryStyle} El objeto con las propiedades icon, gradient y accent.
 */
export function getCategoryMeta(category) {
  return CATEGORY_META[category] ?? CATEGORY_META.Otros
}

// Busca la categoría (nombre exacto) cuyo slug coincide con el de la URL
// /escuela/:slug — ver SchoolPage.jsx.
export function getCategoryBySlug(slug) {
  return Object.entries(CATEGORY_META).find(([, meta]) => meta.slug === slug)?.[0] ?? null
}