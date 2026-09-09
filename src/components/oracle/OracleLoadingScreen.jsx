import { useState } from 'react'
import { useI18n } from '../../i18n'

// Antes: un emoji 🔮 pulsante + texto + puntos, mientras se genera el curso.
// Ahora: /public/desarrollo.mp4 en loop mientras se genera, y en cuanto
// termina (status='done', justo antes de navegar a /learn/:id) cambia a
// /public/finalizado.mp4 — el alumno avanza al terminar el video O al hacer
// clic en "Ver mi curso", lo que pase primero. Si cualquiera de los dos
// videos no carga (archivo movido/renombrado), se cae de vuelta a los
// puntos de progreso de siempre — nunca deja al alumno con una pantalla en
// blanco.
export default function OracleLoadingScreen({ status, stepLabel, moduleCount, moduleIndex, onContinue }) {
  const { t } = useI18n()
  const [videoFailed, setVideoFailed] = useState(false)
  const isDone = status === 'done'

  if (videoFailed) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="animate-pulse text-5xl">{isDone ? '✅' : '🔮'}</span>
        <p className="text-lg font-bold text-text">{isDone ? t('pages.oracle.loading.done') : stepLabel}</p>
        {!isDone && status === 'lessons' && (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: moduleCount }).map((_, i) => (
              <span key={i} className={`h-1.5 w-6 rounded-full ${i <= moduleIndex ? 'bg-primary' : 'bg-surface-hover'}`} />
            ))}
          </div>
        )}
        {isDone && (
          <button type="button" onClick={onContinue} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-black text-background hover:bg-primary-hover">
            {t('pages.oracle.loading.viewCourse')}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border">
        {isDone ? (
          <video
            key="finalizado"
            src="/finalizado.mp4"
            autoPlay
            muted
            playsInline
            onEnded={onContinue}
            onError={() => setVideoFailed(true)}
            className="w-full"
          />
        ) : (
          <video
            key="desarrollo"
            src="/desarrollo.mp4"
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoFailed(true)}
            className="w-full"
          />
        )}
      </div>
      <p className="text-lg font-bold text-text">{isDone ? t('pages.oracle.loading.done') : stepLabel}</p>
      {!isDone && (
        <p className="text-sm text-text-muted">{t('pages.oracle.loading.wait')}</p>
      )}
      {!isDone && status === 'lessons' && (
        <div className="flex items-center gap-1.5">
          {Array.from({ length: moduleCount }).map((_, i) => (
            <span key={i} className={`h-1.5 w-6 rounded-full ${i <= moduleIndex ? 'bg-primary' : 'bg-surface-hover'}`} />
          ))}
        </div>
      )}
      {isDone && (
        <button type="button" onClick={onContinue} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-black text-background hover:bg-primary-hover">
          {t('pages.oracle.loading.viewCourse')}
        </button>
      )}
    </div>
  )
}
