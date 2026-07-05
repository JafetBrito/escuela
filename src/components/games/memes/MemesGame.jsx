import { useState, useCallback } from 'react'
import MemeCard from './MemeCard'
import { MEME_CATEGORIES, getMemesBySubcategory, getCategoryById } from '../../../data/memesData'

// ── Share helper ──────────────────────────────────────────────────────────────
async function shareMeme(meme, category) {
  const url = `${window.location.origin}/m/${meme.id}`
  const text = `Aprendiendo con memes 😂📚\n${category?.label ?? ''} — Oliver Academy`
  if (navigator.share) {
    try {
      await navigator.share({ title: text, text, url })
      return 'shared'
    } catch { /* user cancelled */ }
  }
  await navigator.clipboard.writeText(url).catch(() => {})
  return 'copied'
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CategoryGrid({ onSelect }) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <p className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-text-muted/60">
        Elige una materia
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {MEME_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`group flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br ${cat.color} p-4 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95`}
          >
            <span className="text-4xl drop-shadow">{cat.emoji}</span>
            <span className="text-center text-xs font-bold text-white">{cat.label}</span>
            <span className="text-[10px] font-medium text-white/70">
              {cat.subcategories.length} temas
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function SubcategoryGrid({ catId, onSelect, onBack }) {
  const cat = getCategoryById(catId)
  if (!cat) return null
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
        <button type="button" onClick={onBack} className="text-sm text-text-muted hover:text-text">
          ← Categorías
        </button>
        <div className="flex flex-1 items-center justify-center gap-2">
          <span className="text-xl">{cat.emoji}</span>
          <span className="font-bold">{cat.label}</span>
        </div>
        <span className="w-16" />
      </div>
      <div className="flex-1 p-4">
        <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-text-muted/60">
          Elige un tema
        </p>
        <div className="flex flex-col gap-2">
          {cat.subcategories.map((sub) => {
            const count = getMemesBySubcategory(catId, sub.id).length
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelect(sub.id)}
                disabled={count === 0}
                className={`flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold transition-all
                  ${count > 0 ? 'hover:border-primary/50 hover:bg-surface-hover' : 'cursor-not-allowed opacity-40'}`}
              >
                <span>{sub.label}</span>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                  {count} memes
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MemeViewer({ catId, subcatId, onBack }) {
  const cat    = getCategoryById(catId)
  const memes  = getMemesBySubcategory(catId, subcatId)
  const subcat = cat?.subcategories.find((s) => s.id === subcatId)

  const [idx,         setIdx]         = useState(0)
  const [showExplain, setShowExplain] = useState(false)
  const [shareLabel,  setShareLabel]  = useState('Compartir')

  const meme = memes[idx]

  const prev = () => { setIdx((i) => (i - 1 + memes.length) % memes.length); setShowExplain(false) }
  const next = () => { setIdx((i) => (i + 1) % memes.length);                setShowExplain(false) }

  const handleShare = useCallback(async () => {
    const result = await shareMeme(meme, cat)
    setShareLabel(result === 'shared' ? '¡Compartido!' : '¡Link copiado!')
    setTimeout(() => setShareLabel('Compartir'), 2000)
  }, [meme, cat])

  if (!meme) return null

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
        <button type="button" onClick={onBack} className="text-sm text-text-muted hover:text-text">
          ← {subcat?.label}
        </button>
        <div className="flex flex-1 items-center justify-center gap-1.5 text-xs text-text-muted">
          {cat?.emoji} {cat?.label}
          <span className="mx-1 text-border">›</span>
          {subcat?.label}
        </div>
        <span className="min-w-[3rem] text-right text-xs font-bold text-text-muted">
          {idx + 1}/{memes.length}
        </span>
      </div>

      {/* Meme + controls */}
      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        <div className="mx-auto w-full max-w-lg">

          {/* Meme card */}
          <MemeCard meme={meme} />

          {/* Explanation toggle */}
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

          {/* Navigation + share */}
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              disabled={memes.length <= 1}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-lg transition-all hover:bg-surface-hover disabled:opacity-30"
            >
              ←
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold transition-all hover:border-primary/40 hover:bg-surface-hover"
            >
              <span>🔗</span>
              <span>{shareLabel}</span>
            </button>
            <button
              type="button"
              onClick={next}
              disabled={memes.length <= 1}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-lg transition-all hover:bg-surface-hover disabled:opacity-30"
            >
              →
            </button>
          </div>

          <p className="mt-3 text-center text-[10px] text-text-muted/50">
            El link lleva a una página pública — cualquiera puede verlo sin cuenta
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MemesGame() {
  const [catId,    setCatId]    = useState(null)
  const [subcatId, setSubcatId] = useState(null)

  if (catId && subcatId) {
    return (
      <MemeViewer
        catId={catId}
        subcatId={subcatId}
        onBack={() => setSubcatId(null)}
      />
    )
  }

  if (catId) {
    return (
      <SubcategoryGrid
        catId={catId}
        onSelect={setSubcatId}
        onBack={() => setCatId(null)}
      />
    )
  }

  return <CategoryGrid onSelect={setCatId} />
}
