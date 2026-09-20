import { useEffect, useMemo, useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useAuthStore } from '../../stores/useAuthStore'
import { supabase } from '../../services/supabase/client'
import { useI18n } from '../../i18n'
import { MAIN_CATEGORIES, SCHOOL_ICONS } from '../../data/categoryTaxonomy'
import { localizeCategoryName } from '../../data/categoryTranslations'

// Foro por escuelas: cada escuela (subcategoría de la taxonomía) tiene su
// propia área, más una "General". forum_posts.school (migration_069) guarda a
// cuál pertenece. Sigue siendo plano (sin respuestas/likes); el autor y los
// admins pueden borrar. Los textos nuevos de esta página están solo en español.
const GENERAL = 'General'
const AREAS = [
  { name: GENERAL, icon: '💬', accent: '#98ca3f' },
  ...MAIN_CATEGORIES.flatMap((m) => m.subcategories.map((s) => ({ name: s.name, icon: SCHOOL_ICONS[s.name] ?? m.icon, accent: m.accent }))),
]
const areaOf = (name) => AREAS.find((a) => a.name === name) ?? AREAS[0]
const POSTS_LIMIT = 500

function timeAgo(iso, t) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return t('pages.forum.timeJustNow')
  if (diff < 3600) return t('pages.forum.timeMinutes', { n: Math.floor(diff / 60) })
  if (diff < 86400) return t('pages.forum.timeHours', { n: Math.floor(diff / 3600) })
  return new Date(iso).toLocaleDateString(t('pages.forum.dateLocale'), { day: 'numeric', month: 'short' })
}

