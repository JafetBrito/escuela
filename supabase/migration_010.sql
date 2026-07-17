-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 010 — Proyectos (student_projects)
-- ════════════════════════════════════════════════════════════════════════
-- Tablero de proyectos estilo Notion: el alumno organiza cada proyecto con
-- notas, checklist y recursos (mismo shape que live_classes.resources). A
-- diferencia de student_tasks (donde el alumno solo puede "marcar entregada"),
-- aquí el dueño tiene control total sobre su propio proyecto, así que una
-- sola política RLS "dueño o admin" cubre select/insert/update/delete.

create table if not exists public.student_projects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'en_progreso', -- 'en_progreso' | 'completado'
  notes jsonb not null default '[]'::jsonb,     -- [{ id, text, date, category, mood }]
  checklist jsonb not null default '[]'::jsonb, -- [{ id, text, done }]
  resources jsonb not null default '[]'::jsonb, -- [{ label, url, type }]
  assigned_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_projects enable row level security;

drop policy if exists "projects: owner or admin" on public.student_projects;
create policy "projects: owner or admin" on public.student_projects
  for all using (auth.uid() = student_id or public.is_admin())
  with check (auth.uid() = student_id or public.is_admin());

alter table public.student_notifications
  add column if not exists project_id uuid references public.student_projects(id) on delete cascade;
