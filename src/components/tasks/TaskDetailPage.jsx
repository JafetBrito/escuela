import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import ResourceGallery from '../shared/ResourceGallery'
import GradeModal from './GradeModal'
import TaskComposeModal from './TaskComposeModal'
import { useTasksStore } from '../../stores/useTasksStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { taskTypeOf, localizeTaskTypeLabel } from '../../data/taskTypes'
import { renderMarkdown } from '../../utils/markdown'
import { useI18n } from '../../i18n'
import { localizeCategoryName } from '../../data/categoryTranslations'
import { localizeCourseCatalog } from '../../data/courseCatalogTranslations'

function buildStatusMeta(t) {
  return {
    pendiente: { label: t('pages.tasks.statusPending'), cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30', glow: 'rgba(245,158,11,0.35)', color: '#f59e0b' },
    entregada: { label: t('pages.tasks.statusDelivered'), cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30', glow: 'rgba(59,130,246,0.35)', color: '#3b82f6' },
    revisada:  { label: t('pages.tasks.statusReviewed'), cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', glow: 'rgba(16,185,129,0.35)', color: '#10b981' },
  }
}

// `accent` es un hex plano (no una var CSS) porque se le concatenan sufijos
// alfa ("${accent}12") — mismo truco que ya usaba el encabezado y los
// banners de clase/misión relacionada, ahora aplicado a todas las secciones
// para que compartan el color del tipo de tarea en vez de verse idénticas.
function SectionCard({ icon, title, accent = '#6b7280', children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: `${accent}12`, borderBottom: `1px solid ${accent}25` }}>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm" style={{ background: `${accent}22` }}>{icon}</span>
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: accent }}>{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// Tarjeta de calificación — antes era un badge chiquito que abría un popup;
// ahora se ve siempre completa en la página (queja del cliente: "el alumno
// no puede ver su calificación ni el comentario sin hacer click"). El popup
// (GradeViewModal) se conserva como un "plus" — click para una vista más
// grande/festiva — pero calificación + comentario + recompensas ya están
// legibles de un vistazo sin tocar nada.
function GradeShowcase({ task, t, onExpand }) {
  const hasReward = (task.xp_reward > 0) || (task.gold_reward > 0)
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onExpand}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onExpand() }}
      className="cursor-pointer overflow-hidden rounded-2xl border p-5 transition hover:brightness-110"
      style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(16,185,129,0.03) 100%)',
        borderColor: 'rgba(16,185,129,0.35)',
        boxShadow: '0 0 30px rgba(16,185,129,0.12)',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl"
            style={{ background: 'rgba(16,185,129,0.18)', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}
          >
            <span className="text-2xl font-black text-emerald-400">{task.grade}</span>
            <span className="text-[10px] font-bold text-emerald-400/70">/{task.grade_max ?? 10}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">{t('pages.taskDetail.gradeCardTitle')}</p>
            {task.feedback && (
              <p className="mt-1 max-w-md text-sm italic leading-relaxed text-text">&ldquo;{task.feedback}&rdquo;</p>
            )}
          </div>
        </div>
        {hasReward && (
          <div className="flex shrink-0 flex-wrap gap-2">
            {task.xp_reward > 0 && (
              <span
                className="rounded-full px-3 py-1 text-xs font-black text-white"
                style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5)', boxShadow: '0 0 12px rgba(124,58,237,0.5)' }}
              >
                {t('pages.taskDetail.rewardXp', { xp: task.xp_reward })}
              </span>
            )}
            {task.gold_reward > 0 && (
              <span
                className="rounded-full px-3 py-1 text-xs font-black text-amber-950"
                style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', boxShadow: '0 0 12px rgba(251,191,36,0.5)' }}
              >
                {t('pages.taskDetail.rewardGold', { gold: task.gold_reward })}
              </span>
            )}
          </div>
        )}
      </div>
      <p className="mt-3 text-right text-[10px] font-semibold text-emerald-400/50">{t('pages.taskDetail.tapForDetails')}</p>
    </div>
  )
}

