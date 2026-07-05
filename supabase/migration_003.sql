-- migration_003: tareas de alumnos, anuncios escolares y configuración de plataforma
-- Corre este script en Supabase SQL Editor.

-- ─── Helper: is_admin() ───────────────────────────────────────────────────────
-- Security-definer para evitar recursión en RLS de profiles.
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

-- ─── Permitir al admin ver todos los perfiles (para asignar tareas) ───────────
drop policy if exists "profiles: admin select all" on public.profiles;
create policy "profiles: admin select all" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

-- ─── student_tasks ────────────────────────────────────────────────────────────
-- El admin crea tareas para alumnos específicos y luego las califica.
-- El alumno puede marcar su tarea como 'entregada'.
create table if not exists public.student_tasks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  subject text,
  due_date date,
  status text not null default 'pendiente', -- pendiente | entregada | revisada
  grade numeric(5,2),                       -- calificación (0-10 ó 0-100)
  grade_max numeric(5,2) default 10,        -- escala máxima
  feedback text,                            -- comentarios del admin al calificar
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
  with check (status = 'entregada');  -- alumno solo puede marcar como entregada

drop policy if exists "tasks: admin full access" on public.student_tasks;
create policy "tasks: admin full access" on public.student_tasks
  for all using (public.is_admin());

-- ─── school_announcements ─────────────────────────────────────────────────────
-- Tablón de anuncios. El admin publica, todos leen.
create table if not exists public.school_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  icon text not null default '📢',
  category text not null default 'general', -- general | actividad | recordatorio | evento
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

-- ─── platform_settings ───────────────────────────────────────────────────────
-- Configuración global: tema festivo activo, mantenimiento, etc.
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

-- Valor inicial: sin tema festivo
insert into public.platform_settings (key, value)
  values ('holiday_theme', '"none"')
  on conflict (key) do nothing;
