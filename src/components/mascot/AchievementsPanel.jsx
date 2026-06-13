import { COURSES_DATA } from '../../data/courseRegistry'
import { useProgressStore } from '../../stores/useProgressStore'
import { getCourseAchievement, isCourseCompleted } from '../../data/achievementsRegistry'

export default function AchievementsPanel({ className = '' }) {
  const progress = useProgressStore((s) => s.progress)

  const courses = Object.values(COURSES_DATA)

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <p className="text-sm text-text-muted">
        Cada curso terminado le da a tu mascota una medalla permanente.
      </p>

      {courses.map((courseData) => {
        const moduleProgress = progress[courseData.courseId]?.moduleProgress ?? []
        const completedCount = moduleProgress.filter((p) => p.completed).length
        const totalCount = courseData.modules.length
        const courseDone = isCourseCompleted(courseData, moduleProgress)
        const achievement = getCourseAchievement(courseData)

        return (
          <div
            key={courseData.courseId}
            className={`flex gap-3 rounded-xl border-2 bg-background p-3 ${
              courseDone ? 'border-primary' : 'border-border opacity-60'
            }`}
          >
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-3xl ${
                courseDone ? 'bg-primary/10' : 'bg-surface-hover'
              }`}
            >
              {courseDone ? achievement.icon : '🔒'}
            </div>
            <div className="flex flex-col gap-1">
              <p className={`font-bold ${courseDone ? 'text-primary' : 'text-text'}`}>
                {achievement.name}
              </p>
              <p className="text-sm text-text-muted">{achievement.description}</p>
              <p className="text-xs text-text-muted">
                Progreso: {completedCount}/{totalCount} módulos
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
