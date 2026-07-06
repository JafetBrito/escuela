import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import { ROL_STORIES } from '../../data/rolStoriesRegistry'

function randomRoomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

// ── Story Selection Card ──────────────────────────────────────────────────────
function StoryCard({ story, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all ${
        selected
          ? 'border-white/40 scale-[1.02] shadow-2xl'
          : 'border-white/10 hover:border-white/25 hover:-translate-y-0.5'
      }`}
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      {/* Gradient header */}
      <div className={`flex items-center gap-3 bg-gradient-to-r ${story.gradient} px-4 py-5`}>
        <span className="text-4xl drop-shadow-lg">{story.icon}</span>
        <div>
          <p className="text-sm font-black text-white drop-shadow">{story.title}</p>
          <p className="text-xs font-medium text-white/70">{story.subtitle}</p>
        </div>
        {selected && (
          <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur-sm">
            ✓ ELEGIDA
          </span>
        )}
      </div>

      {/* Description */}
      <div className="p-4">
        <p className="text-xs text-white/60 leading-relaxed">{story.description}</p>
        {/* Intro preview */}
        <div className="mt-3 space-y-1">
          {story.intro.map((line, i) => (
            <p key={i} className="text-[11px] text-white/40 leading-snug">{line}</p>
          ))}
        </div>
      </div>
    </button>
  )
}

// ── Main Lobby ────────────────────────────────────────────────────────────────
export default function RolLobbyPage() {
  const navigate  = useNavigate()
  const [step, setStep]         = useState('story')  // 'story' | 'room'
  const [selectedStory, setSelectedStory] = useState(ROL_STORIES[0])
  const [joinCode, setJoinCode] = useState('')
  const [error, setError]       = useState('')

  const create = () => navigate(`/rol/${randomRoomId()}?story=${selectedStory.id}`)

  const join = () => {
    const code = joinCode.trim().toUpperCase()
    if (code.length < 4) { setError('Código demasiado corto'); return }
    navigate(`/rol/${code}?story=${selectedStory.id}`)
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: 'linear-gradient(135deg, #050d05, #0a001a, #050d05)' }}
    >
      <AppTopBar />

      <div className="flex flex-1 flex-col items-center gap-8 px-4 py-10">

        {/* ── STEP 1: Story Selection ─────────────────────────────────── */}
        {step === 'story' && (
          <div className="w-full max-w-3xl">
            <div className="mb-8 text-center">
              <div className="mb-3 text-6xl">🎲</div>
              <h1 className="text-3xl font-black text-white">Mundo ROL</h1>
              <p className="mt-1 text-white/50">Elige tu campaña para comenzar la aventura</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mb-8">
              {ROL_STORIES.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  selected={selectedStory.id === story.id}
                  onClick={() => setSelectedStory(story)}
                />
              ))}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setStep('room')}
                className={`rounded-2xl px-10 py-4 text-lg font-black text-white shadow-xl transition-all hover:scale-[1.02] bg-gradient-to-r ${selectedStory.gradient}`}
              >
                Continuar con {selectedStory.title} →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Create or Join ──────────────────────────────────── */}
        {step === 'room' && (
          <div className="w-full max-w-sm flex flex-col items-center gap-6">
            {/* Selected story badge */}
            <button
              type="button"
              onClick={() => setStep('story')}
              className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r ${selectedStory.gradient} px-5 py-3 transition-opacity hover:opacity-80`}
            >
              <span className="text-2xl">{selectedStory.icon}</span>
              <div className="text-left">
                <p className="text-xs font-black text-white">{selectedStory.title}</p>
                <p className="text-[11px] text-white/60">Toca para cambiar campaña</p>
              </div>
            </button>

            <div className="w-full space-y-3">
              <button
                type="button"
                onClick={create}
                className="w-full rounded-2xl bg-primary py-4 text-lg font-black text-background shadow-xl transition hover:scale-[1.02]"
              >
                ✨ Crear sala
              </button>

              <div className="flex w-full gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && join()}
                  placeholder="Código de sala"
                  maxLength={8}
                  className="flex-1 rounded-xl border border-border bg-surface/80 px-4 py-3 font-mono text-center text-sm uppercase tracking-widest text-text outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={join}
                  className="rounded-xl border border-border bg-surface/80 px-4 py-3 text-sm font-semibold text-text-muted transition-colors hover:text-text"
                >
                  Unirse
                </button>
              </div>
              {error && <p className="text-center text-xs text-red-400">{error}</p>}
            </div>

            {/* How to play */}
            <div className="text-center text-xs text-white/30 space-y-1">
              <p>1. Crea una sala y comparte el código con tus amigos.</p>
              <p>2. Todos se unen con el mismo código.</p>
              <p>3. El anfitrión inicia la partida.</p>
              <p>4. ¡Tira el dado cuando sea tu turno!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
