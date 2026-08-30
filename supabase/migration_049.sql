-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 049 — Envío de reflexión de clase (alumno → profesor). La
-- migration_048.sql ya construyó lesson_reflections y el lado de recepción
-- (TeacherReflectionsPage.jsx); esta migración es la mitad que faltaba: el
-- alumno también necesita poder AVISARLE al profesor que le llegó algo
-- nuevo, vía la misma tabla student_notifications que ya usan tareas/
-- proyectos (migration_047.sql). Esa tabla no tiene columnas para modelar
-- "destinatario = profesor, sobre una reflexión concreta" — se agregan aquí
-- en vez de reusar admin_id (que ya significa "profesor que asignó ESA
-- tarea/proyecto"): mezclar los dos conceptos en una sola columna sería
-- confuso a futuro aunque hoy funcionara igual de bien a nivel de tipos.
-- ════════════════════════════════════════════════════════════════════════

-- ─── Columnas nuevas ─────────────────────────────────────────────────────
alter table public.student_notifications
  add column if not exists teacher_id uuid references auth.users(id) on delete cascade;

alter table public.student_notifications
  add column if not exists reflection_id uuid references public.lesson_reflections(id) on delete cascade;

-- El alumno ya puede ver sus propias notificaciones (student_id = auth.uid()
-- en la política existente "notifications: student sees own" de
-- migration_047.sql) — falta que el PROFESOR vea las que le llegan a él vía
-- teacher_id, mismo criterio que esa política ya usa para admin_id.
drop policy if exists "notifications: student sees own" on public.student_notifications;
create policy "notifications: student sees own" on public.student_notifications
  for select using (
    auth.uid() = student_id or auth.uid() = admin_id or auth.uid() = teacher_id or public.is_admin()
  );

-- Alumno envía una reflexión de clase → notifica al profesor de ESA
-- reflexión concreta. Sin vector de recompensa (mismo criterio que
-- migration_047.sql) y teacher_id debe coincidir exactamente con el
-- profesor real de esa fila de lesson_reflections, no un profesor
-- arbitrario elegido por el cliente.
drop policy if exists "notifications: student notifies teacher of reflection" on public.student_notifications;
create policy "notifications: student notifies teacher of reflection" on public.student_notifications
  for insert with check (
    teacher_id is not null
    and student_id = auth.uid()
    and coalesce(xp_reward, 0) = 0
    and coalesce(gold_reward, 0) = 0
    and reflection_id is not null
    and exists (
      select 1 from public.lesson_reflections r
      where r.id = reflection_id and r.student_id = auth.uid() and r.teacher_id = teacher_id
    )
  );
