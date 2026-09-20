-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 069 — Foro por escuelas. Cada publicación pertenece a una
-- escuela (nombre de subcategoría de categoryTaxonomy.js, o 'General').
-- Las publicaciones anteriores quedan en 'General'. El borrado por autor o
-- admin ya lo cubre la política de migration_043; se repite aquí (idempotente)
-- por si la base viva no la tiene.
-- ════════════════════════════════════════════════════════════════════════

alter table public.forum_posts add column if not exists school text not null default 'General';

create index if not exists forum_posts_school_idx on public.forum_posts (school, created_at desc);

drop policy if exists "forum_posts: author or admin can delete" on public.forum_posts;
create policy "forum_posts: author or admin can delete" on public.forum_posts
  for delete using (auth.uid() = author_id or public.is_admin());
