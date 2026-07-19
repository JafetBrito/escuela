-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 019 — límite de tiempo por examen (course_exams.time_limit_minutes)
-- ════════════════════════════════════════════════════════════════════════

-- Mismo tipo de propiedad "del examen, no del idioma" que pass_score/
-- questions_to_show (ver AdminExamsPage.jsx) — 30 minutos por defecto.
-- El campo `image` opcional de cada pregunta (banco `questions` jsonb) no
-- necesita columna propia: ya vive dentro del jsonb existente.
alter table public.course_exams
  add column if not exists time_limit_minutes int not null default 30;
