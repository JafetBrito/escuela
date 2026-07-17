import { useState } from 'react'

// Extraído de AdminTasksPage.jsx para reutilizarse también en TaskDetailPage
// (la calificación ahora vive en la página de detalle, no en un modal aparte
// dentro de la lista del admin).
export default function GradeModal({ task, onClose, onSave }) {
  const [grade, setGrade] = useState(task.grade ?? '')
  const [gradeMax, setGradeMax] = useState(task.grade_max ?? 10)
  const [feedback, setFeedback] = useState(task.feedback ?? '')
  const [busy, setBusy] = useState(false)

  const handleSave = async () => {
    if (grade === '' || isNaN(Number(grade))) return
    setBusy(true)
    await onSave(task.id, { grade: Number(grade), grade_max: Number(gradeMax), feedback })
    setBusy(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <h2 className="font-extrabold text-text">Calificar tarea</h2>
        <p className="mt-0.5 text-sm text-text-muted truncate">{task.title}</p>

        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase text-text-muted">Calificación</label>
              <input
                type="number"
                min={0}
                max={gradeMax}
                step={0.5}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
            </div>
            <div className="w-20">
              <label className="text-[10px] font-bold uppercase text-text-muted">De</label>
              <input
                type="number"
                min={1}
                value={gradeMax}
                onChange={(e) => setGradeMax(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-text-muted">Comentarios (opcional)</label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Escribe retroalimentación para el alumno…"
              className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-text">
            Cancelar
          </button>
          <button type="button" onClick={handleSave} disabled={busy || grade === ''}
            className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background disabled:opacity-50">
            {busy ? 'Guardando…' : '💾 Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
