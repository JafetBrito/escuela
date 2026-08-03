-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 023 — el alumno puede borrar sus propias notificaciones
-- ════════════════════════════════════════════════════════════════════════

-- "notifications: student sees own" (migración 004) solo cubre SELECT/UPDATE
-- — faltaba DELETE, así que el botón de borrar del NotificationBell
-- rediseñado necesita esta política nueva para funcionar contra Supabase.
drop policy if exists "notifications: student deletes own" on public.student_notifications;
create policy "notifications: student deletes own" on public.student_notifications
  for delete using (auth.uid() = student_id);
