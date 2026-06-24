import { useEffect, useRef, useState } from 'react'

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// "Radio" styled audio player for audio-only bonus content (e.g. a podcast
// track) — sits in the same slot the video would normally occupy.
export default function ModuleAudioPlayer({ src, title, className = '' }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setCurrentTime(audio.currentTime)
    const onLoaded = () => setDuration(audio.duration)
    const onEnd = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnd)
    }
  }, [src])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) audio.pause()
    else audio.play()
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * duration
    setCurrentTime(ratio * duration)
  }

  const progressPct = duration ? (currentTime / duration) * 100 : 0

  return (
    <div
      className={`relative flex aspect-video flex-col items-center justify-center gap-5 overflow-hidden rounded-xl border border-border p-8 ${className}`}
      style={{ background: 'radial-gradient(circle at 50% 30%, #2a2418, #0c0a06)' }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        className="flex h-20 w-20 items-center justify-center rounded-full text-3xl text-white shadow-lg transition-transform hover:scale-105"
        style={{ background: 'linear-gradient(160deg, #fb923c, #f97316)' }}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      <div className="flex items-center gap-2 text-white/70">
        <span className="text-lg">📻</span>
        <p className="text-sm font-semibold">{title ?? 'Bonus track'}</p>
      </div>

      <div className="flex w-full max-w-md items-center gap-3 px-4">
        <span className="text-xs text-white/60">{formatTime(currentTime)}</span>
        <div onClick={handleSeek} className="h-1.5 flex-1 cursor-pointer rounded-full bg-white/20">
          <div className="h-1.5 rounded-full" style={{ width: `${progressPct}%`, background: '#fb923c' }} />
        </div>
        <span className="text-xs text-white/60">{formatTime(duration)}</span>
      </div>
    </div>
  )
}
