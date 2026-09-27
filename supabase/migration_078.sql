-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 078 — Auditoría de seguridad previa a la alpha
--  1. recruiter_passes ya no es legible por cualquiera: antes cualquier
--     visitante con la llave anónima podía listar TODOS los tokens vivos.
--     Ahora solo un admin lee la tabla; el enlace se valida con una RPC que
--     recibe el token exacto y devuelve solo su fecha de expiración.
--  2. is_admin() se fija a search_path = public (función SECURITY DEFINER).
-- ════════════════════════════════════════════════════════════════════════

drop policy if exists "recruiter_passes: public read by token" on public.recruiter_passes;
drop policy if exists "recruiter_passes: admin read" on public.recruiter_passes;
create policy "recruiter_passes: admin read" on public.recruiter_passes
  for select using (public.is_admin());

create or replace function public.validate_recruiter_pass(p_token text)
returns timestamptz
language sql stable security definer set search_path = public
as $$
  select expires_at from public.recruiter_passes
  where token = p_token and expires_at > now()
$$;
revoke all on function public.validate_recruiter_pass(text) from public;
grant execute on function public.validate_recruiter_pass(text) to anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  )
$$;

-- 3. voice_enabled solo lo concede un admin (el chat de voz está gateado por
--    seguridad, sobre todo para cuentas de menores); antes cualquier cuenta
--    podía activárselo con una llamada directa a la API.
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
    new.voice_enabled := old.voice_enabled;
  end if;
  return new;
end;
$$;
