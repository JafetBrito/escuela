import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { BLOG_POSTS } from '../../data/blogRegistry'

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">📰 Blog</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Artículos externos que vale la pena leer, directo desde la escuela.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group flex gap-4 rounded-2xl border border-border bg-surface p-4 transition hover:border-primary hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl"
                  style={{ background: `${post.color}22`, border: `1px solid ${post.color}44` }}
                >
                  {post.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-text line-clamp-2">{post.title}</p>
                  <p className="mt-0.5 text-xs text-text-muted">{post.author} · {post.source}</p>
                  <p className="mt-1.5 text-sm text-text-muted line-clamp-2">{post.description}</p>
                </div>
                <span className="self-center shrink-0 text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Leer →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
