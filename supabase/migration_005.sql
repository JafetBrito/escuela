-- migration_005: campos extra específicos por tipo de tarea (duración y
-- temario de examen, entregables de proyecto). Un solo jsonb en vez de
-- columnas sueltas por cada tipo — cada tipo solo usa las claves que le
-- aplican, el resto queda vacío.
alter table public.student_tasks
  add column if not exists details jsonb not null default '{}'::jsonb;

-- Shape esperado por tipo (documental, no forzado por constraint):
--   tarea:    {} (no usa detalles extra)
--   proyecto: { "deliverables": ["Entregable 1", "Entregable 2"] }
--   examen:   { "time": "14:30", "duration_minutes": 60, "modality": "Presencial", "topics": "Temas 1-4" }
