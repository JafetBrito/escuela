-- migration_009: acciones rápidas en el Hub (levantar la mano / ping) +
-- chat global de Clase Online. Corre este script después de migration_008
-- (o después de run_all.sql si ya lo corriste completo).

-- ─── live_class_pings ───────────────────────────────────────────────────────
-- Botón de "levantar la mano" / ping desde el Hub del alumno — el admin lo ve
-- aparecer en tiempo real en su panel de control mientras da la clase.
create table if not exists public.live_class_pings (
  id uuid primary key default gen_random_uuid(),
  live_class_id uuid references public.live_classes(id) on delete cascade not null,
  student_id uuid references auth.users(id) on delete cascade not null,
  kind text not null default 'mano', -- 'mano' | 'ping'
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

-- ─── online_chat_messages ───────────────────────────────────────────────────
-- Chat global de "Clase Online" (video continuo) — separado por completo de
-- las clases de práctica / en vivo: aquí es un solo canal para todos.
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
