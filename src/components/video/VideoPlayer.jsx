import { useEffect, useId, useRef, useState } from 'react'
import { loadYouTubeApi } from '../../services/video/youtubeApi'

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Hidden/obfuscated YouTube player: native controls disabled
// (controls:0, disablekb:1, modestbranding:1, rel:0), iframe is
// pointer-events:none and sits under a transparent overlay so all
// interaction goes through CustomControls via the IFrame API.
export default function VideoPlayer({ videoId, className = '' }) {
  const containerId = useId().replace(/:/g, '')
  const playerRef = useRef(null)
  const progressTimerRef = useRef(null)

  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    let player
    let cancelled = false

    loadYouTubeApi().then((YT) => {
      if (cancelled) return
      player = new YT.Player(containerId, {
        videoId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            playerRef.current = event.target
            setDuration(event.target.getDuration())
            setIsReady(true)
          },
          onStateChange: (event) => {
            setIsPlaying(event.data === YT.PlayerState.PLAYING)
            if (event.data === YT.PlayerState.PLAYING) {
              progressTimerRef.current = setInterval(() => {
                setCurrentTime(playerRef.current?.getCurrentTime() ?? 0)
              }, 250)
            } else {
              clearInterval(progressTimerRef.current)
            }
          },
        },
      })
    })

    return () => {
      cancelled = true
      clearInterval(progressTimerRef.current)
      player?.destroy?.()
    }
  }, [videoId, containerId])

  const togglePlay = () => {
    const player = playerRef.current
    if (!player) return
    if (isPlaying) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }

  const handleSeek = (event) => {
    const player = playerRef.current
    if (!player || !duration) return
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    player.seekTo(ratio * duration, true)
    setCurrentTime(ratio * duration)
  }

  const progressPct = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className={`relative overflow-hidden rounded-xl border border-border bg-black ${className}`}>
      <div className="pointer-events-none aspect-video w-full">
        <div id={containerId} className="h-full w-full" />
      </div>

      {/* Click-capture overlay: blocks direct iframe interaction (no right-click menu / "open on YouTube") */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()}
      />

      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
        <button
          onClick={togglePlay}
          disabled={!isReady}
          className="text-xl text-primary disabled:opacity-50"
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div
          onClick={handleSeek}
          className="h-1.5 flex-1 cursor-pointer rounded-full bg-white/20"
        >
          <div
            className="h-1.5 rounded-full bg-primary"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <span className="text-xs text-white/80">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}
