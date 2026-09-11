-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 063 — tabla `tutorials`: nuevo tipo de contenido, paralelo a
-- `courses` (migration_024.sql) pero lógicamente distinto — una guía tipo
-- how-to de una sola vista (sin `modules`, sin quiz, sin examen, no da
-- XP/oro ni cuenta en /progreso ni logros). Mismo criterio de RLS que ya
-- usan `courses`/`trivia_questions`: todos los autenticados leen, solo
-- admin escribe.
--
-- Ya incluye `ai_generated`/`created_by`/`review_status`/`review_note`
-- (mismo shape que `courses`) para que la fase 2 (el Oráculo generando
-- tutoriales, no parte de esta migración) no necesite otra migración.
-- ════════════════════════════════════════════════════════════════════════
create table if not exists public.tutorials (
  id text primary key,
  title text not null,
  description text,
  icon text,
  color text,
  category text,
  content text not null default '',               -- HTML de la guía, una sola vista
  resources jsonb not null default '[]'::jsonb,    -- [{label, url}] opcional
  locked boolean not null default false,           -- mismo "Próximamente" que courses.locked
  translations jsonb not null default '{}'::jsonb, -- reservado, sin UI de localización todavía
  ai_generated boolean not null default false,
  created_by uuid references auth.users(id),
  review_status text,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tutorials enable row level security;

drop policy if exists "tutorials: everyone reads" on public.tutorials;
create policy "tutorials: everyone reads" on public.tutorials
  for select using (auth.uid() is not null);

drop policy if exists "tutorials: admin writes" on public.tutorials;
create policy "tutorials: admin writes" on public.tutorials
  for all using (public.is_admin()) with check (public.is_admin());