export default function ForoPage() {
  const { t, lang } = useI18n()
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const isAdmin = profile?.role === 'admin'

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [area, setArea] = useState('all') // 'all' | nombre de escuela
  const [query, setQuery] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [postArea, setPostArea] = useState(GENERAL)
  const [composing, setComposing] = useState(false)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  const authorName = profile?.display_name || session?.user?.email?.split('@')[0] || t('pages.forum.defaultAuthor')

  const fetchPosts = async () => {
    setLoading(true)
    const { data } = await supabase.from('forum_posts').select('*').order('created_at', { ascending: false }).limit(POSTS_LIMIT)
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  const counts = useMemo(() => {
    const c = {}
    for (const p of posts) c[p.school ?? GENERAL] = (c[p.school ?? GENERAL] ?? 0) + 1
    return c
  }, [posts])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((p) =>
      (area === 'all' || (p.school ?? GENERAL) === area) &&
      (!q || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q) || p.author_name.toLowerCase().includes(q)))
  }, [posts, area, query])

  const openComposer = () => { setPostArea(area === 'all' ? GENERAL : area); setComposing(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setPosting(true)
    setError('')
    const { error: err } = await supabase.from('forum_posts').insert({
      author_id: session.user.id,
      author_name: authorName,
      title: title.trim(),
      body: body.trim(),
      school: postArea,
    })
    setPosting(false)
    if (err) { setError(t('pages.forum.postError')); return }
    setTitle(''); setBody(''); setComposing(false)
    setArea(postArea)
    fetchPosts()
  }

  const handleDelete = async (post) => {
    if (!window.confirm('¿Borrar esta publicación? No se puede deshacer.')) return
    // Un delete bloqueado por RLS no da error, solo 0 filas: se revisa.
    const { data, error: err } = await supabase.from('forum_posts').delete().eq('id', post.id).select('id')
    if (err || !data?.length) { window.alert('No se pudo borrar la publicación.'); return }
    setPosts((ps) => ps.filter((p) => p.id !== post.id))
  }

  const current = area === 'all' ? null : areaOf(area)

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 md:px-8">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-7 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">{t('pages.forum.title')}</h1>
              <p className="mt-1 text-sm font-medium text-white/85">{t('pages.forum.subtitle')} · {posts.length} publicaciones</p>
            </div>
            <button type="button" onClick={openComposer} className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 hover:opacity-90">
              {t('pages.forum.newPost')}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          {/* Escuelas */}
          <aside className="md:w-64 md:shrink-0">
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text md:hidden"
            >
              <option value="all">📚 Todas las escuelas ({posts.length})</option>
              {AREAS.map((a) => <option key={a.name} value={a.name}>{a.icon} {localizeCategoryName(a.name, lang)} ({counts[a.name] ?? 0})</option>)}
            </select>
            <div className="sticky top-4 hidden max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-border bg-surface p-2 md:block">
              <p className="px-3 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-widest text-text-muted/60">Escuelas</p>
              {[{ name: 'all', icon: '📚', accent: '#98ca3f' }, ...AREAS].map((a) => {
                const active = area === a.name
                const n = a.name === 'all' ? posts.length : (counts[a.name] ?? 0)
                return (
                  <button
                    key={a.name}
                    type="button"
                    onClick={() => setArea(a.name)}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${active ? '' : 'text-text-muted hover:text-text'}`}
                    style={active ? { backgroundColor: `${a.accent}22`, color: a.accent } : {}}
                  >
                    <span className="truncate">{a.icon} {a.name === 'all' ? 'Todas las escuelas' : localizeCategoryName(a.name, lang)}</span>
                    <span className="shrink-0 rounded-full bg-surface-hover px-2 py-0.5 text-xs text-text-muted">{n}</span>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* Publicaciones */}
          <section className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold" style={current ? { color: current.accent } : {}}>
                {current ? `${current.icon} ${localizeCategoryName(current.name, lang)}` : '📚 Todas las escuelas'}
              </h2>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="🔍 Buscar en el foro…"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary sm:w-72"
              />
            </div>

            {composing && (
              <form onSubmit={handleSubmit} className="mb-5 flex flex-col gap-3 rounded-2xl border border-primary/40 bg-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-text">{t('pages.forum.newPost')}</p>
                  <select
                    value={postArea}
                    onChange={(e) => setPostArea(e.target.value)}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-text"
                  >
                    {AREAS.map((a) => <option key={a.name} value={a.name}>{a.icon} {localizeCategoryName(a.name, lang)}</option>)}
                  </select>
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={140}
                  placeholder={t('pages.forum.titlePlaceholder')}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={4000}
                  placeholder={t('pages.forum.bodyPlaceholder')}
                  rows={5}
                  className="resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                />
                {error && <p className="text-xs text-danger">{error}</p>}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setComposing(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-muted hover:text-text">Cancelar</button>
                  <button
                    type="submit"
                    disabled={posting || !title.trim() || !body.trim()}
                    className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-background hover:bg-primary-hover disabled:opacity-50"
                  >
                    {posting ? t('pages.forum.posting') : t('pages.forum.publish')}
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <p className="py-10 text-center text-sm text-text-muted">{t('pages.forum.loading')}</p>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
                <span className="text-4xl">🗣️</span>
                <p className="text-sm text-text-muted">{query ? 'Nada coincide con tu búsqueda.' : t('pages.forum.emptyState')}</p>
              </div>
            ) : (
              <ul className="grid gap-3 xl:grid-cols-2">
                {visible.map((p) => {
                  const a = areaOf(p.school ?? GENERAL)
                  const canDelete = isAdmin || p.author_id === session?.user?.id
                  return (
                    <li key={p.id} className="flex flex-col rounded-2xl border border-border bg-surface p-4" style={{ borderLeft: `4px solid ${a.accent}` }}>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                            {p.author_name.trim().charAt(0).toUpperCase() || '?'}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-text">{p.author_name}</p>
                            <p className="text-[11px] text-text-muted">{timeAgo(p.created_at, t)}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {area === 'all' && (
                            <button type="button" onClick={() => setArea(a.name)} className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `${a.accent}22`, color: a.accent }}>
                              {a.icon} {localizeCategoryName(a.name, lang)}
                            </button>
                          )}
                          {canDelete && (
                            <button type="button" onClick={() => handleDelete(p)} title="Borrar publicación" className="rounded-lg px-2 py-1 text-xs text-text-muted hover:bg-danger/10 hover:text-danger">🗑️</button>
                          )}
                        </div>
                      </div>
                      <p className="mb-1 font-bold text-text">{p.title}</p>
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-text-muted">{p.body}</p>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </main>

      <MascotCompanion hideViewport />
    </div>
  )
}
