-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 015 — recompensas XP/oro en tareas y clases, misión real
-- adjunta a clases, y esqueleto de examen final por curso (graduación)
-- ════════════════════════════════════════════════════════════════════════

-- Recompensa configurable por el admin — se entrega al calificar la tarea
-- (gradeTask) o al finalizar la clase (endClass), nunca antes, para evitar
-- premiar una entrega que después se rechaza.
alter table public.student_tasks
  add column if not exists xp_reward int not null default 0,
  add column if not exists gold_reward int not null default 0;

alter table public.live_classes
  add column if not exists xp_reward int not null default 0,
  add column if not exists gold_reward int not null default 0,
  add column if not exists linked_mission jsonb;

-- Vehículo de entrega: la recompensa viaja en la misma notificación que ya
-- se le empuja al alumno (student_notifications), y su propio cliente la
-- "reclama" (le suma XP/oro a sus stores locales) la primera vez que la ve,
-- marcando reward_claimed_at para no duplicarla si la notificación se vuelve
-- a cargar. No existe otro canal para que el cliente del ADMIN le entregue
-- algo al cliente del ALUMNO — el XP/oro solo vive en el store local de cada
-- quien lo gana.
alter table public.student_notifications
  add column if not exists xp_reward int not null default 0,
  add column if not exists gold_reward int not null default 0,
  add column if not exists reward_claimed_at timestamptz;

-- ── Examen final por curso (graduación) ────────────────────────────────────
-- Un examen por curso; el admin escribe un banco de preguntas y cuántas se
-- muestran por intento (se eligen al azar, ver useExamsStore.js). El shape
-- de cada pregunta en `questions`:
--   { id, question, options: [string x4], correct: 0-3 }
create table if not exists public.course_exams (
  id uuid primary key default gen_random_uuid(),
  course_id text not null unique,
  title text not null default 'Examen final',
  pass_score int not null default 70,
  questions_to_show int not null default 15,
  questions jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.course_exams enable row level security;

drop policy if exists "course_exams: everyone reads" on public.course_exams;
create policy "course_exams: everyone reads" on public.course_exams
  for select using (auth.uid() is not null);

drop policy if exists "course_exams: admin writes" on public.course_exams;
create policy "course_exams: admin writes" on public.course_exams
  for all using (public.is_admin()) with check (public.is_admin());

-- Cada intento guarda una "foto" de las preguntas mostradas (con su
-- respuesta correcta) junto con lo que el alumno contestó, para que la nota
-- quede fija aunque el admin edite el banco después.
create table if not exists public.student_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references public.course_exams(id) on delete cascade not null,
  student_id uuid references auth.users(id) on delete cascade not null,
  course_id text not null,
  shown_questions jsonb not null,
  answers jsonb not null default '[]'::jsonb,
  score numeric(5,2) not null default 0,
  passed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.student_exam_attempts enable row level security;

drop policy if exists "exam_attempts: owner or admin select" on public.student_exam_attempts;
create policy "exam_attempts: owner or admin select" on public.student_exam_attempts
  for select using (auth.uid() = student_id or public.is_admin());

drop policy if exists "exam_attempts: student submits own" on public.student_exam_attempts;
create policy "exam_attempts: student submits own" on public.student_exam_attempts
  for insert with check (auth.uid() = student_id);

-- Un alumno se "gradúa" de un curso cuando aprueba su examen final (además
-- de tener todas sus tareas de ese curso calificadas — ver useExamsStore.js
-- fetchEligibility, que usa student_tasks.details->linkedLesson.courseId).
create table if not exists public.student_graduations (
  student_id uuid references auth.users(id) on delete cascade not null,
  course_id text not null,
  graduated_at timestamptz not null default now(),
  primary key (student_id, course_id)
);

alter table public.student_graduations enable row level security;

drop policy if exists "graduations: owner or admin select" on public.student_graduations;
create policy "graduations: owner or admin select" on public.student_graduations
  for select using (auth.uid() = student_id or public.is_admin());

drop policy if exists "graduations: student inserts own" on public.student_graduations;
create policy "graduations: student inserts own" on public.student_graduations
  for insert with check (auth.uid() = student_id);
