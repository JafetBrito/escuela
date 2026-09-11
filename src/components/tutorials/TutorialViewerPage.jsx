import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import TextLesson from '../learning/TextLesson'
import { useTutorialContentStore } from '../../stores/useTutorialContentStore'
import { useI18n } from '../../i18n'

// Visor de un tutorial — una sola vista, sin módulos/quiz/progreso (ver
// migration_063.sql). Reusa TextLesson.jsx tal cual (lectura en voz alta +
// resaltado de texto + popovers de glosario) pasándole un courseId
// sintético (`tutorial-<id>`) para que esas herramientas ya existentes
// funcionen sin cambiar una línea de ese componente.
export default function TutorialViewerPage() {
  const { id } = useParams()
  const { t } = useI18n()
  const loaded = useTutorialContentStore((s) => s.loaded)
  const tutorial = useTutorialContentStore((s) => s.tutorials[id])
  const fetchAll = useTutorialContentStore((s) => s.fetchAll)
  useEffect(() => { fetchAll() }, [fetchAll])

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
        {t('pages.tutoriales.loading')}
      </div>
    )
  }

  if (!tutorial || tutorial.locked) {
    return <Navigate to="/tutoriales" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar variant="course" backTo="/tutoriales" backLabel={t('pages.tutoriales.backLabel')} />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl"
              style={{ background: `${tutorial.color}22`, border: `1px solid ${tutorial.color}44` }}>
              {tutorial.icon || '📄'}
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-text">{tutorial.title}</h1>
              {tutorial.description && <p className="mt-0.5 text-sm text-text-muted">{tutorial.description}</p>}
            </div>
          </div>

          <TextLesson
            content={tutorial.content}
            courseId={`tutorial-${tutorial.id}`}
            moduleId={1}
            moduleTitle={tutorial.title}
          />

          {tutorial.resources?.length > 0 && (
            <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">{t('pages.tutoriales.resources')}</p>
              <div className="space-y-1.5">
                {tutorial.resources.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="block text-sm text-primary hover:underline">
                    🔗 {r.label || r.url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
