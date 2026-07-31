-- run_all.sql — TODAS las migraciones (001 a 008) + los datos de prueba
-- (demo_seed) en un solo script. Pega esto completo en el SQL Editor de
-- Supabase y dale Run una sola vez.
--
-- Es seguro correrlo más de una vez (todo usa IF NOT EXISTS / ON CONFLICT /
-- DROP POLICY IF EXISTS) — si algo ya estaba aplicado, simplemente no hace
-- nada en esa parte y sigue con el resto.
--
-- Los archivos migration_001.sql … migration_008.sql y demo_seed.sql se
-- mantienen por separado como referencia/documentación de cada cambio; este
-- archivo es solo la copia concatenada para correr todo de un jalón.


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 001 — Sistema de mascotas múltiples + tutorial
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nickname           TEXT,
  ADD COLUMN IF NOT EXISTS avatar_registry_id INT DEFAULT 8,
  ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.user_mascots (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registry_id   INT         NOT NULL,
  nickname      TEXT        NOT NULL DEFAULT 'Mi compañero',
  class_id      TEXT,
  skills        JSONB       NOT NULL DEFAULT '{"unlocked":[],"equipped":[],"talentPoints":3}',
  hp_max        INT         NOT NULL DEFAULT 80,
  is_active     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ          DEFAULT now()
);

