-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 013 — el admin también puede enviar ping ("atención") al alumno
-- ════════════════════════════════════════════════════════════════════════
-- Hasta ahora solo el alumno podía insertar en live_class_pings (mano/ping).
-- Se agrega una política adicional para que el admin también pueda insertar
-- un ping (kind='atencion') dirigido a un alumno — Postgres combina varias
-- políticas permisivas de insert con OR, así que esto no toca la existente.

drop policy if exists "live_class_pings: admin sends" on public.live_class_pings;
create policy "live_class_pings: admin sends" on public.live_class_pings
  for insert with check (public.is_admin());
