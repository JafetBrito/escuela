-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 018 — Podcasts (playlist de YouTube)
-- ════════════════════════════════════════════════════════════════════════

-- Un podcast = un video de YouTube ya existente (id de 11 caracteres) más
-- título/descripción y una posición para ordenar la playlist. El admin los
-- agrega desde /admin/podcasts; los alumnos los ven y reproducen en /podcasts.
create table if not exists public.podcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  youtube_id text not null,
  position int not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.podcasts enable row level security;

drop policy if exists "podcasts: everyone reads" on public.podcasts;
create policy "podcasts: everyone reads" on public.podcasts
  for select using (auth.uid() is not null);

drop policy if exists "podcasts: admin writes" on public.podcasts;
create policy "podcasts: admin writes" on public.podcasts
  for all using (public.is_admin()) with check (public.is_admin());
