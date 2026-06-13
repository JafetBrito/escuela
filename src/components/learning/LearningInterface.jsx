import { useParams, Navigate } from 'react-router-dom'
import { getCourseData, hasCourseData } from '../../data/courseRegistry'
import TopBar from './TopBar'
import ModuleList from './ModuleList'
import ModuleResources from './ModuleResources'
import VideoPlayer from '../video/VideoPlayer'
import MascotCompanion from '../mascot/MascotCompanion'
import WelcomeModal from '../onboarding/WelcomeModal'
import SecurityWrapper from '../shared/SecurityWrapper'
import AppTopBar from '../shared/AppTopBar'
import { useProgressStore, EMPTY_ARRAY } from '../../stores/useProgressStore'
import { useAuthStore } from '../../stores/useAuthStore'

export default function LearningInterface() {
  const { courseId } = useParams()
  const hasAccessToCourse = useAuthStore((s) => s.hasAccessToCourse)
  const selectedModuleId = useProgressStore((s) => s.getSelectedModuleId(courseId))
  const moduleProgress = useProgressStore((s) => s.progress[courseId]?.moduleProgress ?? EMPTY_ARRAY)

  if (!hasCourseData(courseId)) {
    return <Navigate to="/dashboard" replace />
  }

  if (!hasAccessToCourse(courseId)) {
    return <Navigate to={`/crear-cuenta?course=${courseId}`} replace />
  }

  const courseData = getCourseData(courseId)
  const currentModule =
    courseData.modules.find((m) => m.id === selectedModuleId) ?? courseData.modules[0]

  const progressPct = Math.round(
    (moduleProgress.filter((p) => p.completed).length / courseData.modules.length) * 100,
  )

  return (
    <SecurityWrapper>
      <div className="flex min-h-screen flex-col bg-background text-text">
        <AppTopBar variant="course" />
        <TopBar
          courseTitle={courseData.title}
          moduleTitle={currentModule.title}
          progressPct={progressPct}
        />

        <div className="grid flex-1 gap-4 p-4 pb-24 md:grid-cols-[1fr_260px]">
          <div className="flex flex-col gap-4">
            <VideoPlayer videoId={currentModule.videoId} className="w-full" />
            <ModuleResources module={currentModule} className="min-h-[200px]" />
          </div>

          <ModuleList courseId={courseId} />
        </div>

        <MascotCompanion courseId={courseId} module={currentModule} />
        <WelcomeModal courseId={courseId} />
      </div>
    </SecurityWrapper>
  )
}
