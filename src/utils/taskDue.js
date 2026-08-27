// Vencimiento de tareas — extraído de TasksPage.jsx (donde vivía privado y
// duplicado) para que UpcomingDeadlinesCard.jsx (Dashboard) pueda mostrar la
// misma info de "próxima a vencer" sin reinventar la lógica de urgencia.
export function dueInfo(dueDate, status) {
  if (!dueDate) return null
  const due  = new Date(dueDate + 'T12:00:00')
  const now  = new Date()
  const diff = Math.ceil((due - now) / 86_400_000)

  if (status !== 'pendiente') {
    return { text: due.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }), urgency: 'none' }
  }
  if (diff < 0)  return { text: `Venció hace ${Math.abs(diff)} día${Math.abs(diff) === 1 ? '' : 's'}`, urgency: 'overdue' }
  if (diff === 0) return { text: '¡Vence hoy!', urgency: 'today' }
  if (diff === 1) return { text: 'Vence mañana', urgency: 'soon' }
  if (diff <= 3)  return { text: `Vence en ${diff} días`, urgency: 'soon' }
  if (diff <= 7)  return { text: `Vence en ${diff} días`, urgency: 'week' }
  return { text: due.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }), urgency: 'later' }
}

export const URGENCY_LABEL = {
  overdue: 'text-red-400',
  today:   'text-red-400',
  soon:    'text-amber-400',
  week:    'text-yellow-400',
  later:   'text-text-muted',
  none:    'text-text-muted',
}

// ── Task grouping ──────────────────────────────────────────────────────────────
export function classifyTask(task) {
  if (task.status !== 'pendiente') return 'done'
  if (!task.due_date) return 'later'
  const diff = Math.ceil((new Date(task.due_date + 'T12:00:00') - new Date()) / 86_400_000)
  if (diff < 0)   return 'overdue'
  if (diff <= 2)  return 'urgent'
  if (diff <= 7)  return 'week'
  return 'later'
}
