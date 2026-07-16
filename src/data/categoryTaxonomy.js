// Taxonomía de 5 grandes áreas del conocimiento (+ una 6ta bolsa para cursos
// de plataforma que no son una disciplina académica). Cada subcategoría
// mapea a uno o más valores de `course.category` en courses.json (los
// nombres de "escuela" que ya existían) — así no hay que renombrar ni un
// solo curso existente, solo agrupar. `topics` es solo descriptivo: lo que
// esa subcategoría eventualmente cubrirá, se muestra cuando aún no hay
// cursos reales.
export const MAIN_CATEGORIES = [
  {
    id: 'ciencias-formales',
    title: 'Ciencias Formales',
    icon: '🔢',
    gradient: 'from-[#38bdf8] to-[#6366f1]',
    accent: '#38bdf8',
    subcategories: [
      { name: 'Matemáticas', topics: ['Álgebra', 'Cálculo', 'Geometría', 'Probabilidad y Estadística', 'Topología'], schoolCategories: ['Matemáticas'] },
      { name: 'Ciencias de la Computación', topics: ['Arquitectura de Sistemas', 'Inteligencia Artificial', 'Ciberseguridad', 'Desarrollo de Software', 'Bases de Datos'], schoolCategories: ['Programación', 'Inteligencia Artificial'] },
      { name: 'Lógica', topics: ['Lógica Clásica', 'Lógica Matemática', 'Lógica Computacional'], schoolCategories: ['Lógica'] },
    ],
  },
  {
    id: 'ciencias-naturales',
    title: 'Ciencias Naturales',
    icon: '🌎',
    gradient: 'from-[#4ade80] to-[#0ea5e9]',
    accent: '#4ade80',
    subcategories: [
      { name: 'Física', topics: ['Mecánica Clásica', 'Física Cuántica', 'Termodinámica', 'Astrofísica', 'Óptica'], schoolCategories: ['Física'] },
      { name: 'Química', topics: ['Química Orgánica', 'Química Inorgánica', 'Físico-química', 'Bioquímica'], schoolCategories: ['Química'] },
      { name: 'Biología', topics: ['Genética', 'Biología Celular', 'Ecología', 'Zoología', 'Botánica', 'Microbiología'], schoolCategories: ['Biología'] },
      { name: 'Ciencias de la Tierra y el Espacio', topics: ['Geología', 'Meteorología', 'Oceanografía', 'Astronomía'], schoolCategories: ['Astronomía'] },
    ],
  },
  {
    id: 'ciencias-sociales',
    title: 'Ciencias Sociales',
    icon: '🧑‍🤝‍🧑',
    gradient: 'from-[#a78bfa] to-[#f472b6]',
    accent: '#a78bfa',
    subcategories: [
      { name: 'Psicología', topics: ['Psicología Clínica', 'Psicología Cognitiva', 'Psicología Social', 'Neuropsicología'], schoolCategories: ['Ciencias Sociales', 'Neurociencia'] },
      { name: 'Economía y Negocios', topics: ['Microeconomía', 'Macroeconomía', 'Finanzas', 'Administración', 'Marketing'], schoolCategories: ['Economía'] },
      { name: 'Sociología y Antropología', topics: ['Sociología Urbana', 'Demografía', 'Antropología Cultural', 'Arqueología'], schoolCategories: ['Sociología', 'Antropología'] },
      { name: 'Historia y Geografía', topics: ['Historia Antigua', 'Historia Contemporánea', 'Geografía Humana', 'Geografía Política'], schoolCategories: ['Historia'] },
      { name: 'Ciencias Políticas y Derecho', topics: ['Relaciones Internacionales', 'Teoría Política', 'Derecho Constitucional', 'Derecho Internacional'], schoolCategories: ['Derecho'] },
    ],
  },
  {
    id: 'humanidades-artes',
    title: 'Humanidades y Artes',
    icon: '🎭',
    gradient: 'from-[#eab308] to-[#fb7185]',
    accent: '#eab308',
    subcategories: [
      { name: 'Filosofía', topics: ['Ética', 'Epistemología', 'Lógica Filosófica', 'Estética'], schoolCategories: ['Filosofía', 'Ética'] },
      { name: 'Lenguas y Lingüística', topics: ['Adquisición de Idiomas', 'Fonética', 'Semántica', 'Traducción'], schoolCategories: ['Idiomas'] },
      { name: 'Literatura', topics: ['Literatura Clásica', 'Poesía', 'Narrativa', 'Ensayo'], schoolCategories: ['Literatura'] },
      { name: 'Artes Visuales', topics: ['Dibujo', 'Pintura', 'Escultura', 'Arte Digital y Modelado 3D', 'Fotografía'], schoolCategories: ['Arte'] },
      { name: 'Artes Escénicas y Música', topics: ['Teatro', 'Cinematografía', 'Teoría Musical', 'Composición'], schoolCategories: ['Artes Escénicas y Música'] },
    ],
  },
  {
    id: 'ciencias-aplicadas',
    title: 'Ciencias Aplicadas',
    icon: '🛠️',
    gradient: 'from-[#34d399] to-[#22c55e]',
    accent: '#34d399',
    subcategories: [
      { name: 'Medicina y Ciencias de la Salud', topics: ['Anatomía', 'Pediatría', 'Cirugía', 'Farmacología', 'Nutrición'], schoolCategories: ['Medicina'] },
      { name: 'Ingeniería', topics: ['Ingeniería Civil', 'Ingeniería Mecánica', 'Ingeniería Electrónica', 'Ingeniería en Sistemas Computacionales'], schoolCategories: ['Ingeniería'] },
      { name: 'Educación', topics: ['Pedagogía', 'Diseño Instruccional', 'Tecnología Educativa'], schoolCategories: ['Educación'] },
      { name: 'Agricultura y Veterinaria', topics: ['Agronomía', 'Zootecnia', 'Medicina Veterinaria'], schoolCategories: ['Agricultura y Veterinaria'] },
      { name: 'Comunicación y Medios', topics: ['Periodismo', 'Producción Audiovisual', 'Relaciones Públicas'], schoolCategories: ['Comunicación y Medios'] },
    ],
  },
  {
    id: 'plataforma',
    title: 'Plataforma y Habilidades',
    icon: '⚡',
    gradient: 'from-[#fb923c] to-[#facc15]',
    accent: '#fb923c',
    subcategories: [
      { name: 'Herramientas y hábitos', topics: [], schoolCategories: ['Productividad', 'Diseño', 'Estrategia', 'Claude para Todos', 'Pruebas'] },
    ],
  },
]

export function getMainCategory(id) {
  return MAIN_CATEGORIES.find((m) => m.id === id) ?? null
}
