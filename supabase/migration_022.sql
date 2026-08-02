-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 022 — cuentas de niños pendientes de aprobación del admin
-- + cierre de un hueco de RLS en profiles
-- ════════════════════════════════════════════════════════════════════════

-- Estado de la cuenta — hoy solo lo usan las cuentas de niños creadas por un
-- padre/tutor (ver CreateAccountPage.jsx); el resto de cuentas queda
-- 'active' siempre, sin fricción nueva.
alter table public.profiles
  add column if not exists account_status text not null default 'active';

do $$ begin
  alter table public.profiles
    add constraint profiles_account_status_check
    check (account_status in ('active', 'pending'));
exception when duplicate_object then null;
end $$;

-- handle_new_user() ya insertaba la fila de profiles al crear la cuenta en
-- auth.users (ver schema.sql) — se extiende para arrancar en 'pending'
-- cuando el signup vino marcado como "cuenta para mi hijo/a"
-- (supabase.auth.signUp options.data.is_child_signup, leído aquí de
-- raw_user_meta_data). Esto ocurre en el INSERT inicial, así que no choca
-- con el trigger de abajo (que solo vigila UPDATE).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, account_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'avatar_url',
    case when (new.raw_user_meta_data ->> 'is_child_signup')::boolean is true then 'pending' else 'active' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Cierra un hueco real de RLS: "profiles: update own" (schema.sql) no tiene
-- WITH CHECK, así que hoy cualquier cuenta logueada podría, con una llamada
-- directa a la API (no desde nuestra UI), reescribir su propio role,
-- age_profile o account_status. Este trigger revierte esas 3 columnas si
-- quien actualiza no es admin — no rompe el autosave normal (snapshot,
-- display_name, etc.) porque esas columnas nunca cambian de valor en un
-- update legítimo del propio dueño.
create or replace function public.protect_admin_only_columns()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.age_profile := old.age_profile;
    new.account_status := old.account_status;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_admin_only_columns_trigger on public.profiles;
create trigger protect_admin_only_columns_trigger
  before update on public.profiles
  for each row execute function public.protect_admin_only_columns();
