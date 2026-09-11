-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 064 — tabla `roadmaps`: rutas de aprendizaje visuales,
-- paralelo a `tutorials` (migration_063.sql) y `courses` (migration_024.sql).
--
-- `nodes` es un jsonb array de temas a aprender, cada uno con un enlace
-- OPCIONAL a un curso/tutorial real o a una URL externa — mismo patrón que
-- `courses.modules`/`trivia_questions.questions` (contenido en jsonb,
-- admin edita, todos leen). El PROGRESO por nodo (qué ha marcado cada
-- alumno) NO vive aquí — va en el snapshot unificado de profiles
-- (useRoadmapProgressStore.js + progressSnapshot.js), mismo criterio que
-- el resto de "flags de visto" del proyecto.
--
-- Sin bloqueo secuencial entre nodos (a propósito — "el orden no es
-- estricto en un roadmap", cualquier nodo se puede marcar aprendido en
-- cualquier momento) y ya con `ai_generated`/`created_by`/`review_status`
-- reservadas para cuando el Oráculo también genere road maps.
-- ════════════════════════════════════════════════════════════════════════
create table if not exists public.roadmaps (
  id text primary key,
  title text not null,
  description text,
  icon text,
  color text,
  category text,
  nodes jsonb not null default '[]'::jsonb,
  -- cada nodo: { id, title, description, linkType: null|'course'|'tutorial'|'external', linkId, linkUrl }
  locked boolean not null default false,
  translations jsonb not null default '{}'::jsonb,
  ai_generated boolean not null default false,
  created_by uuid references auth.users(id),
  review_status text,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.roadmaps enable row level security;

drop policy if exists "roadmaps: everyone reads" on public.roadmaps;
create policy "roadmaps: everyone reads" on public.roadmaps
  for select using (auth.uid() is not null);

drop policy if exists "roadmaps: admin writes" on public.roadmaps;
create policy "roadmaps: admin writes" on public.roadmaps
  for all using (public.is_admin()) with check (public.is_admin());
