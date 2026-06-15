// "Logros": medals earned by fully completing a course, plus a static
// catalog of achievements across the whole app, organized by category.
// "Proezas de la fuerza" (category `secretos`) are hidden/secret achievements
// (World of Warcraft-style) — shown as "???" until unlocked.

export const ACHIEVEMENT_CATEGORIES = [
  { id: 'progreso', label: 'Progreso académico', icon: '🎓' },
  { id: 'exploracion', label: 'Exploración', icon: '🧭' },
  { id: 'coleccion', label: 'Colección', icon: '🎒' },
  { id: 'social', label: 'Mascota & Chat', icon: '💬' },
  { id: 'economia', label: 'Economía', icon: '💰' },
  { id: 'secretos', label: 'Proezas de la fuerza', icon: '⚔️', secret: true },
]

export function getCourseAchievement(course) {
  return {
    id: `course-${course.courseId}`,
    category: 'progreso',
    name: `Medalla: ${course.title}`,
    icon: '🏅',
    description: `Completaste todos los módulos de "${course.title}".`,
  }
}

export function isCourseCompleted(course, moduleProgress) {
  return course.modules.every((m) =>
    moduleProgress.some((p) => p.moduleId === m.id && p.completed),
  )
}

// Static catalog. `check(state)` receives the snapshot built by
// useAchievementsStore's checker and returns true once the achievement is
// earned. Includes a handful of very easy ones for quick testing.
export const STATIC_ACHIEVEMENTS = [
  // --- Progreso académico ---
  {
    id: 'first-module',
    category: 'progreso',
    name: 'Primer paso',
    icon: '📘',
    description: 'Completa tu primer módulo de cualquier curso.',
    check: (s) => s.completedModules >= 1,
  },
  {
    id: 'five-modules',
    category: 'progreso',
    name: 'Constante',
    icon: '📗',
    description: 'Completa 5 módulos en total.',
    check: (s) => s.completedModules >= 5,
  },
  {
    id: 'ten-modules',
    category: 'progreso',
    name: 'Dedicado',
    icon: '📙',
    description: 'Completa 10 módulos en total.',
    check: (s) => s.completedModules >= 10,
  },
  {
    id: 'all-courses',
    category: 'progreso',
    name: 'Maestro de Oliver School',
    icon: '👑',
    description: 'Completa todos los cursos disponibles.',
    check: (s) => s.totalCourses > 0 && s.completedCourses >= s.totalCourses,
  },

  // --- Exploración ---
  {
    id: 'first-book',
    category: 'exploracion',
    name: 'Ratón de biblioteca',
    icon: '📖',
    description: 'Abre tu primer libro en la Librería.',
    check: (s) => s.booksOpened >= 1,
  },
  {
    id: 'three-books',
    category: 'exploracion',
    name: 'Bibliotecario',
    icon: '📚',
    description: 'Abre 3 libros distintos en la Librería.',
    check: (s) => s.booksOpened >= 3,
  },
  {
    id: 'skin-changer',
    category: 'exploracion',
    name: 'Nuevo look',
    icon: '🎨',
    description: 'Cambia la apariencia de tu mascota.',
    check: (s) => s.selectedSkinId !== 'default',
  },
  {
    id: 'first-mission',
    category: 'exploracion',
    name: 'Aventurero',
    icon: '🗒️',
    description: 'Reclama la recompensa de tu primera misión general.',
    check: (s) => s.globalMissionsClaimed >= 1,
  },
  {
    id: 'three-missions',
    category: 'exploracion',
    name: 'Cazador de misiones',
    icon: '📜',
    description: 'Reclama la recompensa de 3 misiones generales.',
    check: (s) => s.globalMissionsClaimed >= 3,
  },

  // --- Colección ---
  {
    id: 'first-note',
    category: 'coleccion',
    name: 'Primeras palabras',
    icon: '📝',
    description: 'Guarda tu primera nota o enlace.',
    check: (s) => s.inventoryCount >= 1,
  },
  {
    id: 'five-notes',
    category: 'coleccion',
    name: 'Archivista',
    icon: '🗂️',
    description: 'Guarda 5 notas o enlaces.',
    check: (s) => s.inventoryCount >= 5,
  },
  {
    id: 'first-item',
    category: 'coleccion',
    name: 'Primer botín',
    icon: '🎁',
    description: 'Consigue tu primer objeto coleccionable.',
    check: (s) => s.collectionCount >= 1,
  },
  {
    id: 'collector',
    category: 'coleccion',
    name: 'Coleccionista',
    icon: '🎒',
    description: 'Consigue 3 objetos coleccionables.',
    check: (s) => s.collectionCount >= 3,
  },
  {
    id: 'master-collector',
    category: 'coleccion',
    name: 'Coleccionista experto',
    icon: '🏆',
    description: 'Consigue 6 objetos coleccionables.',
    check: (s) => s.collectionCount >= 6,
  },
  {
    id: 'first-photo',
    category: 'coleccion',
    name: 'Fotógrafo',
    icon: '📸',
    description: 'Toma tu primera foto con la Cámara.',
    check: (s) => s.galleryCount >= 1,
  },
  {
    id: 'gallery-full',
    category: 'coleccion',
    name: 'Galería llena',
    icon: '🖼️',
    description: 'Acumula 5 fotos en tu Galería.',
    check: (s) => s.galleryCount >= 5,
  },

  // --- Mascota & Chat ---
  {
    id: 'first-chat',
    category: 'social',
    name: 'Rompe el hielo',
    icon: '💬',
    description: 'Envía tu primer mensaje a tu mascota.',
    check: (s) => s.totalChatMessages >= 1,
  },
  {
    id: 'chatterbox',
    category: 'social',
    name: 'Conversador',
    icon: '🗨️',
    description: 'Acumula 50 mensajes con tu mascota.',
    check: (s) => s.totalChatMessages >= 50,
  },
  {
    id: 'best-friend',
    category: 'social',
    name: 'Mejores amigos',
    icon: '🐾',
    description: 'Acumula 200 mensajes con tu mascota.',
    check: (s) => s.totalChatMessages >= 200,
  },

  // --- Economía ---
  {
    id: 'first-coin',
    category: 'economia',
    name: 'Primera moneda',
    icon: '🪙',
    description: 'Ten al menos 1 moneda de cobre.',
    check: (s) => s.coins >= 1,
  },
  {
    id: 'rich',
    category: 'economia',
    name: 'Bolsillos llenos',
    icon: '💰',
    description: 'Acumula 10,000 de cobre.',
    check: (s) => s.coins >= 10000,
  },
  {
    id: 'super-rich',
    category: 'economia',
    name: 'Magnate',
    icon: '🤑',
    description: 'Acumula 50,000 de cobre.',
    check: (s) => s.coins >= 50000,
  },
  {
    id: 'first-purchase',
    category: 'economia',
    name: 'Primera compra',
    icon: '🛒',
    description: 'Compra tu primer objeto en la Tienda.',
    check: (s) => s.purchasedCount >= 1,
  },
  {
    id: 'shopaholic',
    category: 'economia',
    name: 'Comprador compulsivo',
    icon: '🛍️',
    description: 'Compra 5 objetos en la Tienda.',
    check: (s) => s.purchasedCount >= 5,
  },
  {
    id: 'level-5',
    category: 'economia',
    name: 'Nivel 5',
    icon: '⭐',
    description: 'Alcanza el nivel 5.',
    check: (s) => s.level >= 5,
  },
  {
    id: 'level-10',
    category: 'economia',
    name: 'Nivel 10',
    icon: '🌟',
    description: 'Alcanza el nivel 10.',
    check: (s) => s.level >= 10,
  },
  {
    id: 'level-25',
    category: 'economia',
    name: 'Nivel 25',
    icon: '💫',
    description: 'Alcanza el nivel 25.',
    check: (s) => s.level >= 25,
  },
  {
    id: 'level-max',
    category: 'economia',
    name: 'Nivel máximo',
    icon: '🌌',
    description: 'Alcanza el nivel 90, el máximo posible.',
    check: (s) => s.level >= 90,
  },

  // --- Proezas de la fuerza (secretas) ---
  {
    id: 'night-owl',
    category: 'secretos',
    secret: true,
    name: 'Ave nocturna',
    icon: '🦉',
    description: 'Usaste Oliver School entre la medianoche y las 5am.',
    check: (s) => s.hour >= 0 && s.hour < 5,
  },
  {
    id: 'broke',
    category: 'secretos',
    secret: true,
    name: 'Sin un peso',
    icon: '🪙',
    description: 'Gastaste hasta tu última moneda en la Tienda.',
    check: (s) => s.coins === 0 && s.purchasedCount >= 1,
  },
  {
    id: 'achievement-hunter',
    category: 'secretos',
    secret: true,
    name: 'Cazador de logros',
    icon: '🏅',
    description: 'Desbloqueaste 15 logros.',
    check: (s) => s.unlockedCount >= 15,
  },
  {
    id: 'legend',
    category: 'secretos',
    secret: true,
    name: 'Leyenda de Oliver School',
    icon: '👑',
    description: 'Completaste todos los cursos, llenaste tu galería y tu colección.',
    check: (s) =>
      s.totalCourses > 0 &&
      s.completedCourses >= s.totalCourses &&
      s.galleryCount >= 5 &&
      s.collectionCount >= 6,
  },
  {
    id: 'new-look-veteran',
    category: 'secretos',
    secret: true,
    name: 'Por la Horda... o la Alianza',
    icon: '⚔️',
    description: 'Cambia tu apariencia y alcanza el nivel 10.',
    check: (s) => s.selectedSkinId !== 'default' && s.level >= 10,
  },
  {
    id: 'amigo-de-oliver',
    category: 'secretos',
    secret: true,
    name: 'El puto amor del servidor',
    icon: '❤️',
    description: 'Por ser Amigo de Oliver.',
    check: (s) => s.userEmail === 'wjafte28@gmail.com',
  },
]

// Returns the full catalog (dynamic course medals + static catalog), each
// item carrying a `category` field.
export function getAllAchievements(courses) {
  const courseAchievements = courses.map(getCourseAchievement)
  return [...courseAchievements, ...STATIC_ACHIEVEMENTS]
}
