// Elección de "track" de un curso (p. ej. qué API va a consultar el alumno)
// persistida en localStorage — no es progreso crítico como los quizzes/misiones
// (eso vive en el snapshot de Supabase), así que un simple localStorage por
// dispositivo es suficiente: ver [[project-persistencia-supabase]].
const PREFIX = 'courseTrack:'

export function getCourseTrack(courseId, fallback) {
  try {
    return localStorage.getItem(PREFIX + courseId) || fallback
  } catch {
    return fallback
  }
}

export function setCourseTrack(courseId, trackId) {
  try {
    localStorage.setItem(PREFIX + courseId, trackId)
  } catch {
    // localStorage no disponible (modo privado, etc.) — la elección simplemente no persiste
  }
}
