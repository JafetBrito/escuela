-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 051 — "El Oráculo de Oliver": generador de cursos con IA
-- ════════════════════════════════════════════════════════════════════════
-- Un alumno puede escribir un tema y su propia conexión de IA (BYOK, ver
-- useAiCredentialsStore.js) planea y escribe un curso completo (módulos +
-- quiz), que se guarda como una fila normal en `courses` (migration_024.sql)
-- y se reproduce con el mismo motor que cualquier otro curso
-- (LearningInterface.jsx) — no hay tabla nueva, solo dos columnas nuevas y
-- dos políticas RLS adicionales.
--
-- OJO: estos cursos NO aparecen en el catálogo general (src/data/courses.json
-- y sus ~14 consumidores) — a propósito, ver src/services/ai/courseGenerator.js
-- y src/components/oracle/OraclePage.jsx. Solo son alcanzables por su dueño,
-- vía /oraculo → "Mis Cursos IA" (que filtra por created_by = auth.uid()) o
-- conociendo el id exacto (/learn/:id).
alter table public.courses add column if not exists created_by uuid references auth.users(id);
alter table public.courses add column if not exists ai_generated boolean not null default false;

-- Políticas ADITIVAS: la policy "courses: admin writes" (for all, ver
-- migration_024.sql) sigue intacta — en RLS de Postgres, varias policies
-- permissive para el mismo comando se combinan con OR, así que un admin
-- sigue pudiendo escribir cualquier curso Y, aparte, cualquier usuario
-- autenticado puede insertar/actualizar SOLO su propio curso generado por IA.
drop policy if exists "courses: users insert their own ai-generated course" on public.courses;
create policy "courses: users insert their own ai-generated course" on public.courses
  for insert with check (created_by = auth.uid() and ai_generated = true);

drop policy if exists "courses: users update their own ai-generated course" on public.courses;
create policy "courses: users update their own ai-generated course" on public.courses
  for update using (public.is_admin() or (created_by = auth.uid() and ai_generated = true))
  with check (public.is_admin() or (created_by = auth.uid() and ai_generated = true));

-- La policy de SELECT ("courses: everyone reads") no se toca — estos cursos
-- no son descubribles en ningún catálogo, así que "todos leen" no filtra
-- nada realmente sensible (mismo criterio que ya aplica a los ~48 cursos
-- existentes).
