-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 067 — Academias + rol de director. Un director es un profesor
-- con rango superior atado a UNA academia (profiles.role = 'director',
-- profiles.academy_id). La identidad visual de cada academia vive en
-- src/data/academies.js (colores/emblema/props del mapa), keyed por
-- academies.id; aquí solo va lo que sí es dato de cuenta: nombre, director.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.academies (
  id text primary key,
  name text not null,
  director_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.academies enable row level security;

drop policy if exists "academies: anyone can read" on public.academies;
create policy "academies: anyone can read" on public.academies
  for select using (true);

drop policy if exists "academies: admin write" on public.academies;
create policy "academies: admin write" on public.academies
  for all using (public.is_admin()) with check (public.is_admin());

-- A qué academia pertenece una cuenta (alumno, profesor o director).
alter table public.profiles add column if not exists academy_id text references public.academies(id) on delete set null;

insert into public.academies (id, name) values
  ('filosofia', 'Academia de Filosofía'),
  ('medicina',  'Academia de Medicina'),
  ('ia',        'Academia de IA')
on conflict (id) do nothing;

-- Para nombrar a Jafet director (reemplaza el correo):
--   update public.profiles set role = 'director', academy_id = 'filosofia' where email = '...';
--   update public.academies set director_id = (select id from public.profiles where email = '...') where id = 'filosofia';
