import { useEffect, useRef } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { getCourseData, hasCourseData } from '../../data/courseRegistry'
import TopBar from './TopBar'
import ModuleList from './ModuleList'
import ModuleResources from './ModuleResources'
import CommentsPanel from './CommentsPanel'
import VideoPlayer from '../video/VideoPlayer'
import VerticalVideo from '../video/VerticalVideo'
import MascotCompanion from '../mascot/MascotCompanion'
import WelcomeModal from '../onboarding/WelcomeModal'
import SecurityWrapper from '../shared/SecurityWrapper'
import AppTopBar from '../shared/AppTopBar'
import { useProgressStore, EMPTY_ARRAY } from '../../stores/useProgressStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useChatStore } from '../../stores/useChatStore'

export default function LearningInterface() {
  const { courseId } = useParams()
  const hasAccessToCourse = useAuthStore((s) => s.hasAccessToCourse)
  const selectedModuleId = useProgressStore((s) => s.getSelectedModuleId(courseId))
  const moduleProgress = useProgressStore((s) => s.progress[courseId]?.moduleProgress ?? EMPTY_ARRAY)
  const startNewChat = useChatStore((s) => s.startNewChat)
  const prevModuleIdRef = useRef(null)

  const courseData = hasCourseData(courseId) ? getCourseData(courseId) : null
  const currentModule = courseData
    ? courseData.modules.find((m) => m.id === selectedModuleId) ?? courseData.modules[0]
    : null

  // Each class is a fresh chat for the mascot — switching modules archives
  // the previous conversation into Chats history and starts a new one.
  useEffect(() => {
    if (!courseData || !currentModule) return
    if (prevModuleIdRef.current === null) {
      prevModuleIdRef.current = currentModule.id
      return
    }
    if (prevModuleIdRef.current !== currentModule.id) {
      const prevModule = courseData.modules.find((m) => m.id === prevModuleIdRef.current)
      startNewChat(prevModule ? `${courseData.title} · ${prevModule.title}` : undefined)
      prevModuleIdRef.current = currentModule.id
    }
  }, [currentModule, courseData, startNewChat])

  if (!courseData) {
    return <Navigate to="/dashboard" replace />
  }

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

        {!hasAccessToCourse(courseId) && (
          <Link
            to="/unlock"
            className="mx-4 mt-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            🔑 Estás viendo las primeras 2 clases gratis. Consigue tu llave para desbloquear el
            resto de este curso →
          </Link>
        )}

        <div className="grid flex-1 gap-4 p-4 pb-24 md:grid-cols-[1fr_260px]">
          <div className="flex flex-col gap-4">
            <div className="hidden md:block">
              <VideoPlayer videoId={currentModule.videoId} className="w-full" />
            </div>
            <div className="md:hidden">
              <VerticalVideo module={currentModule} />
            </div>
            <ModuleResources module={currentModule} className="min-h-[200px]" />
            <CommentsPanel courseId={courseId} moduleId={currentModule.id} />
          </div>

          <ModuleList courseId={courseId} />
        </div>

        <MascotCompanion courseId={courseId} module={currentModule} />
        <WelcomeModal courseId={courseId} />
      </div>
    </SecurityWrapper>
  )
}
