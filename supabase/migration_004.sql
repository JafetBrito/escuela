-- migration_004: tipos de tarea (Tarea/Proyecto/Examen) + notificaciones de alumno
-- Corre este script en Supabase SQL Editor, después de migration_003.

-- ─── student_tasks.type ────────────────────────────────────────────────────────
-- Distingue tareas normales de proyectos y exámenes, para que no se confundan
-- en la lista del alumno ni en el panel del profesor.
alter table public.student_tasks
  add column if not exists type text not null default 'tarea'; -- tarea | proyecto | examen

-- ─── student_notifications ─────────────────────────────────────────────────────
-- Notificación al alumno cuando el profesor califica su tarea (u otros eventos
-- futuros). Separada de school_announcements porque es privada por alumno,
-- no un tablón público.
create table if not exists public.student_notifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade not null,
  task_id uuid references public.student_tasks(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.student_notifications enable row level security;

drop policy if exists "notifications: student sees own" on public.student_notifications;
create policy "notifications: student sees own" on public.student_notifications
  for select using (auth.uid() = student_id or public.is_admin());

drop policy if exists "notifications: student marks read" on public.student_notifications;
create policy "notifications: student marks read" on public.student_notifications
  for update using (auth.uid() = student_id);

drop policy if exists "notifications: admin creates" on public.student_notifications;
create policy "notifications: admin creates" on public.student_notifications
  for insert with check (public.is_admin());