ALTER TABLE public.user_mascots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_mascots: select own" ON public.user_mascots;
CREATE POLICY "user_mascots: select own" ON public.user_mascots
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_mascots: insert own" ON public.user_mascots;
CREATE POLICY "user_mascots: insert own" ON public.user_mascots
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_mascots: update own" ON public.user_mascots;
CREATE POLICY "user_mascots: update own" ON public.user_mascots
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_mascots: delete own" ON public.user_mascots;
CREATE POLICY "user_mascots: delete own" ON public.user_mascots
  FOR DELETE USING (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS user_mascots_one_active
  ON public.user_mascots (user_id) WHERE is_active;


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 002 — Mi Equipo: entity_progress, item_types, player_items,
--                             player_equipment
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.entity_progress (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_id   TEXT        NOT NULL,
  level       INTEGER     NOT NULL DEFAULT 1  CHECK (level >= 1),
  current_xp  INTEGER     NOT NULL DEFAULT 0  CHECK (current_xp >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT entity_progress_user_entity UNIQUE (user_id, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_entity_progress_user
  ON public.entity_progress (user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_ep_updated_at ON public.entity_progress;
CREATE TRIGGER trg_ep_updated_at
  BEFORE UPDATE ON public.entity_progress
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.entity_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ep_owner" ON public.entity_progress;
CREATE POLICY "ep_owner" ON public.entity_progress
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.item_types (
  id          TEXT        NOT NULL PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT,
  icon        TEXT,
  kind        TEXT        NOT NULL DEFAULT 'consumable',
  rarity      TEXT        NOT NULL DEFAULT 'common',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.item_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "it_public_read" ON public.item_types;
CREATE POLICY "it_public_read" ON public.item_types
  FOR SELECT USING (true);

INSERT INTO public.item_types (id, name, description, icon, kind, rarity) VALUES
  ('radio',              'Radio',               'Mini reproductor de música portátil',       '📻', 'radio-player', 'common'),
  ('camara',             'Cámara',              'Toma fotos de tus aventuras',               '📷', 'equipment',    'common'),
  ('libro-python',       'Libro: Python',       'Referencia de programación en Python',      '📗', 'equipment',    'common'),
  ('libro-ia',           'Libro: IA',           'Introducción práctica a la IA',             '📘', 'equipment',    'common'),
  ('calavera-de-guldan', 'Calavera de Gul''dan','Artefacto legendario. Otorga sabiduría oscura.', '💀', 'equipment', 'legendary'),
  ('bola-de-nieve',      'Bola de Nieve',       'Lanzable en el mundo VR. Efecto estético.', '❄️', 'consumable',  'common')
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  icon        = EXCLUDED.icon,
  kind        = EXCLUDED.kind,
  rarity      = EXCLUDED.rarity;

CREATE TABLE IF NOT EXISTS public.player_items (
  id           UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type_id TEXT        NOT NULL REFERENCES public.item_types(id),
  quantity     INTEGER     NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  acquired_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pi_user_item UNIQUE (user_id, item_type_id)
);

CREATE INDEX IF NOT EXISTS idx_player_items_user
  ON public.player_items (user_id);

ALTER TABLE public.player_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pi_owner" ON public.player_items;
CREATE POLICY "pi_owner" ON public.player_items
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.player_equipment (
  id           UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_id    TEXT        NOT NULL,
  slot         TEXT        NOT NULL,
  item_type_id TEXT        REFERENCES public.item_types(id) ON DELETE SET NULL,
  equipped_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pe_user_entity_slot UNIQUE (user_id, entity_id, slot)
);

CREATE INDEX IF NOT EXISTS idx_player_equipment_user
  ON public.player_equipment (user_id);

ALTER TABLE public.player_equipment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pe_owner" ON public.player_equipment;
CREATE POLICY "pe_owner" ON public.player_equipment
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.equip_item(
  p_entity_id    TEXT,
  p_slot         TEXT,
  p_item_type_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_item_type_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.player_items
    WHERE user_id = auth.uid()
      AND item_type_id = p_item_type_id
      AND quantity > 0
  ) THEN
    RAISE EXCEPTION 'El usuario no posee el ítem: %', p_item_type_id;
  END IF;

  INSERT INTO public.player_equipment (user_id, entity_id, slot, item_type_id, equipped_at)
  VALUES (auth.uid(), p_entity_id, p_slot, p_item_type_id, now())
  ON CONFLICT (user_id, entity_id, slot)
  DO UPDATE SET item_type_id = EXCLUDED.item_type_id, equipped_at = now();
END;
$$;

INSERT INTO public.entity_progress (user_id, entity_id, level, current_xp)
SELECT id, 'avatar', 1, 0 FROM auth.users
ON CONFLICT (user_id, entity_id) DO NOTHING;

INSERT INTO public.entity_progress (user_id, entity_id, level, current_xp)
SELECT id, 'mascota', 1, 0 FROM auth.users
ON CONFLICT (user_id, entity_id) DO NOTHING;

DO $$
DECLARE
  v_slots    TEXT[] := ARRAY['weapon','head','body','accessory','relic'];
  v_entities TEXT[] := ARRAY['avatar','mascota'];
  v_slot     TEXT;
  v_entity   TEXT;
BEGIN
  FOREACH v_entity IN ARRAY v_entities LOOP
    FOREACH v_slot IN ARRAY v_slots LOOP
      INSERT INTO public.player_equipment (user_id, entity_id, slot, item_type_id)
      SELECT id, v_entity, v_slot, NULL FROM auth.users
      ON CONFLICT (user_id, entity_id, slot) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 003 — tareas de alumnos, anuncios escolares y config de plataforma
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  )
$$;

drop policy if exists "profiles: admin select all" on public.profiles;
create policy "profiles: admin select all" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create table if not exists public.student_tasks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  subject text,
  due_date date,
  status text not null default 'pendiente',
  grade numeric(5,2),
  grade_max numeric(5,2) default 10,
  feedback text,
  assigned_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_tasks enable row level security;

drop policy if exists "tasks: student sees own" on public.student_tasks;
create policy "tasks: student sees own" on public.student_tasks
  for select using (auth.uid() = student_id or public.is_admin());

drop policy if exists "tasks: student can submit" on public.student_tasks;
create policy "tasks: student can submit" on public.student_tasks
  for update using (auth.uid() = student_id)
  with check (status = 'entregada');

drop policy if exists "tasks: admin full access" on public.student_tasks;
create policy "tasks: admin full access" on public.student_tasks
  for all using (public.is_admin());

create table if not exists public.school_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  icon text not null default '📢',
  category text not null default 'general',
  pinned boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.school_announcements enable row level security;

drop policy if exists "announcements: all can read" on public.school_announcements;
create policy "announcements: all can read" on public.school_announcements
  for select using (auth.role() = 'authenticated');

drop policy if exists "announcements: admin write" on public.school_announcements;
create policy "announcements: admin write" on public.school_announcements
  for all using (public.is_admin());

create table if not exists public.platform_settings (
  key text primary key,
  value jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.platform_settings enable row level security;

drop policy if exists "platform_settings: all read" on public.platform_settings;
create policy "platform_settings: all read" on public.platform_settings
  for select using (auth.role() = 'authenticated');

drop policy if exists "platform_settings: admin write" on public.platform_settings;
create policy "platform_settings: admin write" on public.platform_settings
  for all using (public.is_admin());

insert into public.platform_settings (key, value)
  values ('holiday_theme', '"none"')
  on conflict (key) do nothing;


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 004 — tipos de tarea (Tarea/Proyecto/Examen) + notificaciones
-- ════════════════════════════════════════════════════════════════════════

alter table public.student_tasks
  add column if not exists type text not null default 'tarea';

create table if not exists public.student_notifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade not null,
  task_id uuid references public.student_tasks(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.student_notifications enable row level security;

drop policy if exists "notifications: student sees own" on public.student_notifications;
create policy "notifications: student sees own" on public.student_notifications
  for select using (auth.uid() = student_id or public.is_admin());

drop policy if exists "notifications: student marks read" on public.student_notifications;
create policy "notifications: student marks read" on public.student_notifications
  for update using (auth.uid() = student_id);

drop policy if exists "notifications: admin creates" on public.student_notifications;
create policy "notifications: admin creates" on public.student_notifications
  for insert with check (public.is_admin());


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 005 — campos extra por tipo de tarea (details jsonb)
-- ════════════════════════════════════════════════════════════════════════

alter table public.student_tasks
  add column if not exists details jsonb not null default '{}'::jsonb;


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 006 — Mis Clases: clases en vivo + Hub en tiempo real
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.live_classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  meet_url text not null,
  scheduled_at timestamptz not null,
  status text not null default 'programada',
  current_topic text,
  agenda jsonb not null default '[]'::jsonb,
  resources jsonb not null default '[]'::jsonb,
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

-- Agregar tablas a la publicación de Realtime solo si no están ya —
-- ALTER PUBLICATION ... ADD TABLE truena si se corre dos veces sin este guard.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'live_classes'
  ) then
    alter publication supabase_realtime add table public.live_classes;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'live_class_questions'
  ) then
    alter publication supabase_realtime add table public.live_class_questions;
  end if;
end $$;


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 007 — Mis Clases v2: clase por alumno, misiones, subida de PDFs
-- ════════════════════════════════════════════════════════════════════════

alter table public.live_classes add column if not exists student_id uuid references auth.users(id);
alter table public.live_classes add column if not exists missions jsonb not null default '[]'::jsonb;

drop policy if exists "live_classes: everyone reads" on public.live_classes;
drop policy if exists "live_classes: read own or admin" on public.live_classes;
create policy "live_classes: read own or admin" on public.live_classes
  for select using (public.is_admin() or student_id is null or student_id = auth.uid());

insert into storage.buckets (id, name, public)
  values ('class-resources', 'class-resources', true)
  on conflict (id) do nothing;

drop policy if exists "class-resources: public read" on storage.objects;
create policy "class-resources: public read" on storage.objects
  for select using (bucket_id = 'class-resources');

drop policy if exists "class-resources: admin upload" on storage.objects;
create policy "class-resources: admin upload" on storage.objects
  for insert with check (bucket_id = 'class-resources' and public.is_admin());

drop policy if exists "class-resources: admin delete" on storage.objects;
create policy "class-resources: admin delete" on storage.objects
  for delete using (bucket_id = 'class-resources' and public.is_admin());


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 008 — video de prueba para clases en vivo (demo_video_id)
-- ════════════════════════════════════════════════════════════════════════

alter table public.live_classes add column if not exists demo_video_id text;


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 009 — acciones rápidas (mano/ping) + chat global de Clase Online
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.live_class_pings (
  id uuid primary key default gen_random_uuid(),
  live_class_id uuid references public.live_classes(id) on delete cascade not null,
  student_id uuid references auth.users(id) on delete cascade not null,
  kind text not null default 'mano',
  created_at timestamptz not null default now()
);

alter table public.live_class_pings enable row level security;

drop policy if exists "live_class_pings: admin or own" on public.live_class_pings;
create policy "live_class_pings: admin or own" on public.live_class_pings
  for select using (public.is_admin() or student_id = auth.uid());

drop policy if exists "live_class_pings: student sends" on public.live_class_pings;
create policy "live_class_pings: student sends" on public.live_class_pings
  for insert with check (auth.uid() = student_id);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'live_class_pings'
  ) then
    alter publication supabase_realtime add table public.live_class_pings;
  end if;
end $$;

create table if not exists public.online_chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  display_name text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.online_chat_messages enable row level security;

drop policy if exists "online_chat: everyone reads" on public.online_chat_messages;
create policy "online_chat: everyone reads" on public.online_chat_messages
  for select using (auth.uid() is not null);

drop policy if exists "online_chat: sends own" on public.online_chat_messages;
create policy "online_chat: sends own" on public.online_chat_messages
  for insert with check (auth.uid() = user_id);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'online_chat_messages'
  ) then
    alter publication supabase_realtime add table public.online_chat_messages;
  end if;
end $$;


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 010 — Proyectos (student_projects)
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.student_projects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'en_progreso',
  notes jsonb not null default '[]'::jsonb,
  checklist jsonb not null default '[]'::jsonb,
  resources jsonb not null default '[]'::jsonb,
  assigned_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_projects enable row level security;

drop policy if exists "projects: owner or admin" on public.student_projects;
create policy "projects: owner or admin" on public.student_projects
  for all using (auth.uid() = student_id or public.is_admin())
  with check (auth.uid() = student_id or public.is_admin());

alter table public.student_notifications
  add column if not exists project_id uuid references public.student_projects(id) on delete cascade;


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 011 — Entregas en Markdown + preguntas por tarea
-- ════════════════════════════════════════════════════════════════════════

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


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 012 — class_id en notificaciones
-- ════════════════════════════════════════════════════════════════════════

alter table public.student_notifications
  add column if not exists class_id uuid references public.live_classes(id) on delete cascade;


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 013 — el admin también puede enviar ping ("atención") al alumno
-- ════════════════════════════════════════════════════════════════════════

drop policy if exists "live_class_pings: admin sends" on public.live_class_pings;
create policy "live_class_pings: admin sends" on public.live_class_pings
  for insert with check (public.is_admin());


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 014 — nombre del alumno en la clase + chat temporal por clase
-- ════════════════════════════════════════════════════════════════════════

alter table public.live_classes
  add column if not exists student_name text;

create table if not exists public.live_class_chat (
  id uuid primary key default gen_random_uuid(),
  live_class_id uuid references public.live_classes(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  display_name text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.live_class_chat enable row level security;

drop policy if exists "live_class_chat: participant select" on public.live_class_chat;
create policy "live_class_chat: participant select" on public.live_class_chat
  for select using (
    public.is_admin() or
    exists (select 1 from public.live_classes c where c.id = live_class_id and (c.student_id = auth.uid() or c.student_id is null))
  );

drop policy if exists "live_class_chat: participant insert" on public.live_class_chat;
create policy "live_class_chat: participant insert" on public.live_class_chat
  for insert with check (
    auth.uid() = user_id and (
      public.is_admin() or
      exists (select 1 from public.live_classes c where c.id = live_class_id and (c.student_id = auth.uid() or c.student_id is null))
    )
  );

drop policy if exists "live_class_chat: admin deletes" on public.live_class_chat;
create policy "live_class_chat: admin deletes" on public.live_class_chat
  for delete using (public.is_admin());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'live_class_chat'
  ) then
    alter publication supabase_realtime add table public.live_class_chat;
  end if;
end $$;


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 015 — recompensas XP/oro en tareas y clases, misión real
-- adjunta a clases, y esqueleto de examen final por curso (graduación)
-- ════════════════════════════════════════════════════════════════════════

alter table public.student_tasks
  add column if not exists xp_reward int not null default 0,
  add column if not exists gold_reward int not null default 0;

alter table public.live_classes
  add column if not exists xp_reward int not null default 0,
  add column if not exists gold_reward int not null default 0,
  add column if not exists linked_mission jsonb;

alter table public.student_notifications
  add column if not exists xp_reward int not null default 0,
  add column if not exists gold_reward int not null default 0,
  add column if not exists reward_claimed_at timestamptz;

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


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 016 — ajedrez en línea: invitar por username, partidas con reloj
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.search_profiles(query text)
returns table (id uuid, display_name text, email text)
language sql
security definer
stable
as $$
  select p.id, p.display_name, p.email
  from public.profiles p
  where p.id <> auth.uid()
    and (p.display_name ilike '%' || query || '%' or p.email ilike '%' || query || '%')
  order by p.display_name
  limit 20
$$;

grant execute on function public.search_profiles(text) to authenticated;

create table if not exists public.chess_invites (
  id uuid primary key default gen_random_uuid(),
  from_id uuid references auth.users(id) on delete cascade not null,
  from_name text,
  to_id uuid references auth.users(id) on delete cascade not null,
  to_name text,
  variant text not null default 'standard',
  clock_minutes int not null default 10,
  status text not null default 'pendiente',
  game_id uuid,
  created_at timestamptz not null default now()
);

alter table public.chess_invites enable row level security;

drop policy if exists "chess_invites: participant select" on public.chess_invites;
create policy "chess_invites: participant select" on public.chess_invites
  for select using (auth.uid() in (from_id, to_id) or public.is_admin());

drop policy if exists "chess_invites: sender inserts" on public.chess_invites;
create policy "chess_invites: sender inserts" on public.chess_invites
  for insert with check (auth.uid() = from_id);

drop policy if exists "chess_invites: participant updates" on public.chess_invites;
create policy "chess_invites: participant updates" on public.chess_invites
  for update using (auth.uid() in (from_id, to_id));

create table if not exists public.chess_games (
  id uuid primary key default gen_random_uuid(),
  white_id uuid references auth.users(id) on delete cascade not null,
  white_name text,
  black_id uuid references auth.users(id) on delete cascade not null,
  black_name text,
  variant text not null default 'standard',
  fen text not null,
  history jsonb not null default '[]'::jsonb,
  status text not null default 'en_curso',
  result text,
  end_reason text,
  clock_minutes int not null default 10,
  white_ms int not null default 0,
  black_ms int not null default 0,
  turn_started_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chess_games enable row level security;

drop policy if exists "chess_games: participant select" on public.chess_games;
create policy "chess_games: participant select" on public.chess_games
  for select using (auth.uid() in (white_id, black_id) or public.is_admin());

drop policy if exists "chess_games: participant inserts" on public.chess_games;
create policy "chess_games: participant inserts" on public.chess_games
  for insert with check (auth.uid() in (white_id, black_id));

drop policy if exists "chess_games: participant updates" on public.chess_games;
create policy "chess_games: participant updates" on public.chess_games
  for update using (auth.uid() in (white_id, black_id));

alter table public.student_notifications
  add column if not exists chess_invite_id uuid references public.chess_invites(id) on delete cascade;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chess_invites'
  ) then
    alter publication supabase_realtime add table public.chess_invites;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chess_games'
  ) then
    alter publication supabase_realtime add table public.chess_games;
  end if;
end $$;


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 017 — exámenes multi-idioma (course_exams.translations)
-- ════════════════════════════════════════════════════════════════════════

alter table public.course_exams
  add column if not exists translations jsonb not null default '{}'::jsonb;


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 018 — Podcasts (playlist de YouTube)
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.podcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  youtube_id text not null,
  position int not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.podcasts enable row level security;

drop policy if exists "podcasts: everyone reads" on public.podcasts;
create policy "podcasts: everyone reads" on public.podcasts
  for select using (auth.uid() is not null);

drop policy if exists "podcasts: admin writes" on public.podcasts;
create policy "podcasts: admin writes" on public.podcasts
  for all using (public.is_admin()) with check (public.is_admin());


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 019 — límite de tiempo por examen (course_exams.time_limit_minutes)
-- ════════════════════════════════════════════════════════════════════════

alter table public.course_exams
  add column if not exists time_limit_minutes int not null default 30;


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 020 — recompensa de graduación (XP/oro) por curso
-- ════════════════════════════════════════════════════════════════════════

alter table public.course_exams
  add column if not exists graduation_xp int not null default 1000,
  add column if not exists graduation_gold int not null default 20000;


-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 021 — perfil de edad por cuenta (niños / normal / abuelos)
-- ════════════════════════════════════════════════════════════════════════

alter table public.profiles
  add column if not exists age_profile text not null default 'normal';

do $$ begin
  alter table public.profiles
    add constraint profiles_age_profile_check
    check (age_profile in ('kids', 'normal', 'seniors'));
exception when duplicate_object then null;
end $$;


-- ════════════════════════════════════════════════════════════════════════
-- DEMO SEED — datos de prueba (🧪 DEMO — ...) para /mis-tareas, /anuncios,
-- /mis-clases y /clases-disponibles
-- ════════════════════════════════════════════════════════════════════════

do $$
declare
  demo_student uuid;
  demo_admin   uuid;
  t1 uuid; t2 uuid; t3 uuid; t4 uuid; t5 uuid;
begin
  select id into demo_student from public.profiles where role = 'student' order by updated_at asc limit 1;
  select id into demo_admin   from public.profiles where role = 'admin'   order by updated_at asc limit 1;

  if demo_student is null then
    raise notice 'No hay ningún alumno (role=student) todavía — crea una cuenta normal primero y vuelve a correr este script.';
    return;
  end if;

  insert into public.live_classes (title, description, meet_url, scheduled_at, status, current_topic, agenda, resources, missions, student_id, created_by, demo_video_id)
  values (
    '🧪 DEMO — Clase en vivo ahora mismo',
    'Repaso de closures y scope en JavaScript.',
    'https://meet.jit.si/OliverAcademy-demo-live',
    now() - interval '10 minutes',
    'en_vivo',
    'Closures: ejemplo con contador',
    '[{"label":"Repaso de scope"},{"label":"Closures: ejemplo con contador"},{"label":"Ejercicio en vivo"},{"label":"Preguntas"}]'::jsonb,
    '[{"label":"Diapositiva de portada","url":"https://picsum.photos/seed/oliver1/400/300","type":"image"},{"label":"Guía de la clase (PDF)","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","type":"pdf"},{"label":"Repo de ejemplos","url":"https://github.com"}]'::jsonb,
    '[{"title":"Escribe una función contador con closure","description":"Usa el patrón visto en clase y pruébalo en la consola."}]'::jsonb,
    demo_student, demo_admin, 'aqz-KE-bpKQ'
  );

  insert into public.live_classes (title, description, meet_url, scheduled_at, status, student_id, created_by)
  values (
    '🧪 DEMO — Empieza en 5 minutos',
    'Clase de práctica — el enlace ya debería estar desbloqueado.',
    'https://meet.jit.si/OliverAcademy-demo-soon',
    now() + interval '5 minutes',
    'programada',
    demo_student, demo_admin
  );

  insert into public.live_classes (title, description, meet_url, scheduled_at, status, student_id, created_by)
  values (
    '🧪 DEMO — Mañana',
    'Clase programada, todavía bloqueada.',
    'https://meet.jit.si/OliverAcademy-demo-tomorrow',
    now() + interval '1 day',
    'programada',
    demo_student, demo_admin
  );

  insert into public.live_classes (title, description, meet_url, scheduled_at, status, student_id, created_by)
  values (
    '🧪 DEMO — Más avanzada esta semana',
    'Otra clase programada para probar el calendario semanal.',
    'https://meet.jit.si/OliverAcademy-demo-week',
    now() + interval '3 days',
    'programada',
    demo_student, demo_admin
  );

  insert into public.live_classes (title, description, meet_url, scheduled_at, status, student_id, created_by)
  values (
    '🧪 DEMO — Clase de la semana pasada',
    'Ya terminó.',
    'https://meet.jit.si/OliverAcademy-demo-past',
    now() - interval '3 days',
    'finalizada',
    demo_student, demo_admin
  );

  insert into public.student_tasks (student_id, title, description, subject, type, status, due_date, assigned_by)
  values (demo_student, '🧪 DEMO — Ejercicios de closures', 'Resuelve los 5 ejercicios del PDF.', 'Programación', 'tarea', 'pendiente', current_date - 2, demo_admin)
  returning id into t1;

  insert into public.student_tasks (student_id, title, description, subject, type, status, due_date, assigned_by)
  values (demo_student, '🧪 DEMO — Ensayo corto: ética utilitarista', 'Mínimo 300 palabras.', 'Filosofía', 'tarea', 'pendiente', current_date + 1, demo_admin)
  returning id into t2;

  insert into public.student_tasks (student_id, title, description, subject, type, status, due_date, assigned_by, details)
  values (demo_student, '🧪 DEMO — Proyecto final: mini API', 'Construye una API REST simple con 3 endpoints.', 'Programación', 'proyecto', 'pendiente', current_date + 6, demo_admin,
    '{"deliverables":["Repositorio en GitHub","README con instrucciones","Video de 2 min explicando el código"]}'::jsonb)
  returning id into t3;

  insert into public.student_tasks (student_id, title, description, subject, type, status, due_date, assigned_by, details)
  values (demo_student, '🧪 DEMO — Examen parcial de Historia', 'Temas: Revolución Francesa e independencia de México.', 'Historia', 'examen', 'pendiente', current_date + 4, demo_admin,
    '{"time":"18:00","duration_minutes":45,"modality":"Oral por videollamada","topics":["Revolución Francesa","Independencia de México"]}'::jsonb)
  returning id into t4;

  insert into public.student_tasks (student_id, title, description, subject, type, status, due_date, assigned_by)
  values (demo_student, '🧪 DEMO — Tarea entregada, esperando revisión', 'Resumen del capítulo 3.', 'Biología', 'tarea', 'entregada', current_date - 1, demo_admin);

  insert into public.student_tasks (student_id, title, description, subject, type, status, due_date, assigned_by, grade, grade_max, feedback)
  values (demo_student, '🧪 DEMO — Tarea ya calificada', 'Práctica de fracciones.', 'Matemáticas', 'tarea', 'revisada', current_date - 5, demo_admin, 8.5, 10, '¡Buen trabajo! Solo revisa el ejercicio 4, te faltó simplificar.')
  returning id into t5;

  insert into public.school_announcements (title, body, icon, category, pinned, created_by)
  values ('🧪 DEMO — Bienvenidos al nuevo sistema de clases en vivo', 'Ya pueden ver sus clases programadas desde Mis Clases y Mis Tareas.', '🎓', 'general', true, demo_admin);

  insert into public.school_announcements (title, body, icon, category, created_by)
  values ('🧪 DEMO — Recordatorio: examen de Historia esta semana', 'Revisen los temas en Mis Tareas.', '🔔', 'recordatorio', demo_admin);

  insert into public.school_announcements (title, body, icon, category, created_by)
  values ('🧪 DEMO — Evento: sesión de dudas en vivo el viernes', 'Sesión abierta para resolver dudas de todos los cursos.', '📅', 'evento', demo_admin);

  insert into public.student_notifications (student_id, task_id, title, body, read_at)
  values (demo_student, t5, '🧪 DEMO — Calificaron tu tarea', '"🧪 DEMO — Tarea ya calificada" · 8.5/10', now() - interval '1 day');

  insert into public.student_notifications (student_id, title, body)
  values (demo_student, '🧪 DEMO — ¡Tu clase está en vivo!', '🧪 DEMO — Clase en vivo ahora mismo');

  raise notice 'Datos demo creados para el alumno %', demo_student;
end $$;
