import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'

function randomRoomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

const TILE_TYPES = [
  { emoji: '🏁', name: 'Inicio', desc: 'Punto de partida' },
  { emoji: '❓', name: 'Pregunta', desc: '+200 monedas al acertar' },
  { emoji: '🎁', name: 'Premio', desc: '+300 monedas garantizadas' },
  { emoji: '💀', name: 'Trampa', desc: '−150 monedas' },
  { emoji: '⚔️', name: 'Batalla', desc: 'Pregunta difícil ×2 recompensa' },
  { emoji: '⭐', name: 'Descanso', desc: 'Zona segura, nada pasa' },
]

export default function RolLobbyPage() {
  const navigate = useNavigate()
  const [joinCode, setJoinCode] = useState('')
  const [error, setError]       = useState('')

  const create = () => navigate(`/rol/${randomRoomId()}`)

  const join = () => {
    const code = joinCode.trim().toUpperCase()
    if (code.length < 4) { setError('Código demasiado corto'); return }
    navigate(`/rol/${code}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppTopBar />

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-10">

        {/* Hero */}
        <div className="text-center">
          <div className="text-6xl mb-3">🎲</div>
          <h1 className="text-3xl font-black text-text">Mundo ROL</h1>
          <p className="mt-1 text-text-muted max-w-sm">
            Juego de tablero educativo 3D. Avanza por casillas, responde preguntas y gana monedas y XP.
          </p>
        </div>

        {/* Win condition */}
        <div className="flex gap-4 text-sm text-text-muted">
          <span className="rounded-full border border-border px-3 py-1">🏆 Meta: 2000 monedas</span>
          <span className="rounded-full border border-border px-3 py-1">✨ o 500 XP</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
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
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 font-mono text-center text-sm uppercase tracking-widest text-text outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={join}
              className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text-muted transition-colors hover:text-text"
            >
              Unirse
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        {/* Tile legend */}
        <div className="mt-2 w-full max-w-md">
          <h2 className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-text-muted">Tipos de casilla</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TILE_TYPES.map((t) => (
              <div
                key={t.name}
                className="flex items-start gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs"
              >
                <span className="text-xl leading-none">{t.emoji}</span>
                <div>
                  <p className="font-semibold text-text">{t.name}</p>
                  <p className="text-text-muted">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to play */}
        <div className="max-w-xs text-center text-xs text-text-muted space-y-1">
          <p>1. Crea una sala y comparte el código con tus amigos.</p>
          <p>2. Todos se unen con el mismo código.</p>
          <p>3. El anfitrión inicia la partida.</p>
          <p>4. Tira el dado cuando sea tu turno.</p>
        </div>
      </div>
    </div>
  )
}
