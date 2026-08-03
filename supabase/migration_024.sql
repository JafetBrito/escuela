-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 024 — tabla `courses`: contenido de cursos editable en vivo
-- ════════════════════════════════════════════════════════════════════════
-- Hasta ahora el contenido de cada curso vivía hardcodeado en archivos JS/JSON
-- (src/data/course*.js, src/data/courses.json) — cualquier ajuste a una clase
-- necesitaba que se editara código y se hiciera un deploy. Esta tabla junta lo
-- que hoy son dos fuentes separadas (el catálogo de courses.json + el
-- contenido de courseRegistry.js) en una sola fila por curso, para que un
-- admin pueda editarla desde /admin/cursos sin tocar código. `modules` se
-- queda como jsonb (no normalizado por módulo) siguiendo el mismo patrón que
-- ya usa course_exams.questions — el shape de un módulo ya es heterogéneo
-- según su `type` (text/video/vr/slideshow/audio/embed), normalizarlo no
-- ahorra nada hoy.
create table if not exists public.courses (
  id text primary key,             -- antes: courseId dentro de cada archivo JS, ej. 'course-003'
  title text not null,
  description text,
  ai_instructions text,
  icon text,
  color text,
  category text,
  subcategory text,
  difficulty text,                 -- 'principiante' | 'intermedio' | 'avanzado', puede ser null
  locked boolean not null default false,
  modules jsonb not null default '[]'::jsonb,
  translations jsonb not null default '{}'::jsonb,  -- overlays por idioma, mismo patrón que course_exams.translations
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses enable row level security;

drop policy if exists "courses: everyone reads" on public.courses;
create policy "courses: everyone reads" on public.courses
  for select using (auth.uid() is not null);

drop policy if exists "courses: admin writes" on public.courses;
create policy "courses: admin writes" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());
