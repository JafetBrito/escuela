// URLs traducidas. Internamente TODA la app (rutas, <Link>, navigate) sigue
// usando las rutas canónicas en español — la barra del navegador es lo único que
// se traduce (ver LocalizedRouter.jsx): en inglés /mascota se ve como /pet.
// Para sumar un idioma: agregar su diccionario abajo (español → idioma). Los
// idiomas sin diccionario conservan las URLs en español.
//
// Solo se traducen palabras de ruta fijas; los segmentos dinámicos (ids, slugs
// de curso, códigos) nunca se tocan. Cada valor debe ser único dentro de su
// idioma, para que la vuelta a español (toCanonical) no sea ambigua.
const TOP = {
  en: {
    'academia-china': 'china-academy',
    'academia-filosofia': 'philosophy-academy',
    'academia-ia': 'ai-academy',
    'academia-idiomas': 'languages-academy',
    'academia-medicina': 'medicine-academy',
    academias: 'academies',
    ajustes: 'settings',
    amigos: 'friends',
    anuncios: 'announcements',
    arbol: 'tree',
    biblioteca: 'library',
    buscar: 'search',
    buzon: 'mailbox',
    cerebro: 'brain',
    'clase-online': 'online-class',
    'clases-disponibles': 'available-classes',
    'crear-cuenta': 'create-account',
    'escuela-categoria': 'school-category',
    escuela: 'school',
    estanteria: 'bookshelf',
    examenes: 'exams',
    foro: 'forum',
    guias: 'guides',
    herramientas: 'tools',
    horario: 'schedule',
    logros: 'achievements',
    mascota: 'pet',
    'mis-clases': 'my-classes',
    'mis-tareas': 'my-tasks',
    misiones: 'quests',
    mundo: 'world',
    notas: 'notes',
    oraculo: 'oracle',
    privacidad: 'privacy',
    profesor: 'teacher',
    progreso: 'progress',
    proyectos: 'projects',
    reclutador: 'recruiter',
    'salon-de-la-fama-hacker': 'hacker-hall-of-fame',
    rol: 'roleplay',
    semana: 'week',
    terminos: 'terms',
    tienda: 'shop',
    tutoriales: 'tutorials',
    'vr-templo': 'vr-temple',
  },
}

// Palabras de rutas anidadas (/learn/:id/clase/:mod, /profesor/perfil, /vr/salon…).
const SUB = {
  en: {
    clase: 'lesson',
    resumen: 'summary',
    reflexiones: 'reflections',
    perfil: 'profile',
    academia: 'academy',
    clases: 'classes',
    anfiteatro: 'amphitheater',
    'cueva-platon': 'plato-cave',
    cumpleanos: 'birthday',
    pruebas: 'tests',
    sala: 'watch-room',
    salon: 'classroom',
    alumnos: 'students',
    comandos: 'commands',
    correos: 'emails',
    cursos: 'courses',
    ia: 'ai',
    oraculo: 'oracle',
    'perfiles-edad': 'age-profiles',
    profesores: 'teachers',
    reclutadores: 'recruiters',
    tareas: 'tasks',
    proyectos: 'projects',
    examenes: 'exams',
    tutoriales: 'tutorials',
    podcasts: 'podcasts',
  },
}

const invert = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]))
// localizado (de cualquier idioma) → español
const TOP_BACK = Object.assign({}, ...Object.values(TOP).map(invert))
const SUB_BACK = Object.assign({}, ...Object.values(SUB).map(invert))

const mapPath = (pathname, top, sub) =>
  pathname
    .split('/')
    .map((seg, i) => (i === 1 ? (top[seg] ?? seg) : i > 1 ? (sub[seg] ?? seg) : seg))
    .join('/')

// Cualquier URL (española o localizada) → ruta canónica en español.
export const toCanonical = (pathname) => mapPath(pathname, TOP_BACK, SUB_BACK)

// Ruta canónica → cómo se muestra en el idioma `lang`.
export function toLocalized(pathname, lang) {
  if (!TOP[lang]) return pathname
  return mapPath(pathname, TOP[lang], SUB[lang])
}
