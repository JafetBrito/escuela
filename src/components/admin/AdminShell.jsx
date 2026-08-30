import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { supabase } from '../../services/supabase/client'
import { useTasksStore } from '../../stores/useTasksStore'
import { useProjectsStore } from '../../stores/useProjectsStore'
import { useAuthStore } from '../../stores/useAuthStore'

// Riel lateral del panel admin unificado — hoy solo envuelve las páginas
// NUEVAS (/admin, /admin/alumnos/:id, /admin/comandos). Las 6 páginas admin
// ya existentes (Tareas/Proyectos/Clases/Exámenes/Podcasts/Setup) siguen con
// su propio <AppTopBar/> tal cual, solo enlazadas desde aquí — envolverlas
// también en este riel es el "siguiente paso natural" para otra pasada, no
// se hace ahora para no arriesgar 6 páginas ya funcionando.
const SECTIONS = [
  { to: '/admin', icon: '🏠', label: 'Resumen', end: true },
  { to: '/admin/cursos', icon: '📚', label: 'Cursos' },
  { to: '/admin/tareas', icon: '📋', label: 'Tareas' },
  { to: '/admin/proyectos', icon: '📁', label: 'Proyectos' },
  { to: '/admin/clases', icon: '🎓', label: 'Clases en vivo' },
  { to: '/admin/examenes', icon: '📝', label: 'Exámenes' },
  { to: '/admin/trivia', icon: '🎯', label: 'Trivia' },
  { to: '/admin/podcasts', icon: '🎙️', label: 'Podcasts' },
  { to: '/admin/comandos', icon: '🕹️', label: 'Comandos' },
  { to: '/admin/reclutadores', icon: '🕵️', label: 'Reclutadores' },
  { to: '/admin-setup', icon: '⚙️', label: 'Configuración' },
]

// Conteo de "Bandeja de revisión" para los badges de Tareas/Proyectos en el
// riel — mismo criterio que las bandejas de AdminTasksPage/AdminProjectsPage
// (needsReview ahí), pero vía las consultas de solo-ids
// fetchTasksNeedingReviewCount/fetchProjectsNeedingReviewCount (no carga las
// listas completas nada más para mostrar un número). Se refresca solo con
// los mismos canales Realtime que ya usan esas dos páginas — así el admin ve
// el número cambiar aunque esté parado en /admin o /admin/alumnos/:id, sin
// tener que abrir Tareas/Proyectos.
function useReviewQueueCounts() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const fetchTasksNeedingReviewCount = useTasksStore((s) => s.fetchTasksNeedingReviewCount)
  const fetchProjectsNeedingReviewCount = useProjectsStore((s) => s.fetchProjectsNeedingReviewCount)
  const [taskCount, setTaskCount] = useState(0)
  const [projectCount, setProjectCount] = useState(0)

  useEffect(() => {
    if (!isAdmin?.()) return
    let cancelled = false
    const refreshTasks = () => fetchTasksNeedingReviewCount().then((n) => { if (!cancelled) setTaskCount(n) })
    const refreshProjects = () => fetchProjectsNeedingReviewCount().then((n) => { if (!cancelled) setProjectCount(n) })
    refreshTasks()
    refreshProjects()
    const channel = supabase
      .channel('admin-shell-review-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_tasks' }, refreshTasks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_questions' }, refreshTasks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_projects' }, refreshProjects)
      .subscribe()
    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [isAdmin, fetchTasksNeedingReviewCount, fetchProjectsNeedingReviewCount])

  return { taskCount, projectCount }
}

function ReviewCountBadge({ count }) {
  if (!count) return null
  return (
    <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default function AdminShell({ children }) {
  const { taskCount, projectCount } = useReviewQueueCounts()
  const badgeFor = { '/admin/tareas': taskCount, '/admin/proyectos': projectCount }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row md:px-8">
        <nav className="flex shrink-0 gap-1.5 overflow-x-auto md:w-52 md:flex-col md:overflow-visible">
          {SECTIONS.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              end={s.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                  isActive ? 'bg-primary text-background' : 'text-text-muted hover:bg-surface'
                }`
              }
            >
              <span>{s.icon}</span> {s.label}
              <ReviewCountBadge count={badgeFor[s.to]} />
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
