-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 011 — Entregas en Markdown + preguntas por tarea
-- ════════════════════════════════════════════════════════════════════════
-- Bucket de entregas .md — público (igual que class-resources), pero solo el
-- dueño (primer segmento de la ruta = su auth.uid()) o el admin puede subir/
-- borrar. Convención de ruta: {student_id}/{task_id}/{filename}

insert into storage.buckets (id, name, public)
  values ('task-submissions', 'task-submissions', true)
  on conflict (id) do nothing;

drop policy if exists "task-submissions: public read" on storage.objects;
create policy "task-submissions: public read" on storage.objects
  for select using (bucket_id = 'task-submissions');

drop policy if exists "task-submissions: owner or admin upload" on storage.objects;
create policy "task-submissions: owner or admin upload" on storage.objects
  for insert with check (bucket_id = 'task-submissions' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

drop policy if exists "task-submissions: owner or admin delete" on storage.objects;
create policy "task-submissions: owner or admin delete" on storage.objects
  for delete using (bucket_id = 'task-submissions' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

alter table public.student_tasks
  add column if not exists submission_url text,
  add column if not exists submission_filename text;

create table if not exists public.task_questions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.student_tasks(id) on delete cascade not null,
  student_id uuid references auth.users(id) on delete cascade not null,
  question text not null,
  answer text,
  answered boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.task_questions enable row level security;

drop policy if exists "task_questions: owner or admin select" on public.task_questions;
create policy "task_questions: owner or admin select" on public.task_questions
  for select using (auth.uid() = student_id or public.is_admin());

drop policy if exists "task_questions: student asks" on public.task_questions;
create policy "task_questions: student asks" on public.task_questions
  for insert with check (auth.uid() = student_id);

drop policy if exists "task_questions: admin answers" on public.task_questions;
create policy "task_questions: admin answers" on public.task_questions
  for update using (public.is_admin());
