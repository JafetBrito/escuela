-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 012 — class_id en notificaciones (deep-link a "tu clase está en vivo")
-- ════════════════════════════════════════════════════════════════════════
-- Hasta ahora startClass() notificaba "tu clase está en vivo" sin guardar
-- qué clase era, así que la notificación no llevaba a ningún lado al hacer
-- clic. Con esta columna, el bell puede navegar directo a /mis-clases/:id.

alter table public.student_notifications
  add column if not exists class_id uuid references public.live_classes(id) on delete cascade;
