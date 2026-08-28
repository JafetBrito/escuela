-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 047 — Notificaciones de tareas/proyectos en ambas direcciones.
-- Hoy student_notifications solo tiene la política "admin creates"
-- (migration_004.sql): cuando un ALUMNO entrega una tarea, pregunta una
-- duda, o actualiza un proyecto, el insert de notificación falla en
-- silencio — mismo hueco que ya se cerró antes para trivia (migration_026),
-- ajedrez (migration_027) y el teléfono del 4ta Pared (migration_037), ver
-- comentario detallado en migration_026.sql.
-- ════════════════════════════════════════════════════════════════════════

-- ─── admin_id: destinatario cuando NO es un alumno ────────────────────────
-- Todas las notificaciones existentes usan student_id como destinatario
-- (a quién le llega). Para las nuevas (alumno → profesor) el destinatario
-- es admin_id — student_id se sigue llenando igual (de qué alumno se
-- trata), así el bell del admin puede seguir mostrando de quién es.
alter table public.student_notifications
  add column if not exists admin_id uuid references auth.users(id) on delete cascade;

drop policy if exists "notifications: student sees own" on public.student_notifications;
create policy "notifications: student sees own" on public.student_notifications
  for select using (auth.uid() = student_id or auth.uid() = admin_id or public.is_admin());

-- Alumno entrega una tarea o pregunta una duda → notifica al profesor que
-- la asignó. Sin vector de recompensa (mismo criterio que trivia/ajedrez) y
-- admin_id debe coincidir exactamente con quien asignó ESA tarea real, no
-- un admin arbitrario elegido por el cliente.
drop policy if exists "notifications: student notifies task admin" on public.student_notifications;
create policy "notifications: student notifies task admin" on public.student_notifications
  for insert with check (
    admin_id is not null
    and student_id = auth.uid()
    and coalesce(xp_reward, 0) = 0
    and coalesce(gold_reward, 0) = 0
    and task_id is not null
    and exists (
      select 1 from public.student_tasks t
      where t.id = task_id and t.student_id = auth.uid() and t.assigned_by = admin_id
    )
  );

-- Mismo criterio para proyectos: el alumno actualiza su proyecto asignado
-- (ej. lo marca completado) → notifica al profesor que lo asignó.
drop policy if exists "notifications: student notifies project admin" on public.student_notifications;
create policy "notifications: student notifies project admin" on public.student_notifications
  for insert with check (
    admin_id is not null
    and student_id = auth.uid()
    and coalesce(xp_reward, 0) = 0
    and coalesce(gold_reward, 0) = 0
    and project_id is not null
    and exists (
      select 1 from public.student_projects p
      where p.id = project_id and p.student_id = auth.uid() and p.assigned_by = admin_id
    )
  );

-- ─── Realtime en las tablas fuente ─────────────────────────────────────────
-- AdminTasksPage/AdminProjectsPage solo cargaban con fetch manual al montar
-- — sin esto, el admin nunca ve una entrega/pregunta/actualización nueva
-- hasta que recarga la página a mano, aunque la notificación sí le llegue.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'student_tasks'
  ) then
    alter publication supabase_realtime add table public.student_tasks;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'task_questions'
  ) then
    alter publication supabase_realtime add table public.task_questions;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'student_projects'
  ) then
    alter publication supabase_realtime add table public.student_projects;
  end if;
end $$;
