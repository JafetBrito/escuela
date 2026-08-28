import { useGalleryStore } from '../../stores/useGalleryStore'
import { useI18n } from '../../i18n'

export default function GalleryPanel() {
  const { t } = useI18n()
  const shots = useGalleryStore((s) => s.shots)
  const updateShotLabel = useGalleryStore((s) => s.updateShotLabel)
  const removeShot = useGalleryStore((s) => s.removeShot)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">
        {t('pages.mascotHome.galleryIntro')}
      </p>

      {shots.length === 0 && (
        <p className="text-sm text-text-muted">
          {t('pages.mascotHome.galleryEmpty')}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {shots.map((shot) => (
          <div key={shot.id} className="flex flex-col gap-2 rounded-xl border border-border bg-background p-2">
            <img src={shot.dataUrl} alt={shot.label} className="w-full rounded-lg object-cover" />
            <div className="flex items-center gap-2">
              <input
                value={shot.label}
                onChange={(e) => updateShotLabel(shot.id, e.target.value)}
                placeholder={t('pages.mascotHome.tagPlaceholder')}
                className="flex-1 rounded-lg border border-border bg-surface px-2 py-1 text-sm text-text outline-none focus:border-primary"
              />
              <button
                onClick={() => removeShot(shot.id)}
                className="shrink-0 text-text-muted hover:text-danger"
                aria-label={t('pages.mascotHome.deleteCapture')}
              >
                ✕
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-text-muted">
                {new Date(shot.createdAt).toLocaleString()}
              </p>
              <a
                href={shot.dataUrl}
                download={`${(shot.label || 'captura').trim().replace(/\s+/g, '-')}.png`}
                className="shrink-0 rounded-lg border border-primary px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                {t('pages.mascotHome.download')}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
