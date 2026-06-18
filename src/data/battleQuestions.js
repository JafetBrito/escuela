// ponytail: static question bank; replace with AI-generated questions when needed
// correct is the index (0-3) of the right answer in options[]
export const BATTLE_QUESTIONS = [
  // ── Programación ──────────────────────────────────────────────────────────
  {
    id: 'q1', category: 'programming',
    text: '¿Qué es una variable en programación?',
    options: ['Un tipo de bucle', 'Un espacio en memoria para guardar datos', 'Una función especial', 'Un error de código'],
    correct: 1,
  },
  {
    id: 'q2', category: 'programming',
    text: '¿Qué hace un bucle "for"?',
    options: ['Detiene el programa', 'Define una función', 'Repite código un número determinado de veces', 'Borra datos'],
    correct: 2,
  },
  {
    id: 'q3', category: 'programming',
    text: '¿Qué es un "bug" en programación?',
    options: ['Una función especial', 'Un tipo de datos avanzado', 'Un error en el código', 'Un comentario oculto'],
    correct: 2,
  },
  {
    id: 'q4', category: 'programming',
    text: '¿Qué es una función en programación?',
    options: ['Un bucle infinito', 'Un bloque de código reutilizable', 'Una variable especial', 'Un archivo de configuración'],
    correct: 1,
  },
  {
    id: 'q5', category: 'programming',
    text: '¿Qué comando de git guarda un punto en el historial?',
    options: ['git push', 'git save', 'git commit', 'git backup'],
    correct: 2,
  },
  {
    id: 'q6', category: 'programming',
    text: '¿Qué significa HTML?',
    options: ['High Text Markup Language', 'HyperText Markup Language', 'HyperText Modern Language', 'High Tech Meta Language'],
    correct: 1,
  },
  {
    id: 'q7', category: 'programming',
    text: '¿Cuál de estos NO es un tipo de dato primitivo en la mayoría de lenguajes?',
    options: ['Entero (int)', 'Cadena (string)', 'Lista (array)', 'Booleano (bool)'],
    correct: 2,
  },
  {
    id: 'q8', category: 'programming',
    text: '¿Qué hace el operador "==" en la mayoría de lenguajes?',
    options: ['Asigna un valor', 'Compara si dos valores son iguales', 'Suma dos números', 'Define una función'],
    correct: 1,
  },

  // ── Ciberseguridad ────────────────────────────────────────────────────────
  {
    id: 'q9', category: 'cyber',
    text: '¿Qué significa "IP" en "dirección IP"?',
    options: ['Information Processing', 'Internet Protocol', 'Input Port', 'Index Page'],
    correct: 1,
  },
  {
    id: 'q10', category: 'cyber',
    text: '¿Qué es un "firewall"?',
    options: ['Un tipo de virus', 'Un sistema que controla el tráfico de red', 'Un lenguaje de programación', 'Un disco duro especial'],
    correct: 1,
  },
  {
    id: 'q11', category: 'cyber',
    text: '¿Qué es el "phishing"?',
    options: ['Un protocolo de red', 'Un ataque que engaña al usuario para robar datos', 'Un tipo de cifrado', 'Una herramienta de análisis'],
    correct: 1,
  },
  {
    id: 'q12', category: 'cyber',
    text: '¿Qué protocolo usa HTTPS que HTTP no tiene?',
    options: ['Mayor velocidad', 'Cifrado SSL/TLS', 'Más ancho de banda', 'Compresión de datos'],
    correct: 1,
  },

  // ── Inteligencia Artificial ───────────────────────────────────────────────
  {
    id: 'q13', category: 'ai',
    text: '¿Qué es el aprendizaje automático (Machine Learning)?',
    options: ['Enseñar a humanos con computadoras', 'Que las máquinas aprendan patrones de datos', 'Programar robots físicos', 'Guardar datos en la nube'],
    correct: 1,
  },
  {
    id: 'q14', category: 'ai',
    text: '¿Qué es el "overfitting" en IA?',
    options: ['El modelo aprende demasiado los datos de entrenamiento y falla con datos nuevos', 'El modelo no aprende nada', 'El servidor se satura', 'El código tiene errores de sintaxis'],
    correct: 0,
  },
  {
    id: 'q15', category: 'ai',
    text: '¿Qué es un "dataset"?',
    options: ['Un programa de IA', 'Un conjunto de datos para entrenar modelos', 'Un tipo de red neuronal', 'Un lenguaje para IA'],
    correct: 1,
  },
  {
    id: 'q16', category: 'ai',
    text: '¿Qué hace un modelo de lenguaje grande (LLM)?',
    options: ['Traduce código a binario', 'Genera texto prediciendo la siguiente palabra', 'Controla robots', 'Analiza imágenes en tiempo real'],
    correct: 1,
  },

  // ── Diseño / General ─────────────────────────────────────────────────────
  {
    id: 'q17', category: 'design',
    text: '¿Qué significa "UX" en diseño?',
    options: ['Unix eXpansion', 'User eXperience (Experiencia de usuario)', 'Ultra eXtreme', 'Unique eXport'],
    correct: 1,
  },
  {
    id: 'q18', category: 'design',
    text: '¿Qué es un "wireframe"?',
    options: ['Un tipo de cable de red', 'Un boceto básico de una interfaz', 'Un lenguaje de programación visual', 'Un framework de backend'],
    correct: 1,
  },
  {
    id: 'q19', category: 'design',
    text: '¿Qué es la accesibilidad web?',
    options: ['Hacer sitios web más rápidos', 'Hacer sitios visualmente espectaculares', 'Permitir que personas con discapacidades usen la web', 'Optimizar solo para móviles'],
    correct: 2,
  },
  {
    id: 'q20', category: 'design',
    text: '¿Qué es el "responsive design"?',
    options: ['Diseño que responde a clics del usuario', 'Diseño que se adapta a diferentes tamaños de pantalla', 'Un framework de animaciones', 'Un estilo visual minimalista'],
    correct: 1,
  },

  // ── Lógica / Filosofía ────────────────────────────────────────────────────
  {
    id: 'q21', category: 'philosophy',
    text: '¿Qué es un argumento válido en lógica formal?',
    options: ['Uno que siempre es verdadero', 'Uno donde si las premisas son verdaderas, la conclusión también lo es', 'Uno que es popular', 'Uno que usa muchas palabras técnicas'],
    correct: 1,
  },
  {
    id: 'q22', category: 'philosophy',
    text: '¿Qué es una "paradoja"?',
    options: ['Un tipo de algoritmo', 'Una contradicción aparente que desafía la intuición', 'Un error de razonamiento simple', 'Un dato estadístico extraño'],
    correct: 1,
  },
  {
    id: 'q23', category: 'general',
    text: '¿Qué significa "API"?',
    options: ['Application Programming Interface', 'Automatic Process Integration', 'Advanced Protocol Interface', 'Application Protocol Internet'],
    correct: 0,
  },
  {
    id: 'q24', category: 'general',
    text: '¿Qué es el "frontend" en desarrollo web?',
    options: ['La parte del servidor que procesa datos', 'La base de datos principal', 'La parte visual que ve y usa el usuario', 'El sistema de autenticación'],
    correct: 2,
  },
  {
    id: 'q25', category: 'general',
    text: '¿Cuántos bits tiene un byte?',
    options: ['4', '16', '8', '32'],
    correct: 2,
  },
]

const QUESTIONS_BY_CATEGORY = {}
BATTLE_QUESTIONS.forEach(q => {
  ;(QUESTIONS_BY_CATEGORY[q.category] ??= []).push(q)
})

export function getRandomQuestion(category) {
  const pool = category && QUESTIONS_BY_CATEGORY[category]
    ? [...(QUESTIONS_BY_CATEGORY[category] ?? []), ...(QUESTIONS_BY_CATEGORY.general ?? [])]
    : BATTLE_QUESTIONS
  return pool[Math.floor(Math.random() * pool.length)]
}
