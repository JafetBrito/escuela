import VideoPlayer from './VideoPlayer'

// Mobile-first portrait video. `verticalVideoSrc` (archivo autohospedado)
// tiene prioridad sobre `verticalVideoId` (YouTube) — mismo criterio que
// VideoPlayer.jsx. Si el módulo no tiene ninguna versión vertical todavía,
// cae a un "próximamente" que sigue mostrando el video horizontal (también
// autohospedado si `videoSrc` está presente).
export default function VerticalVideo({ module, className = '' }) {
  if (module.verticalVideoSrc || module.verticalVideoId) {
    return (
      <VideoPlayer
        src={module.verticalVideoSrc}
        videoId={module.verticalVideoId}
        aspectClassName="aspect-[9/16] max-h-[75vh]"
        className={`w-full ${className}`}
      />
    )
  }

  return (
    <div className={`flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 ${className}`}>
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-background py-6 text-center text-text-muted">
        <span className="text-4xl">🎬</span>
        <p className="font-semibold text-text">Video vertical próximamente</p>
        <p className="px-4 text-sm">
          Estamos grabando una versión vertical de esta clase para que se vea mejor en tu
          teléfono. Mientras tanto, aquí tienes el video normal.
        </p>
      </div>
      <VideoPlayer src={module.videoSrc} videoId={module.videoId} className="w-full" />
    </div>
  )
}
