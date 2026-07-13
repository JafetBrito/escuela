// Tipos de trabajo escolar — compartido entre TasksPage (alumno) y
// AdminTasksPage (profesor) para que ambos usen los mismos íconos/colores/
// etiquetas y no se dupliquen ni se desincronicen.
export const TASK_TYPES = {
  tarea:   { label: 'Tarea',   icon: '📝', color: '#3b82f6' },
  proyecto: { label: 'Proyecto', icon: '📁', color: '#a855f7' },
  examen:  { label: 'Examen',  icon: '📊', color: '#ef4444' },
}

export function taskTypeOf(type) {
  return TASK_TYPES[type] ?? TASK_TYPES.tarea
}
