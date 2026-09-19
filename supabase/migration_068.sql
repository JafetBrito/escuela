-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 068 — Permisos del director de academia (ver migration_067).
-- Un director (profiles.role = 'director') ve los perfiles de su academia y
-- puede sumar profesores a ella. Sumar es una RPC acotada (security definer)
-- en vez de una política de update sobre profiles, para no darle poder de
-- editar cuentas ajenas: solo puede fijar academy_id de cuentas 'teacher'.
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.my_director_academy()
returns text
language sql security definer set search_path = public
as $$
  select academy_id from public.profiles where id = auth.uid() and role = 'director';
$$;

drop policy if exists "profiles: director sees own academy" on public.profiles;
create policy "profiles: director sees own academy" on public.profiles
  for select using (academy_id is not null and academy_id = public.my_director_academy());

create or replace function public.assign_teacher_to_academy(p_email text)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_academy text := public.my_director_academy();
  v_rows int;
begin
  if v_academy is null then
    raise exception 'Solo un director puede hacer esto';
  end if;
  update public.profiles set academy_id = v_academy
   where lower(email) = lower(trim(p_email)) and role = 'teacher';
  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

grant execute on function public.assign_teacher_to_academy(text) to authenticated;
