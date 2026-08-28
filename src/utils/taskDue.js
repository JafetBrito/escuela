// Vencimiento de tareas — extraído de TasksPage.jsx (donde vivía privado y
// duplicado) para que UpcomingDeadlinesCard.jsx (Dashboard) pueda mostrar la
// misma info de "próxima a vencer" sin reinventar la lógica de urgencia.
//
// `t` (de useI18n()) es opcional: TasksPage.jsx en sí todavía no pasó por
// i18n (SUBJECTS, GROUPS, etc. siguen en español), así que sus llamadas sin
// `t` se quedan en español exactamente como antes. El Dashboard sí pasa `t`.
export function dueInfo(dueDate, status, t) {
  if (!dueDate) return null
  const due  = new Date(dueDate + 'T12:00:00')
  const now  = new Date()
  const diff = Math.ceil((due - now) / 86_400_000)
  const locale = t ? t('taskDue.dateLocale') : 'es-MX'
  const fmtDate = () => due.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })

  if (status !== 'pendiente') return { text: fmtDate(), urgency: 'none' }
  if (diff < 0) {
    const n = Math.abs(diff)
    const text = t ? (n === 1 ? t('taskDue.overdueOne') : t('taskDue.overdueMany', { n })) : `Venció hace ${n} día${n === 1 ? '' : 's'}`
    return { text, urgency: 'overdue' }
  }
  if (diff === 0) return { text: t ? t('taskDue.today') : '¡Vence hoy!', urgency: 'today' }
  if (diff === 1) return { text: t ? t('taskDue.tomorrow') : 'Vence mañana', urgency: 'soon' }
  if (diff <= 3)  return { text: t ? t('taskDue.inDays', { n: diff }) : `Vence en ${diff} días`, urgency: 'soon' }
  if (diff <= 7)  return { text: t ? t('taskDue.inDays', { n: diff }) : `Vence en ${diff} días`, urgency: 'week' }
  return { text: fmtDate(), urgency: 'later' }
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
