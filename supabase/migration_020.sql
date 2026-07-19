-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 020 — recompensa de graduación (XP/oro) por curso
-- ════════════════════════════════════════════════════════════════════════

-- Se entregan una sola vez, en el momento en que se crea la fila en
-- student_graduations (ver useExamsStore.js maybeCertify) — mismo patrón de
-- "propiedad del examen, configurable por el admin" que time_limit_minutes.
-- El ítem coleccionable de graduación (mencionado por el usuario, "aún no sé
-- qué item") queda pendiente de diseño — no se agrega columna para eso todavía.
alter table public.course_exams
  add column if not exists graduation_xp int not null default 1000,
  add column if not exists graduation_gold int not null default 20000;
