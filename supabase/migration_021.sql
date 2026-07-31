-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 021 — perfil de edad por cuenta (niños / normal / abuelos)
-- ════════════════════════════════════════════════════════════════════════

-- Lo asigna el admin (no el propio alumno) — controla qué tanto del "mundo
-- videojuego" (VR, mascota, misiones, combate, ajedrez, chat entre alumnos)
-- ve cada cuenta, y fuerza un tema visual acorde. Reutiliza is_admin() ya
-- existente en profiles, sin política RLS nueva.
alter table public.profiles
  add column if not exists age_profile text not null default 'normal';

do $$ begin
  alter table public.profiles
    add constraint profiles_age_profile_check
    check (age_profile in ('kids', 'normal', 'seniors'));
exception when duplicate_object then null;
end $$;
