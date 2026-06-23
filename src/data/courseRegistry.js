import course001 from './course.json'
import courseDemo from './courseDemo.json'
import courseFilosofia from './courseFilosofia.json'
import courseClaudeMayores from './courseClaudeMayores.json'

// Maps a courseId (from courses.json / license / route param) to its full
// content (modules, quizzes, resources). Add new courses here as they ship.
export const COURSES_DATA = {
  [course001.courseId]: course001,
  [courseDemo.courseId]: courseDemo,
  [courseFilosofia.courseId]: courseFilosofia,
  [courseClaudeMayores.courseId]: courseClaudeMayores,
}

export function getCourseData(courseId) {
  return COURSES_DATA[courseId] ?? course001
}

export function hasCourseData(courseId) {
  return courseId in COURSES_DATA
}
