-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 033 — "Vista de Reclutador": enlaces de acceso temporal (24h)
-- con todo desbloqueado, sin crear una cuenta real de Supabase Auth. El
-- token ES el secreto (como un link para compartir) — cualquiera con el
-- token puede leer su fila para validarlo; solo un admin puede crear/borrar.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.recruiter_passes (
  token text primary key default encode(gen_random_bytes(9), 'hex'),
  label text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

alter table public.recruiter_passes enable row level security;

drop policy if exists "recruiter_passes: public read by token" on public.recruiter_passes;
create policy "recruiter_passes: public read by token" on public.recruiter_passes
  for select using (true);

drop policy if exists "recruiter_passes: admin insert" on public.recruiter_passes;
create policy "recruiter_passes: admin insert" on public.recruiter_passes
  for insert with check (public.is_admin());

drop policy if exists "recruiter_passes: admin delete" on public.recruiter_passes;
create policy "recruiter_passes: admin delete" on public.recruiter_passes
  for delete using (public.is_admin());
