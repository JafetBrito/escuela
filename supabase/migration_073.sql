-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 073 — Nombre real + nombre de plataforma con etiqueta (#1234) y
-- perfil público compartible.
--
-- • profiles.full_name  → nombre real (privado, solo lo ve la propia cuenta y admins).
-- • profiles.display_name → nombre en la plataforma (ya existía).
-- • profiles.tag → 4 dígitos, único por nombre: "Jafet#4821". Lo asigna un
--   trigger (no el cliente), así que dos "Jafet" nunca comparten etiqueta.
-- • public_profiles → resumen que el alumno decide compartir con un enlace
--   (/u/<slug>); legible sin cuenta. Solo contiene datos que el propio alumno
--   eligió publicar al pulsar "Compartir".
-- ════════════════════════════════════════════════════════════════════════

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists tag text;

-- ─── Etiqueta automática ────────────────────────────────────────────────
create or replace function public.assign_profile_tag()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  -- Nada que hacer si ya tiene etiqueta y ni el nombre ni la etiqueta cambiaron
  -- (evita una consulta extra en cada autoguardado del snapshot).
  if tg_op = 'UPDATE' and new.tag is not null
     and new.display_name is not distinct from old.display_name
     and new.tag is not distinct from old.tag then
    return new;
  end if;

  loop
    if new.tag is not null and not exists (
      select 1 from public.profiles
      where lower(coalesce(display_name, '')) = lower(coalesce(new.display_name, ''))
        and tag = new.tag and id <> new.id
    ) then
      exit;
    end if;
    new.tag := lpad((1000 + floor(random() * 9000))::int::text, 4, '0');
  end loop;
  return new;
end;
$$;

drop trigger if exists profiles_assign_tag on public.profiles;
create trigger profiles_assign_tag before insert or update on public.profiles
  for each row execute function public.assign_profile_tag();

-- Cuentas existentes: una etiqueta secuencial por nombre (única por construcción).
update public.profiles p
set tag = sub.tag
from (
  select id, lpad((1000 + row_number() over (partition by lower(coalesce(display_name, '')) order by id))::text, 4, '0') as tag
  from public.profiles
  where tag is null
) sub
where p.id = sub.id;

create unique index if not exists profiles_name_tag_uniq
  on public.profiles (lower(coalesce(display_name, '')), tag);

-- ─── Perfil público compartible ─────────────────────────────────────────
create table if not exists public.public_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  slug text not null unique,
  display_name text not null,
  avatar_url text,
  level int not null default 1,
  xp int not null default 0,
  courses_completed int not null default 0,
  courses_in_progress int not null default 0,
  streak int not null default 0,
  avg_grade int,
  top_areas jsonb not null default '[]'::jsonb,
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.public_profiles enable row level security;

drop policy if exists "public_profiles: anyone can read shared" on public.public_profiles;
create policy "public_profiles: anyone can read shared" on public.public_profiles
  for select using (is_public);

drop policy if exists "public_profiles: owner can read own" on public.public_profiles;
create policy "public_profiles: owner can read own" on public.public_profiles
  for select using (auth.uid() = user_id);

drop policy if exists "public_profiles: owner can insert" on public.public_profiles;
create policy "public_profiles: owner can insert" on public.public_profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "public_profiles: owner can update" on public.public_profiles;
create policy "public_profiles: owner can update" on public.public_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "public_profiles: owner or admin can delete" on public.public_profiles;
create policy "public_profiles: owner or admin can delete" on public.public_profiles
  for delete using (auth.uid() = user_id or public.is_admin());

grant select on public.public_profiles to anon, authenticated;

notify pgrst, 'reload schema';
