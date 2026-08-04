// Junta tareas/proyectos/exámenes pendientes en una sola forma común para
// el dashboard — cada sistema vive en su propio store con su propio
// vocabulario de estado (student_tasks.status vs student_projects.status
// vs course_exams+student_graduations), esto solo los adapta a un shape
// compartido, no reemplaza a ninguno de los tres.
// PendingAction: { id, kind:'task'|'project'|'exam', title, subtitle, dueDate, href, icon }
export function buildPendingActions({ tasks = [], projects = [], exams = [], hasAccessToCourse, courses = [] }) {
  const fromTasks = tasks
    .filter((t) => t.status === 'pendiente')
    .map((t) => ({ id: `task:${t.id}`, kind: 'task', title: t.title, subtitle: null,
      dueDate: t.due_date ?? null, href: `/mis-tareas/${t.id}`, icon: '📋' }))

  const fromExams = exams
    .filter((e) => !e.graduated && hasAccessToCourse?.(e.course_id))
    .map((e) => {
      const courseMeta = courses.find((c) => c.id === e.course_id)
      return { id: `exam:${e.course_id}`, kind: 'exam', title: courseMeta?.title ?? e.course_id,
        subtitle: 'Examen final', dueDate: null, href: `/examenes/${e.course_id}`, icon: '📝' }
    })

  const fromProjects = projects
    .filter((p) => p.status !== 'completado')
    .map((p) => ({ id: `project:${p.id}`, kind: 'project', title: p.title, subtitle: null,
      dueDate: null, href: `/proyectos/${p.id}`, icon: '📁' }))

  // Con fecha primero (más próxima primero), sin fecha al final — projects
  // y exams nunca traen due_date en su schema, no es un dato faltante.
  return [...fromTasks, ...fromExams, ...fromProjects].sort((a, b) => {
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
    return a.dueDate ? -1 : b.dueDate ? 1 : 0
  })
}
