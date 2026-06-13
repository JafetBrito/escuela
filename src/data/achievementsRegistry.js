// "Logros": medals earned by fully completing a course. Generic by design —
// as more courses get added, each one automatically grants its own medal
// when every module is marked complete.
export function getCourseAchievement(course) {
  return {
    id: `course-${course.courseId}`,
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
