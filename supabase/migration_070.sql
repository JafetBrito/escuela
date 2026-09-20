-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 070 — Respuestas en el foro. Cualquier alumno autenticado lee y
-- responde; solo el autor (o un admin) borra su respuesta. Al borrarse una
-- publicación se borran sus respuestas.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.forum_posts(id) on delete cascade not null,
  author_id uuid references auth.users(id) on delete cascade not null,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists forum_replies_post_idx on public.forum_replies (post_id, created_at);

alter table public.forum_replies enable row level security;

drop policy if exists "forum_replies: all can read" on public.forum_replies;
create policy "forum_replies: all can read" on public.forum_replies
  for select using (auth.role() = 'authenticated');

drop policy if exists "forum_replies: author can insert" on public.forum_replies;
create policy "forum_replies: author can insert" on public.forum_replies
  for insert with check (auth.uid() = author_id);

drop policy if exists "forum_replies: author or admin can delete" on public.forum_replies;
create policy "forum_replies: author or admin can delete" on public.forum_replies
  for delete using (auth.uid() = author_id or public.is_admin());
