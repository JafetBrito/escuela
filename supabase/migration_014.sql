-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 014 — nombre del alumno en la clase + chat temporal por clase
-- ════════════════════════════════════════════════════════════════════════
-- student_name: denormalizado en la propia fila para que los anuncios de voz
-- (useLiveClassStore.js) puedan decir "Fulano levantó la mano" sin tener que
-- consultar profiles desde el callback de Realtime.

alter table public.live_classes
  add column if not exists student_name text;

-- Chat "de aeropuerto": vive mientras la clase está activa, se borra al
-- finalizar (ver endClass en useLiveClassStore.js) — no es historial
-- permanente como Clase Online, es una conversación de la sesión en vivo.
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
