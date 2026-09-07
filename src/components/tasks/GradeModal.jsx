import { useState } from 'react'
import { useI18n } from '../../i18n'
import { taskTypeOf } from '../../data/taskTypes'

// Extraído de AdminTasksPage.jsx para reutilizarse también en TaskDetailPage
// (la calificación ahora vive en la página de detalle, no en un modal aparte
// dentro de la lista del admin).
//
// Restyle: mismo lenguaje visual "gamificado" que la tarjeta de calificación
// de TaskDetailPage.jsx (panel con degradado + glow), acentuado con el color
// del tipo de tarea (taskTypes.js) para que el formulario de entrada se vea
// consistente con la vista de salida.
export default function GradeModal({ task, onClose, onSave }) {
  const { t } = useI18n()
  const type = taskTypeOf(task.type)
  const [grade, setGrade] = useState(task.grade ?? '')
  const [gradeMax, setGradeMax] = useState(task.grade_max ?? 10)
  const [feedback, setFeedback] = useState(task.feedback ?? '')
  const [xpReward, setXpReward] = useState(task.xp_reward ?? 0)
  const [goldReward, setGoldReward] = useState(task.gold_reward ?? 0)
  const [busy, setBusy] = useState(false)

  const handleSave = async () => {
    if (grade === '' || isNaN(Number(grade))) return
    setBusy(true)
    await onSave(task.id, {
      grade: Number(grade), grade_max: Number(gradeMax), feedback,
      xp_reward: Number(xpReward) || 0, gold_reward: Number(goldReward) || 0,
    })
    setBusy(false)
    onClose()
  }

  const inputCls = 'mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl"
        style={{ borderColor: `${type.color}35`, boxShadow: `0 0 40px ${type.color}18` }}
      >
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ background: `linear-gradient(135deg, ${type.color}22 0%, ${type.color}05 100%)` }}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{ background: `${type.color}25`, boxShadow: `0 0 16px ${type.color}30` }}
          >
            {type.icon}
          </span>
          <div className="min-w-0">
            <h2 className="font-extrabold text-text">{t('pages.gradeModal.title')}</h2>
            <p className="truncate text-sm text-text-muted">{task.title}</p>
          </div>
        </div>

        <div className="space-y-3 bg-surface px-6 py-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase text-text-muted">{t('pages.gradeModal.grade')}</label>
              <input
                type="number"
                min={0}
                max={gradeMax}
                step={0.5}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="w-20">
              <label className="text-[10px] font-bold uppercase text-text-muted">{t('pages.gradeModal.outOf')}</label>
              <input
                type="number"
                min={1}
                value={gradeMax}
                onChange={(e) => setGradeMax(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div className="flex gap-2 rounded-xl border p-2.5" style={{ borderColor: 'rgba(124,58,237,0.25)', background: 'linear-gradient(90deg, rgba(124,58,237,0.08), rgba(251,191,36,0.05))' }}>
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase text-violet-400">{t('pages.gradeModal.xp')}</label>
              <input
                type="number"
                min={0}
                value={xpReward}
                onChange={(e) => setXpReward(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase text-amber-400">{t('pages.gradeModal.coins')}</label>
              <input
                type="number"
                min={0}
                value={goldReward}
                onChange={(e) => setGoldReward(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-text-muted">{t('pages.gradeModal.comments')}</label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t('pages.gradeModal.feedbackPlaceholder')}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-border bg-surface px-6 py-4">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-text">
            {t('pages.gradeModal.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy || grade === ''}
            className="flex-1 rounded-lg px-3 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
            style={{ background: `linear-gradient(90deg, ${type.color}, ${type.color}cc)`, boxShadow: `0 0 16px ${type.color}40` }}
          >
            {busy ? t('pages.gradeModal.saving') : t('pages.gradeModal.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
