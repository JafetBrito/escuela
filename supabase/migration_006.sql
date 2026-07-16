-- migration_006: Mis Clases — clases en vivo (Google Meet externo) + Hub
-- sincronizado en tiempo real (agenda, recursos, preguntas). Corre este
-- script en Supabase SQL Editor, después de migration_005.

create table if not exists public.live_classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  meet_url text not null,
  scheduled_at timestamptz not null,
  status text not null default 'programada', -- programada | en_vivo | finalizada
  current_topic text,
  agenda jsonb not null default '[]'::jsonb,     -- [{ "label": "Introducción" }, ...]
  resources jsonb not null default '[]'::jsonb,  -- [{ "label": "Repo", "url": "..." }, ...]
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.live_classes enable row level security;

drop policy if exists "live_classes: everyone reads" on public.live_classes;
create policy "live_classes: everyone reads" on public.live_classes
  for select using (auth.uid() is not null);

drop policy if exists "live_classes: admin writes" on public.live_classes;
create policy "live_classes: admin writes" on public.live_classes
  for all using (public.is_admin());

-- ─── Preguntas en vivo ──────────────────────────────────────────────────────
create table if not exists public.live_class_questions (
  id uuid primary key default gen_random_uuid(),
  live_class_id uuid references public.live_classes(id) on delete cascade not null,
  student_id uuid references auth.users(id) on delete cascade not null,
  question text not null,
  answer text,
  answered boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.live_class_questions enable row level security;

drop policy if exists "live_class_questions: everyone reads" on public.live_class_questions;
create policy "live_class_questions: everyone reads" on public.live_class_questions
  for select using (auth.uid() is not null);

drop policy if exists "live_class_questions: student asks" on public.live_class_questions;
create policy "live_class_questions: student asks" on public.live_class_questions
  for insert with check (auth.uid() = student_id);

drop policy if exists "live_class_questions: admin answers" on public.live_class_questions;
create policy "live_class_questions: admin answers" on public.live_class_questions
  for update using (public.is_admin());

drop policy if exists "live_class_questions: admin deletes" on public.live_class_questions;
create policy "live_class_questions: admin deletes" on public.live_class_questions
  for delete using (public.is_admin());

-- ─── Tiempo real ────────────────────────────────────────────────────────────
-- Necesario para que los cambios (tema actual, nuevas preguntas) lleguen
-- instantáneamente a todos los alumnos conectados sin recargar la página.
alter publication supabase_realtime add table public.live_classes;
alter publication supabase_realtime add table public.live_class_questions;
