-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 085 — Contenido editable de Oliver Racing (racing_content)
--   • Una fila por mundo (medicina, programacion, filosofia, ...): data = { levels: [ { id, name, blurb, missions[], questions[] } ] }.
--   • Lectura para todos; escritura solo admin (public.is_admin()).
--   • Si no hay fila, el juego usa el contenido de serie (src/components/racing/racingData.js).
--   • Se edita desde /carrera/editor (preguntas, misiones e historias, traducciones EN/FR, importar/exportar).
-- Idempotente (se puede correr dos veces).
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.racing_content (
  id         text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.racing_content enable row level security;

drop policy if exists "racing_content: read all" on public.racing_content;
create policy "racing_content: read all" on public.racing_content
  for select using (true);

drop policy if exists "racing_content: admin write" on public.racing_content;
create policy "racing_content: admin write" on public.racing_content
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.racing_content_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists racing_content_touch on public.racing_content;
create trigger racing_content_touch before insert or update on public.racing_content
  for each row execute function public.racing_content_touch();
