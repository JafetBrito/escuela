-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 036 — "Oliver Cyber Range: Hospital": Hacker vs Doctor en
-- tiempo real, cada quien con su propia interfaz (terminal / casos de
-- pacientes) compartiendo un solo medidor de "Seguridad del Hospital" —
-- calca el patrón de invitación de chess_invites/trivia_invites
-- (migration_016/026.sql), con un RPC atómico para el medidor compartido
-- (dos clientes escribiendo casi al mismo tiempo no se pisan).
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.hospital_invites (
  id uuid primary key default gen_random_uuid(),
  from_id uuid references auth.users(id) on delete cascade not null,
  from_name text,
  from_role text not null default 'hacker', -- el rol que ELIGE quien invita; el invitado recibe el otro
  to_id uuid references auth.users(id) on delete cascade not null,
  to_name text,
  status text not null default 'pendiente',
  match_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.hospital_matches (
  id uuid primary key default gen_random_uuid(),
  hacker_id uuid references auth.users(id) on delete cascade not null,
  hacker_name text,
  doctor_id uuid references auth.users(id) on delete cascade not null,
  doctor_name text,
  security int not null default 100,
  hacks_completed int not null default 0,
  patients_saved int not null default 0,
  status text not null default 'en_curso', -- en_curso | finalizada
  result text, -- 'hacker' | 'doctor' | null (mientras sigue en curso)
  ends_at timestamptz not null default (now() + interval '6 minutes'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hospital_invites enable row level security;
alter table public.hospital_matches enable row level security;

drop policy if exists "hospital_invites: participant select" on public.hospital_invites;
create policy "hospital_invites: participant select" on public.hospital_invites
  for select using (auth.uid() in (from_id, to_id) or public.is_admin());

drop policy if exists "hospital_invites: sender inserts" on public.hospital_invites;
create policy "hospital_invites: sender inserts" on public.hospital_invites
  for insert with check (from_id = auth.uid());

drop policy if exists "hospital_invites: participant updates" on public.hospital_invites;
create policy "hospital_invites: participant updates" on public.hospital_invites
  for update using (auth.uid() in (from_id, to_id));

drop policy if exists "hospital_matches: participant select" on public.hospital_matches;
create policy "hospital_matches: participant select" on public.hospital_matches
  for select using (auth.uid() in (hacker_id, doctor_id) or public.is_admin());

drop policy if exists "hospital_matches: participant inserts" on public.hospital_matches;
create policy "hospital_matches: participant inserts" on public.hospital_matches
  for insert with check (auth.uid() in (hacker_id, doctor_id));

drop policy if exists "hospital_matches: participant updates" on public.hospital_matches;
create policy "hospital_matches: participant updates" on public.hospital_matches
  for update using (auth.uid() in (hacker_id, doctor_id));

-- Ajuste atómico del medidor compartido — el cliente nunca calcula el
-- nuevo valor, solo pide un delta; la aritmética la hace la fila en un
-- solo UPDATE, así dos aciertos casi simultáneos (uno de cada jugador) no
-- se pisan entre sí (lost update). También cierra la partida sola cuando
-- la seguridad llega a 0 o se acaba el tiempo.
--
-- security definer = corre saltándose RLS, así que el auth.uid() in
-- (hacker_id, doctor_id) de abajo NO es opcional — sin él, cualquier
-- usuario logueado podría llamar esta función con el match_id de OTROS
-- dos jugadores y sabotear su partida.
create or replace function public.adjust_hospital_security(p_match_id uuid, p_delta int, p_is_hack boolean)
returns public.hospital_matches
language plpgsql security definer set search_path = public
as $$
declare
  m public.hospital_matches;
begin
  update public.hospital_matches
  set
    security = greatest(0, least(100, security + p_delta)),
    hacks_completed = hacks_completed + (case when p_is_hack then 1 else 0 end),
    patients_saved = patients_saved + (case when p_is_hack then 0 else 1 end),
    updated_at = now()
  where id = p_match_id
    and status = 'en_curso'
    and auth.uid() in (hacker_id, doctor_id)
  returning * into m;

  if m.id is not null and (m.security <= 0 or now() >= m.ends_at) then
    update public.hospital_matches
    set status = 'finalizada',
        result = case when m.security <= 0 then 'hacker' else 'doctor' end
    where id = m.id
    returning * into m;
  end if;

  return m;
end;
$$;

alter table public.student_notifications
  add column if not exists hospital_invite_id uuid references public.hospital_invites(id) on delete cascade;

-- Mismo hueco de RLS que trivia_invite_id/chess_invite_id ya resolvieron
-- (ver migration_026.sql) — un participante puede notificar SOLO si está
-- ligado a una invitación real de la que es parte, nunca con recompensa.
drop policy if exists "notifications: hospital invite participant creates" on public.student_notifications;
create policy "notifications: hospital invite participant creates" on public.student_notifications
  for insert with check (
    hospital_invite_id is not null
    and coalesce(xp_reward, 0) = 0
    and coalesce(gold_reward, 0) = 0
    and exists (
      select 1 from public.hospital_invites hi
      where hi.id = hospital_invite_id
        and auth.uid() in (hi.from_id, hi.to_id)
        and student_id in (hi.from_id, hi.to_id)
    )
  );

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'hospital_matches'
  ) then
    alter publication supabase_realtime add table public.hospital_matches;
  end if;
end $$;
