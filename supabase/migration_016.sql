-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 016 — ajedrez en línea: invitar por username, partidas con reloj
-- ════════════════════════════════════════════════════════════════════════

-- La política de profiles solo deja ver tu propia fila (o al admin ver
-- todas) — necesaria para no exponer snapshot/license de nadie más. Para
-- poder "invitar por nombre de usuario" sin abrir esa tabla entera, esta
-- función expone SOLO id/nombre/email de quien haga match, nunca la fila
-- completa (security definer = corre con permisos propios, ignora RLS
-- adentro, pero el resultado que regresa está acotado a 3 columnas).
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

-- Una partida en línea — el "reloj" vive en *_ms (tiempo restante al momento
-- de turn_started_at) más turn_started_at; cada cliente calcula el tiempo
-- efectivo restante localmente (now - turn_started_at) para que el reloj se
-- vea correr sin necesitar un tick del servidor. Sin anti-trampa: cualquiera
-- de los dos clientes puede escribir el estado (mismo espíritu que el
-- examen — es un juego amistoso, no un torneo vigilado).
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
