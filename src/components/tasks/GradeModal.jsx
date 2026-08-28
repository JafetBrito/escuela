import { useState } from 'react'
import { useI18n } from '../../i18n'

// Extraído de AdminTasksPage.jsx para reutilizarse también en TaskDetailPage
// (la calificación ahora vive en la página de detalle, no en un modal aparte
// dentro de la lista del admin).
export default function GradeModal({ task, onClose, onSave }) {
  const { t } = useI18n()
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <h2 className="font-extrabold text-text">{t('pages.gradeModal.title')}</h2>
        <p className="mt-0.5 text-sm text-text-muted truncate">{task.title}</p>

        <div className="mt-4 space-y-3">
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
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
            </div>
            <div className="w-20">
              <label className="text-[10px] font-bold uppercase text-text-muted">{t('pages.gradeModal.outOf')}</label>
              <input
                type="number"
                min={1}
                value={gradeMax}
                onChange={(e) => setGradeMax(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase text-text-muted">{t('pages.gradeModal.xp')}</label>
              <input
                type="number"
                min={0}
                value={xpReward}
                onChange={(e) => setXpReward(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase text-text-muted">{t('pages.gradeModal.coins')}</label>
              <input
                type="number"
                min={0}
                value={goldReward}
                onChange={(e) => setGoldReward(e.target.value)}
                className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
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
              className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:text-text">
            {t('pages.gradeModal.cancel')}
          </button>
          <button type="button" onClick={handleSave} disabled={busy || grade === ''}
            className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-background disabled:opacity-50">
            {busy ? t('pages.gradeModal.saving') : t('pages.gradeModal.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
