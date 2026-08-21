-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 037 — "4 Pared": teléfono en el mundo VR, mensajes prearmados
-- entre alumnos (búsqueda por username, mismo patrón que ajedrez/trivia/
-- hospital — search_profiles, ver migration_016.sql).
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.phone_messages (
  id uuid primary key default gen_random_uuid(),
  from_id uuid references auth.users(id) on delete cascade not null,
  from_name text,
  to_id uuid references auth.users(id) on delete cascade not null,
  to_name text,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.phone_messages enable row level security;

drop policy if exists "phone_messages: participant select" on public.phone_messages;
create policy "phone_messages: participant select" on public.phone_messages
  for select using (auth.uid() in (from_id, to_id) or public.is_admin());

drop policy if exists "phone_messages: sender inserts" on public.phone_messages;
create policy "phone_messages: sender inserts" on public.phone_messages
  for insert with check (auth.uid() = from_id);

drop policy if exists "phone_messages: recipient marks read" on public.phone_messages;
create policy "phone_messages: recipient marks read" on public.phone_messages
  for update using (auth.uid() = to_id) with check (auth.uid() = to_id);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'phone_messages'
  ) then
    alter publication supabase_realtime add table public.phone_messages;
  end if;
end $$;

-- Mismo hueco de RLS que ya se cerró para trivia (migration_026.sql) y
-- ajedrez (migration_027.sql): student_notifications solo tenía "admin
-- creates" + las políticas específicas de cada feature — sin esta, el
-- insert de la campanita en usePhoneMessagesStore.sendMessage fallaría en
-- silencio para cualquier alumno (el mensaje en sí sí se guardaría en
-- phone_messages, pero el destinatario nunca vería la notificación).
alter table public.student_notifications
  add column if not exists phone_message_id uuid references public.phone_messages(id) on delete cascade;

drop policy if exists "notifications: phone message participant creates" on public.student_notifications;
create policy "notifications: phone message participant creates" on public.student_notifications
  for insert with check (
    phone_message_id is not null
    and coalesce(xp_reward, 0) = 0
    and coalesce(gold_reward, 0) = 0
    and exists (
      select 1 from public.phone_messages pm
      where pm.id = phone_message_id
        and auth.uid() in (pm.from_id, pm.to_id)
        and student_id in (pm.from_id, pm.to_id)
    )
  );
