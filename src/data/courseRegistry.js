import { localizeCourse } from './courseTranslations'
import { useCourseContentStore } from '../stores/useCourseContentStore'

// Capa de compatibilidad: el contenido real vive en Supabase (tabla
// `courses`, ver migration_024.sql + useCourseContentStore.js), pero este
// archivo mantiene los mismos nombres/formas que tenía cuando el contenido
// vivía hardcodeado en los ~19 archivos de src/data/course*.js — así los
// muchos componentes que ya los usan (algunos vía getCourseData/
// hasCourseData, otros leyendo COURSES_DATA[courseId] directo) no necesitan
// cambiar nada. Funciona porque useCourseContentStore.fetchAll() se dispara
// una sola vez al arrancar la app y `ProtectedRoute.jsx` bloquea el render
// de cualquier ruta protegida hasta que resuelve — para cuando cualquiera de
// estos componentes se monta o corre por primera vez, el store ya está
// poblado.
//
// COURSES_DATA sigue siendo el objeto que muchos archivos indexan
// directamente (`COURSES_DATA[courseId]`, `Object.values(COURSES_DATA)`) —
// en vez de exportar un objeto estático (que quedaría congelado-vacío desde
// el momento en que este módulo se evalúa, antes de que el fetch resuelva),
// es un Proxy que reenvía cada lectura al store en el momento exacto en que
// se pide, así que siempre refleja lo último que haya en Supabase sin que
// nadie tenga que suscribirse a nada.
export const COURSES_DATA = new Proxy({}, {
  get(_target, courseId) {
    return useCourseContentStore.getState().courses[courseId]
  },
  has(_target, courseId) {
    return courseId in useCourseContentStore.getState().courses
  },
  ownKeys() {
    return Object.keys(useCourseContentStore.getState().courses)
  },
  getOwnPropertyDescriptor(_target, courseId) {
    const course = useCourseContentStore.getState().courses[courseId]
    if (!course) return undefined
    return { value: course, enumerable: true, configurable: true }
  },
})

export function getCourseData(courseId, lang = 'es') {
  const course = COURSES_DATA[courseId] ?? null
  if (!course) return null
  return lang === 'es' ? course : localizeCourse(course, lang)
}

// Antes de la migración, los cursos bloqueados/placeholder ni siquiera
// aparecían en COURSES_DATA (solo vivían como entrada de catálogo en
// courses.json) — ahora las 48 filas están en la misma tabla, así que
// `hasCourseData` filtra explícitamente por `modules` no vacío para
// conservar el mismo comportamiento (un curso sin contenido real sigue sin
// "existir" para LearningInterface, que redirige a /dashboard si no).
export function hasCourseData(courseId) {
  return Boolean(COURSES_DATA[courseId]?.modules?.length)
}

// Usado por AchievementWatcher.jsx / AchievementsPanel.jsx / searchIndex.js
// — antes leían `Object.values(COURSES_DATA)` directo, que solo tenía los
// cursos con contenido real (mismo filtro que hasCourseData, ver arriba).
export function getAllCourses() {
  return Object.values(useCourseContentStore.getState().courses).filter((c) => c.modules?.length)
}
