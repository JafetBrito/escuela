-- ════════════════════════════════════════════════════════════════════════
-- Migration 061: Sistema global de subrayado — el alumno selecciona texto
-- dentro de una clase, lo marca con un color, y opcionalmente le agrega un
-- comentario. A diferencia de course_comments (públicos, cualquiera los
-- lee), un subrayado es una anotación PERSONAL — RLS restringe select
-- también al dueño, no solo insert/update/delete.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.highlights (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  module_id text not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  color text not null default 'yellow',
  quote text not null,
  prefix text not null default '',
  suffix text not null default '',
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists highlights_course_module_user_idx
  on public.highlights (course_id, module_id, user_id);

alter table public.highlights enable row level security;

drop policy if exists "highlights: select own" on public.highlights;
create policy "highlights: select own" on public.highlights
  for select using (auth.uid() = user_id);

drop policy if exists "highlights: insert own" on public.highlights;
create policy "highlights: insert own" on public.highlights
  for insert with check (auth.uid() = user_id);

drop policy if exists "highlights: update own" on public.highlights;
create policy "highlights: update own" on public.highlights
  for update using (auth.uid() = user_id);

drop policy if exists "highlights: delete own" on public.highlights;
create policy "highlights: delete own" on public.highlights
  for delete using (auth.uid() = user_id);
