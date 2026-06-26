-- oliver.escuela — esquema de Supabase
--
-- Cómo usarlo:
-- 1. Crea un proyecto en https://supabase.com (gratis).
-- 2. Ve a "SQL Editor" → "New query", pega TODO este archivo y dale "Run".
-- 3. Ve a "Project Settings" → "API" y copia "Project URL" y "anon public key"
--    a tu archivo .env como VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
-- 4. (Opcional) Activa Google/Facebook en "Authentication" → "Providers".
-- 5. Para hacer admin a un usuario: tabla "profiles" → edita su fila →
--    pon role = 'admin'.

-- ─────────────────────────────────────────────────────────────────────────
-- profiles: 1 fila por usuario. role: 'admin' | 'student'.
-- license: null (sin llave) o { courseId, licenseId, type, ... } (con llave).
-- snapshot: copia completa del progreso del usuario (mascota, monedas, chats,
-- ajustes, etc.) para sincronizar entre navegadores.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  role text not null default 'student',
  license jsonb,
  snapshot jsonb,
  voice_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Safety net for projects whose `profiles` table already existed before
-- some of these columns were added to this file: `create table if not
-- exists` above is a no-op on an existing table, so it silently does NOT
-- add new columns. Re-running this whole file is always safe.
alter table public.profiles add column if not exists role text not null default 'student';
alter table public.profiles add column if not exists license jsonb;
alter table public.profiles add column if not exists snapshot jsonb;
-- Live voice (mic dictation in VR chat) is off by default for everyone —
-- admins always have it implicitly; this flag is how an admin grants it to
-- a specific other player without giving them admin rights.
alter table public.profiles add column if not exists voice_enabled boolean not null default false;

alter table public.profiles enable row level security;

drop policy if exists "profiles: select own" on public.profiles;
create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

-- Lets admins look up and edit ANY player's row (used by the in-game GM
-- console: give/remove objetos, set level, etc.). Wrapped in a security
-- definer function so the policy doesn't recursively re-check RLS on
-- `profiles` while reading `profiles` itself.
create or replace function public.is_admin()
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "profiles: admin select all" on public.profiles;
create policy "profiles: admin select all" on public.profiles
  for select using (public.is_admin());

drop policy if exists "profiles: admin update all" on public.profiles;
create policy "profiles: admin update all" on public.profiles
  for update using (public.is_admin());

-- Crea automáticamente una fila en profiles cuando alguien se registra.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- course_comments: comentarios de usuarios en los módulos de un curso.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.course_comments (
  id uuid primary key default gen_random_uuid(),
  course_id text not null,
  module_id text not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  author_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists course_comments_course_module_idx
  on public.course_comments (course_id, module_id, created_at);

alter table public.course_comments enable row level security;

drop policy if exists "comments: select all (authenticated)" on public.course_comments;
create policy "comments: select all (authenticated)" on public.course_comments
  for select using (auth.role() = 'authenticated');

drop policy if exists "comments: insert own" on public.course_comments;
create policy "comments: insert own" on public.course_comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "comments: delete own" on public.course_comments;
create policy "comments: delete own" on public.course_comments
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- level28_race: secret achievement "Pionero del Sistema" — the first 100
-- accounts to reach level 28 before 2027, system-wide (not per-account
-- local state, since "first 100" only means anything as a global count).
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.level28_race (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  claimed_at timestamptz not null default now()
);

alter table public.level28_race enable row level security;

drop policy if exists "level28_race: select all (authenticated)" on public.level28_race;
create policy "level28_race: select all (authenticated)" on public.level28_race
  for select using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────────
-- ai_credentials: llaves de API de IA del usuario (MiniMax, DeepSeek,
-- Anthropic, Google, o cualquier endpoint "OpenAI-compatible" vía base_url).
-- A diferencia de `profiles`, esta tabla NO tiene política de "admin select
-- all" — ni siquiera un administrador puede leer la llave de otro usuario.
-- El cliente nunca vuelve a pedir api_key salvo justo antes de llamar a la
-- IA; la lista de conexiones en Ajustes solo lee provider_id/base_url/model/
-- label (ver useAiCredentialsStore.js).
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.ai_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider_id text not null,
  label text,
  api_key text not null,
  base_url text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_credentials_user_idx on public.ai_credentials (user_id);

alter table public.ai_credentials enable row level security;

drop policy if exists "ai_credentials: owner all" on public.ai_credentials;
create policy "ai_credentials: owner all" on public.ai_credentials
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- mascot_memories: hechos puntuales que el usuario le pide a su mascota que
-- recuerde a largo plazo (distinto del historial de chat crudo, que ya vive
-- en profiles.snapshot.chatHistory). Mismo patrón de RLS: solo el dueño.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.mascot_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists mascot_memories_user_idx on public.mascot_memories (user_id, created_at);

alter table public.mascot_memories enable row level security;

drop policy if exists "mascot_memories: owner all" on public.mascot_memories;
create policy "mascot_memories: owner all" on public.mascot_memories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ponytail: no explicit row lock around the count check below, so two
-- simultaneous calls landing on slot #100 could both squeeze through —
-- acceptable for a small app; upgrade to `select ... for update` on a
-- singleton counter row if this ever needs to be exact.
create or replace function public.claim_level28_race()
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  already boolean;
  current_count int;
begin
  if now() >= timestamptz '2027-01-01 00:00:00+00' then
    return false;
  end if;

  select exists(select 1 from level28_race where user_id = auth.uid()) into already;
  if already then
    return true;
  end if;

  select count(*) into current_count from level28_race;
  if current_count >= 100 then
    return false;
  end if;

  insert into level28_race (user_id) values (auth.uid());
  return true;
exception when unique_violation then
  return true;
end;
$$;
