-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 017 — exámenes multi-idioma (course_exams.translations)
-- ════════════════════════════════════════════════════════════════════════

-- Mismo espíritu que src/data/courseTranslations.js: el examen "base" (las
-- columnas title/questions ya existentes) vive en español; `translations`
-- guarda overrides completos por idioma — {"en": {"title": "...", "questions": [...]}}
-- — un idioma sin entrada aquí simplemente cae al español (ver
-- localizeExam() en useExamsStore.js). No se hace merge por pregunta (a
-- diferencia de los cursos, que sí mergean módulo por módulo) porque un
-- examen se traduce como un banco completo, no campo por campo.
alter table public.course_exams
  add column if not exists translations jsonb not null default '{}'::jsonb;
