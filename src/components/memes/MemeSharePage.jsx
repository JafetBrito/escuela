// Public page — no login required.
// Accessible at /m/:memeId — anyone with the link can see the meme.
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import MemeCard from '../games/memes/MemeCard'
import { getMemeById, getCategoryById } from '../../data/memesData'

export default function MemeSharePage() {
  const { memeId } = useParams()
  const meme = getMemeById(memeId)
  const [showExplain, setShowExplain] = useState(false)

  if (!meme) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center text-text">
        <span className="text-5xl">🤔</span>
        <p className="text-lg font-bold">Meme no encontrado</p>
        <Link to="/" className="text-sm text-primary hover:underline">
          Ir a Oliver Academy →
        </Link>
      </div>
    )
  }

  const cat    = getCategoryById(meme.category)
  const subcat = cat?.subcategories.find((s) => s.id === meme.subcategory)

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">

      {/* Mini header */}
      <header className="border-b border-border bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 font-black text-primary">
            🎓 Oliver Academy
          </Link>
          <span className="text-xs text-text-muted">
            {cat?.emoji} {cat?.label} › {subcat?.label}
          </span>
        </div>
      </header>

      {/* Meme */}
      <main className="flex flex-1 flex-col items-center px-4 py-8">
        <div className="w-full max-w-lg">

          <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-text-muted/60">
            😂 Aprendiendo con Memes
          </p>

          <MemeCard meme={meme} />

          {/* Explanation */}
          <button
            type="button"
            onClick={() => setShowExplain((v) => !v)}
            className="mt-3 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-muted transition-all hover:border-primary/40 hover:text-text"
          >
            {showExplain ? '▲ Ocultar explicación' : '📖 Ver explicación educativa'}
          </button>

          {showExplain && (
            <div className="mt-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-text">
              {meme.explanation}
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/10 p-6 text-center">
            <p className="text-2xl font-black text-primary">¡Aprende así todos los días!</p>
            <p className="mt-1 text-sm text-text-muted">
              Oliver Academy tiene memes de Psicología, Medicina, Historia, Física, Biología, Matemáticas y más —
              además de cursos, juegos y un campus 3D.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link
                to="/crear-cuenta"
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-background transition-all hover:bg-primary-hover"
              >
                Crear cuenta gratis →
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-text transition-all hover:bg-surface-hover"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
