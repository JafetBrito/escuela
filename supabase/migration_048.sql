-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 048 — Rol de profesor real. Hasta ahora la app solo conocía
-- 'admin' y 'student' — `categoryMeta.js`'s teacherName/teacherPrompt son
-- solo personalidad de chat de la mascota IA por categoría, sin ninguna
-- cuenta real detrás. Esto agrega un tercer rol de verdad: un profesor ve
-- sus propios cursos asignados (courses.teacher_id) y recibe reflexiones de
-- clase de sus alumnos (lesson_reflections — el envío desde el alumno es
-- otro feature, todavía sin construir, esto solo es el lado de recepción +
-- el perfil público del profesor). `profiles.role` sigue siendo un text sin
-- constraint (ver schema.sql), así que agregar este tercer valor no toca esa
-- columna.
-- ════════════════════════════════════════════════════════════════════════

-- ─── is_teacher(): mismo patrón que is_admin() (schema.sql) ────────────────
create or replace function public.is_teacher()
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'teacher'
  );
$$;

-- ─── Bio pública del profesor ───────────────────────────────────────────
alter table public.profiles add column if not exists teacher_bio text;

-- Hoy "profiles: select own" (auth.uid() = id) es la ÚNICA política de
-- select que no exige ser admin — un alumno no puede leer display_name/
-- avatar_url/teacher_bio de NINGÚN otro perfil, ni siquiera el de su propio
-- profesor. Sin esto, "mostrar el perfil público del profesor en un curso"
-- se rompería en silencio para cualquiera que no sea ese mismo profesor o
-- un admin.
drop policy if exists "profiles: anyone can view teacher profiles" on public.profiles;
create policy "profiles: anyone can view teacher profiles" on public.profiles
  for select using (role = 'teacher');

-- ─── Autoría de curso ────────────────────────────────────────────────────
-- Nullable a propósito — los cursos existentes se quedan sin profesor
-- asignado hasta que un admin elija uno desde /admin/cursos, no se
-- backfillea nada. Solo lectura para el profesor — "courses: everyone
-- reads" (migration_024.sql) ya alcanza para que vea sus propios cursos
-- asignados sin política nueva; editar contenido de curso sigue 100%
-- admin-only.
alter table public.courses add column if not exists teacher_id uuid references auth.users(id);

-- ─── lesson_reflections: bandeja de entrada del profesor ────────────────
-- El alumno manda una reflexión corta sobre una clase a su profesor (esa
-- mitad — el envío — es de otro agente); esta tabla y sus políticas son la
-- mitad de recepción. Sin políticas de update/delete a propósito: nadie
-- edita una reflexión ya enviada.
create table if not exists public.lesson_reflections (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  module_id text,
  teacher_id uuid references auth.users(id),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists lesson_reflections_teacher_idx on public.lesson_reflections (teacher_id, created_at);

alter table public.lesson_reflections enable row level security;

drop policy if exists "lesson_reflections: student inserts own" on public.lesson_reflections;
create policy "lesson_reflections: student inserts own" on public.lesson_reflections
  for insert with check (student_id = auth.uid());

drop policy if exists "lesson_reflections: student sees own" on public.lesson_reflections;
create policy "lesson_reflections: student sees own" on public.lesson_reflections
  for select using (student_id = auth.uid());

drop policy if exists "lesson_reflections: teacher sees own inbox" on public.lesson_reflections;
create policy "lesson_reflections: teacher sees own inbox" on public.lesson_reflections
  for select using (teacher_id = auth.uid());

drop policy if exists "lesson_reflections: admin sees all" on public.lesson_reflections;
create policy "lesson_reflections: admin sees all" on public.lesson_reflections
  for select using (public.is_admin());

-- ─── Realtime ────────────────────────────────────────────────────────────
-- Para que la bandeja del profesor (TeacherReflectionsPage.jsx) vea una
-- reflexión nueva sin recargar a mano — mismo patrón que migration_047.sql.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'lesson_reflections'
  ) then
    alter publication supabase_realtime add table public.lesson_reflections;
  end if;
end $$;
