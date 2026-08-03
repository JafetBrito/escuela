-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 026 — trivia en línea: banco de preguntas por categoría,
-- invitar por username (calca el patrón de ajedrez, migration_016.sql),
-- partidas por turnos.
-- ════════════════════════════════════════════════════════════════════════

-- Banco de preguntas — una fila por categoría, mismo patrón que
-- course_exams (contenido en jsonb, admin edita, todos leen).
create table if not exists public.trivia_questions (
  id uuid primary key default gen_random_uuid(),
  category text not null unique,
  questions jsonb not null default '[]'::jsonb, -- [{id, question, options:[4], correct: idx, image?}]
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trivia_questions enable row level security;

drop policy if exists "trivia_questions: everyone reads" on public.trivia_questions;
create policy "trivia_questions: everyone reads" on public.trivia_questions
  for select using (auth.uid() is not null);

drop policy if exists "trivia_questions: admin writes" on public.trivia_questions;
create policy "trivia_questions: admin writes" on public.trivia_questions
  for all using (public.is_admin()) with check (public.is_admin());

-- Invitaciones — clon directo de chess_invites, categoría en vez de variante.
create table if not exists public.trivia_invites (
  id uuid primary key default gen_random_uuid(),
  from_id uuid references auth.users(id) on delete cascade not null,
  from_name text,
  to_id uuid references auth.users(id) on delete cascade not null,
  to_name text,
  category text not null,
  status text not null default 'pendiente',
  match_id uuid,
  created_at timestamptz not null default now()
);

alter table public.trivia_invites enable row level security;

drop policy if exists "trivia_invites: participant select" on public.trivia_invites;
create policy "trivia_invites: participant select" on public.trivia_invites
  for select using (auth.uid() in (from_id, to_id) or public.is_admin());

drop policy if exists "trivia_invites: sender inserts" on public.trivia_invites;
create policy "trivia_invites: sender inserts" on public.trivia_invites
  for insert with check (auth.uid() = from_id);

drop policy if exists "trivia_invites: participant updates" on public.trivia_invites;
create policy "trivia_invites: participant updates" on public.trivia_invites
  for update using (auth.uid() in (from_id, to_id));

-- Partidas — questions es una FOTO tomada al crear la partida (mismo
-- criterio que los intentos de examen: un cambio del admin al banco
-- después no afecta partidas en curso). Turno/puntaje solo client-side,
-- mismo criterio de confianza que chess_games — juego amistoso, sin
-- anti-trampa server-side.
create table if not exists public.trivia_matches (
  id uuid primary key default gen_random_uuid(),
  player1_id uuid references auth.users(id) on delete cascade not null,
  player1_name text,
  player2_id uuid references auth.users(id) on delete cascade not null,
  player2_name text,
  category text not null,
  questions jsonb not null,
  current_index int not null default 0,
  current_turn uuid not null,
  answers jsonb not null default '[]'::jsonb, -- [{by, choice, correct}]
  player1_score int not null default 0,
  player2_score int not null default 0,
  status text not null default 'en_curso',
  result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trivia_matches enable row level security;

drop policy if exists "trivia_matches: participant select" on public.trivia_matches;
create policy "trivia_matches: participant select" on public.trivia_matches
  for select using (auth.uid() in (player1_id, player2_id) or public.is_admin());

drop policy if exists "trivia_matches: participant inserts" on public.trivia_matches;
create policy "trivia_matches: participant inserts" on public.trivia_matches
  for insert with check (auth.uid() in (player1_id, player2_id));

drop policy if exists "trivia_matches: participant updates" on public.trivia_matches;
create policy "trivia_matches: participant updates" on public.trivia_matches
  for update using (auth.uid() in (player1_id, player2_id));

alter table public.student_notifications
  add column if not exists trivia_invite_id uuid references public.trivia_invites(id) on delete cascade;

-- OJO: el mismo insert en useChessStore.js (sendInvite/respondInvite) hacia
-- student_notifications falla en silencio hoy — student_notifications solo
-- tiene la política "admin creates" (migration_004.sql), y un alumno
-- invitando a otro no es admin. Para que la notificación de trivia sí
-- llegue, se agrega esta política acotada: un participante puede crear una
-- notificación SOLO si está ligada a una invitación real de la que es
-- parte, y nunca con recompensa (sin vector de auto-otorgarse XP/oro con
-- una notificación falsa). Arreglar el mismo hueco para chess_invite_id
-- queda fuera de esta migración.
drop policy if exists "notifications: trivia invite participant creates" on public.student_notifications;
create policy "notifications: trivia invite participant creates" on public.student_notifications
  for insert with check (
    trivia_invite_id is not null
    and coalesce(xp_reward, 0) = 0
    and coalesce(gold_reward, 0) = 0
    and exists (
      select 1 from public.trivia_invites ti
      where ti.id = trivia_invite_id
        and auth.uid() in (ti.from_id, ti.to_id)
        and student_id in (ti.from_id, ti.to_id)
    )
  );

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'trivia_matches'
  ) then
    alter publication supabase_realtime add table public.trivia_matches;
  end if;
end $$;
