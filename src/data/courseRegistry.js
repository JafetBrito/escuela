import { localizeCourse } from './courseTranslations'
import course001 from './course.json'
import coursePromptEngineering from './coursePromptEngineering.js'
import courseDemo from './courseDemo.json'
import courseFilosofia from './courseFilosofia.json'
import courseClaudeMayores from './courseClaudeMayores.json'
import courseAjedrez from './courseAjedrez.json'
import courseBash from './courseBash.json'
import courseHistoriaMatematicas from './courseHistoriaMatematicas.json'
import courseMedicina from './courseMedicina.json'
import coursePsicologia from './coursePsicologia.js'

// Maps a courseId (from courses.json / license / route param) to its full
// content (modules, quizzes, resources). Add new courses here as they ship.
export const COURSES_DATA = {
  [course001.courseId]: course001,
  [courseDemo.courseId]: courseDemo,
  [courseFilosofia.courseId]: courseFilosofia,
  [courseClaudeMayores.courseId]: courseClaudeMayores,
  [courseAjedrez.courseId]: courseAjedrez,
  [courseBash.courseId]: courseBash,
  [courseHistoriaMatematicas.courseId]: courseHistoriaMatematicas,
  [courseMedicina.courseId]: courseMedicina,
  [coursePromptEngineering.courseId]: coursePromptEngineering,
  [coursePsicologia.courseId]: coursePsicologia,
}

// `lang` defaults to 'es' (the base, authored language) so every existing
// caller keeps working unchanged. Pass the current UI language to get a
// translated course where available — see courseTranslations.js.
export function getCourseData(courseId, lang = 'es') {
  const course = COURSES_DATA[courseId] ?? course001
  return lang === 'es' ? course : localizeCourse(course, lang)
}

export function hasCourseData(courseId) {
  return courseId in COURSES_DATA
}