// Vista ampliada/festiva de la calificación — ahora es un "plus" opcional
// (la tarjeta de arriba ya muestra todo), pensada como una versión más
// grande y celebratoria para cuando el alumno quiere verla en detalle.
function GradeViewModal({ task, onClose }) {
  const { t } = useI18n()
  const hasReward = (task.xp_reward > 0) || (task.gold_reward > 0)
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border"
        style={{ borderColor: 'rgba(16,185,129,0.3)', boxShadow: '0 0 50px rgba(16,185,129,0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-surface p-6 text-center" style={{ background: 'linear-gradient(180deg, rgba(16,185,129,0.14) 0%, transparent 60%)' }}>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400/80">{t('pages.taskDetail.gradeModalTitle')}</p>
          <p className="mt-2 text-5xl font-black text-emerald-400" style={{ textShadow: '0 0 30px rgba(16,185,129,0.5)' }}>
            {task.grade}<span className="text-2xl text-emerald-400/60">/{task.grade_max ?? 10}</span>
          </p>
          {hasReward && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {task.xp_reward > 0 && (
                <span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5)' }}>
                  {t('pages.taskDetail.rewardXp', { xp: task.xp_reward })}
                </span>
              )}
              {task.gold_reward > 0 && (
                <span className="rounded-full px-3 py-1 text-xs font-black text-amber-950" style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }}>
                  {t('pages.taskDetail.rewardGold', { gold: task.gold_reward })}
                </span>
              )}
            </div>
          )}
          {task.feedback && (
            <div className="mt-4 rounded-xl bg-surface-hover p-3 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">{t('pages.taskDetail.gradeModalComments')}</p>
              <p className="mt-1 text-sm leading-relaxed text-text">{task.feedback}</p>
            </div>
          )}
        </div>
        <button type="button" onClick={onClose} className="w-full border-t border-border bg-surface py-3 text-sm font-semibold text-text-muted hover:text-text">{t('pages.taskDetail.close')}</button>
      </div>
    </div>
  )
}

