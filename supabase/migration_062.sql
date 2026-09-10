-- Candado atómico de "una sola aparición por NPC por día" para el sistema de
-- discursos programados en el mundo VR (Oliver en la plaza, y NPCs-maestro
-- después). Cualquier cliente conectado puede intentar reclamarlo; la
-- restricción unique garantiza que solo uno gane la carrera ese día.
create table if not exists public.npc_speech_log (
  id uuid primary key default gen_random_uuid(),
  npc_id text not null,
  event_date date not null,
  started_at timestamptz not null default now(),
  triggered_by uuid references public.profiles (id) on delete set null,
  unique (npc_id, event_date)
);

alter table public.npc_speech_log enable row level security;

drop policy if exists "npc_speech_log: select all" on public.npc_speech_log;
create policy "npc_speech_log: select all" on public.npc_speech_log
  for select using (auth.role() = 'authenticated');

drop policy if exists "npc_speech_log: insert own" on public.npc_speech_log;
create policy "npc_speech_log: insert own" on public.npc_speech_log
  for insert with check (auth.uid() = triggered_by);