// Vista previa de un .md ya entregado — trae el texto crudo del bucket
// público (task-submissions) y lo renderiza. Componente aparte porque el
// fetch depende de la URL, no del ciclo de vida de la página completa.
function SubmissionPreview({ url }) {
  const { t } = useI18n()
  const [md, setMd] = useState(null)

  useEffect(() => {
    let cancelled = false
    setMd(null)
    fetch(url).then((r) => r.text()).then((text) => { if (!cancelled) setMd(text) })
    return () => { cancelled = true }
  }, [url])

  if (md === null) return <p className="text-xs text-text-muted">{t('pages.taskDetail.loadingSubmission')}</p>
  return (
    <div
      className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-text
        [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h1]:mb-2 [&_h2]:mb-2
        [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:ml-5 [&_ul]:list-disc [&_ol]:mb-2 [&_ol]:ml-5 [&_ol]:list-decimal
        [&_code]:rounded [&_code]:bg-black/30 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs
        [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-black/40 [&_pre]:p-3"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }}
    />
  )
}

export default function TaskDetailPage() {
  const { t, lang } = useI18n()
  const { id } = useParams()
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const isAdmin = useAuthStore((s) => s.isAdmin)

  const fetchTask = useTasksStore((s) => s.fetchTask)
  const submitTaskFile = useTasksStore((s) => s.submitTaskFile)
  const gradeTask = useTasksStore((s) => s.gradeTask)
  const taskQuestions = useTasksStore((s) => s.taskQuestions)
  const fetchTaskQuestions = useTasksStore((s) => s.fetchTaskQuestions)
  const askTaskQuestion = useTasksStore((s) => s.askTaskQuestion)
  const answerTaskQuestion = useTasksStore((s) => s.answerTaskQuestion)

  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState('')
  const [fileError, setFileError] = useState('')
  const [uploading, setUploading] = useState(false)

  const [newQuestion, setNewQuestion] = useState('')
  const [grading, setGrading] = useState(false)
  const [viewingGrade, setViewingGrade] = useState(false)
  const [composing, setComposing] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchTask(id).then(({ data }) => {
      if (cancelled) return
      if (!data) { setNotFound(true); setLoading(false); return }
      setTask(data)
      setLoading(false)
    })
    fetchTaskQuestions(id)
    return () => { cancelled = true }
  }, [id, fetchTask, fetchTaskQuestions])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-text">
        <AppTopBar />
        <div className="flex flex-1 items-center justify-center text-text-muted">{t('pages.tasks.loadingGeneric')}</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-text">
        <AppTopBar />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-text-muted">
          <p>{t('pages.taskDetail.notFound')}</p>
          <Link to="/mis-tareas" className="text-primary hover:underline">{t('pages.taskDetail.backToTasks')}</Link>
        </div>
      </div>
    )
  }

  const type = taskTypeOf(task.type)
  const statusMeta = buildStatusMeta(t)
  const status = statusMeta[task.status] ?? statusMeta.pendiente
  const hasGrade = task.grade != null
  const isViewerOwner = session?.user?.id === task.student_id
  const viewingAsAdmin = isAdmin?.() && !isViewerOwner
  const details = task.details ?? {}

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    setFileError('')
    setFile(null)
    setFilePreview('')
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.md') && f.type !== 'text/markdown') {
      setFileError(t('pages.taskDetail.mdOnlyError'))
      return
    }
    setFile(f)
    const reader = new FileReader()
    reader.onload = () => setFilePreview(String(reader.result ?? ''))
    reader.readAsText(f)
  }

  // Compartido entre el upload manual de .md y el editor "Redactar tarea"
  // (TaskComposeModal) — los dos terminan produciendo un File y usando el
  // mismo submitTaskFile, así que el paso final (marcar como entregada en el
  // estado local) no debe duplicarse en dos lugares distintos.
  const submitFile = async (uploadedFile) => {
    const { error, patch } = await submitTaskFile(task.id, task.student_id, uploadedFile, task)
    // Antes esto ponía submission_url: t.submission_url (el valor viejo, que
    // en una primera entrega es undefined) en vez de la URL real que acaba
    // de devolver la subida — la vista previa de la entrega no aparecía
    // hasta recargar la página. patch ya trae la URL pública correcta.
    if (!error) setTask((t) => ({ ...t, ...patch }))
    return { error }
  }

  const handleSubmitFile = async () => {
    if (!file) return
    setUploading(true)
    const { error } = await submitFile(file)
    setUploading(false)
    if (!error) {
      setFile(null)
      setFilePreview('')
    } else {
      setFileError(`❌ ${error.message}`)
    }
  }

  const handleAskQuestion = async (e) => {
    e.preventDefault()
    if (!newQuestion.trim()) return
    await askTaskQuestion(task.id, session?.user?.id, newQuestion.trim(), task)
    setNewQuestion('')
  }

  const handleGradeSaved = async (taskId, patch) => {
    await gradeTask(taskId, patch, task)
    setTask((t) => ({ ...t, ...patch, status: 'revisada' }))
  }

  const handleGoToLesson = () => {
    const { courseId, moduleId } = details.linkedLesson
    // Va directo a la clase enlazada, no al mapa del curso — este botón
    // existe justamente para saltar a un punto específico, no para explorar.
    navigate(`/learn/${courseId}/clase/${moduleId}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <Link to="/mis-tareas" className="inline-block text-sm text-text-muted hover:text-primary">{t('pages.taskDetail.backToTasks')}</Link>

          {viewingAsAdmin && (
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
              {t('pages.taskDetail.viewingAsAdmin')}
            </div>
          )}

          {/* Encabezado */}
          <div
            className="overflow-hidden rounded-2xl border"
            style={{ borderColor: `${type.color}35`, boxShadow: `0 0 30px ${type.color}12` }}
          >
            <div
              className="flex items-start justify-between gap-3 px-5 py-5"
              style={{ background: `linear-gradient(135deg, ${type.color}22 0%, ${type.color}05 100%)` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl"
                  style={{ background: `${type.color}25`, boxShadow: `0 0 20px ${type.color}30` }}
                >
                  {type.icon}
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: type.color }}>
                    {localizeTaskTypeLabel(task.type, lang)}{task.subject ? ` · ${localizeCategoryName(task.subject, lang)}` : ''}
                  </p>
                  <h1 className="text-xl font-extrabold text-text">{task.title}</h1>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${status.cls}`}
                  style={{ boxShadow: `0 0 12px ${status.glow}` }}
                >
                  {status.label}
                </span>
              </div>
            </div>

            <div className="space-y-3 bg-surface px-5 py-4">
              {task.due_date && (
                <p className="text-sm text-text-muted">
                  📅 {task.type === 'examen' ? t('pages.taskDetail.examDate') : t('pages.taskDetail.dueDate')}: {new Date(task.due_date + 'T12:00:00').toLocaleDateString(t('pages.taskDetail.dateLocale'), { day: 'numeric', month: 'long', year: 'numeric' })}
                  {task.type === 'examen' && details.time ? t('pages.taskDetail.atTime', { time: details.time }) : ''}
                </p>
              )}
            </div>
          </div>

          {/* Calificación + comentario + recompensas — siempre visible, no
              detrás de un click (queja principal del cliente). */}
          {hasGrade && (
            <GradeShowcase task={task} t={t} onExpand={() => setViewingGrade(true)} />
          )}

          {/* Clase relacionada */}
          {details.linkedLesson && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">{t('pages.taskDetail.linkedLesson')}</p>
                <p className="mt-0.5 font-bold text-text">{details.linkedLesson.moduleTitle}</p>
                <p className="text-xs text-text-muted">{details.linkedLesson.courseTitle}</p>
              </div>
              <button type="button" onClick={handleGoToLesson} className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90">
                {t('pages.taskDetail.goToLesson')}
              </button>
            </div>
          )}

          {/* Misión relacionada */}
          {details.linkedMission && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{details.linkedMission.icon ?? '📜'}</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/70">{t('pages.taskDetail.linkedMission')}</p>
                  <p className="font-bold text-text">{details.linkedMission.title}</p>
                </div>
              </div>
              <Link to="/misiones" className="shrink-0 rounded-xl border border-violet-500/40 px-4 py-2 text-sm font-bold text-violet-400 hover:bg-violet-500/10">
                {t('pages.taskDetail.seeInMissions')}
              </Link>
            </div>
          )}

          {/* Instrucciones */}
          {task.description && (
            <SectionCard icon="📋" title={t('pages.taskDetail.instructions')} accent={type.color}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{task.description}</p>
            </SectionCard>
          )}

          {/* Detalles de examen */}
          {task.type === 'examen' && (details.duration_minutes || details.modality || details.topics) && (
            <SectionCard icon="📊" title={t('pages.taskDetail.examDetails')} accent={type.color}>
              <div className="flex flex-wrap gap-4 text-sm text-text">
                {details.duration_minutes && <span>⏱️ <strong>{details.duration_minutes} min</strong></span>}
                {details.modality && <span>📍 <strong>{details.modality}</strong></span>}
              </div>
              {details.topics && (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-muted">{details.topics}</p>
              )}
            </SectionCard>
          )}

          {/* Entregables del proyecto */}
          {task.type === 'proyecto' && details.deliverables?.length > 0 && (
            <SectionCard icon="📁" title={t('pages.taskDetail.deliverables')} accent={type.color}>
              <ul className="space-y-1.5">
                {details.deliverables.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-text">
                    <span className="text-purple-400">▢</span> {d}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {/* Mini-lección embebida */}
          {details.notesMd && (
            <SectionCard icon="📝" title={t('pages.taskDetail.supportContent')} accent={type.color}>
              <div
                className="text-sm text-text [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:ml-5 [&_ul]:list-disc [&_code]:rounded [&_code]:bg-black/30 [&_code]:px-1"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(details.notesMd) }}
              />
            </SectionCard>
          )}

          {/* Recursos */}
          {details.resources?.length > 0 && (
            <SectionCard icon="📎" title={t('pages.taskDetail.resources')} accent={type.color}>
              <ResourceGallery resources={details.resources} />
            </SectionCard>
          )}

          {/* Cursos recomendados */}
          {details.recommendedCourses?.length > 0 && (
            <SectionCard icon="🎯" title={t('pages.taskDetail.recommendedCourses')} accent={type.color}>
              <div className="flex flex-wrap gap-2">
                {details.recommendedCourses.map((rc) => {
                  const c = localizeCourseCatalog(rc, lang)
                  return (
                    <Link
                      key={c.id}
                      to={`/learn/${c.id}`}
                      className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-hover px-3 py-1.5 text-sm text-text hover:border-primary/50"
                    >
                      <span>{c.icon}</span> {c.title}
                    </Link>
                  )
                })}
              </div>
            </SectionCard>
          )}

          {/* Entrega — panel distinto (no un SectionCard genérico más),
              acentuado según el estado real de la entrega: azul si ya se
              entregó, verde si ya se calificó, o el color del tipo de tarea
              mientras sigue pendiente. */}
          {(() => {
            const submissionAccent = task.status === 'revisada' ? '#10b981' : task.status === 'entregada' ? '#3b82f6' : type.color
            return (
              <div
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: `${submissionAccent}30`, boxShadow: `0 0 24px ${submissionAccent}10` }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-3"
                  style={{ background: `linear-gradient(90deg, ${submissionAccent}1c, ${submissionAccent}03)`, borderBottom: `1px solid ${submissionAccent}25` }}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm" style={{ background: `${submissionAccent}25` }}>📤</span>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: submissionAccent }}>{t('pages.taskDetail.submission')}</p>
                </div>
                <div className="bg-surface p-4">
            {task.submission_url ? (
              <div className="space-y-2">
                <p className="text-sm text-text">
                  📄 <strong>{task.submission_filename}</strong>{' '}
                  <a href={task.submission_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t('pages.taskDetail.download')}</a>
                </p>
                <SubmissionPreview url={task.submission_url} />
                {viewingAsAdmin && task.status !== 'revisada' && (
                  <button
                    type="button"
                    onClick={() => setGrading(true)}
                    className="rounded-lg px-4 py-2 text-sm font-bold text-white transition hover:brightness-110"
                    style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5)', boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}
                  >
                    {t('pages.taskDetail.grade')}
                  </button>
                )}
                {viewingAsAdmin && task.status === 'revisada' && (
                  <button type="button" onClick={() => setGrading(true)} className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:text-text">
                    {t('pages.taskDetail.editGrade')}
                  </button>
                )}
              </div>
            ) : isViewerOwner && task.status === 'pendiente' ? (
              <div className="space-y-2">
                <p className="text-xs text-text-muted">{t('pages.taskDetail.uploadHint')}</p>
                <input type="file" accept=".md,text/markdown" onChange={handleFileChange}
                  className="block w-full text-sm text-text file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary" />
                {fileError && <p className="text-xs text-danger">{fileError}</p>}
                {filePreview && (
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-text-muted/70">{t('pages.taskDetail.preview')}</p>
                    <div
                      className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-text [&_p]:mb-2 [&_h1]:font-bold [&_h2]:font-bold"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(filePreview) }}
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handleSubmitFile} disabled={!file || uploading}
                    className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
                    {uploading ? t('pages.taskDetail.sending') : t('pages.taskDetail.submitTask')}
                  </button>
                  <button type="button" onClick={() => setComposing(true)}
                    className="rounded-lg border border-primary/40 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10">
                    {t('pages.taskDetail.composeTask')}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-muted">{t('pages.taskDetail.noSubmissionYet')}</p>
            )}
                </div>
              </div>
            )
          })()}

          {/* Preguntas — cada intercambio se lee como una conversación:
              burbuja de pregunta (izquierda) y burbuja de respuesta del
              profesor (derecha, tono esmeralda), en vez de un párrafo plano. */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: `${type.color}12`, borderBottom: `1px solid ${type.color}25` }}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm" style={{ background: `${type.color}22` }}>❓</span>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: type.color }}>{t('pages.taskDetail.questions')}</p>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {taskQuestions.length === 0 && <p className="text-sm text-text-muted">{t('pages.taskDetail.noQuestionsYet')}</p>}
                {taskQuestions.map((q) => (
                  <div key={q.id} className="space-y-1.5">
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface-hover px-3 py-2">
                        <p className="text-sm text-text">{q.question}</p>
                      </div>
                    </div>
                    {q.answered ? (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-tr-sm px-3 py-2" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                          <p className="text-sm text-emerald-400">💬 {q.answer}</p>
                        </div>
                      </div>
                    ) : viewingAsAdmin ? (
                      <div className="flex justify-end">
                        <div className="w-[85%]">
                          <AnswerInline question={q} onAnswer={(qId, ans) => answerTaskQuestion(qId, ans, task)} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <p className="text-xs text-text-muted">{t('pages.taskDetail.awaitingAnswer')}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {isViewerOwner && (
                <form onSubmit={handleAskQuestion} className="mt-3 flex gap-2">
                  <input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder={t('pages.taskDetail.askPlaceholder')}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                  />
                  <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90">{t('pages.taskDetail.send')}</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {grading && (
        <GradeModal task={task} onClose={() => setGrading(false)} onSave={handleGradeSaved} />
      )}
      {viewingGrade && (
        <GradeViewModal task={task} onClose={() => setViewingGrade(false)} />
      )}
      {composing && (
        <TaskComposeModal
          task={task}
          studentId={task.student_id}
          onClose={() => setComposing(false)}
          onSubmit={submitFile}
        />
      )}
    </div>
  )
}

function AnswerInline({ question, onAnswer }) {
  const { t } = useI18n()
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)

  const handleAnswer = async (e) => {
    e.preventDefault()
    if (!answer.trim()) return
    setBusy(true)
    await onAnswer(question.id, answer.trim())
    setBusy(false)
  }

  return (
    <form onSubmit={handleAnswer} className="mt-1.5 flex gap-2">
      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={t('pages.taskDetail.answerPlaceholder')}
        className="flex-1 rounded-lg border border-border bg-background px-2 py-1 text-xs text-text outline-none focus:border-primary"
      />
      <button type="submit" disabled={busy} className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-background disabled:opacity-50">
        {t('pages.taskDetail.answer')}
      </button>
    </form>
  )
}
