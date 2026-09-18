-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 065 — falta el permiso de UPDATE para admin en `profiles`
-- ════════════════════════════════════════════════════════════════════════
-- migration_003.sql agregó "profiles: admin select all" (el admin puede
-- LEER cualquier perfil — por eso el directorio de alumnos en /admin
-- siempre funcionó). La política gemela de escritura,
-- "profiles: admin update all", solo quedó escrita en schema.sql (un
-- archivo de referencia) pero nunca se aplicó como migración real — por
-- eso cambiar el perfil de edad de OTRO alumno fallaba en silencio (0
-- filas, sin error): la única política de UPDATE que sí existía era
-- "profiles: update own" (auth.uid() = id), que un admin nunca cumple al
-- editar la cuenta de alguien más.
drop policy if exists "profiles: admin update all" on public.profiles;
create policy "profiles: admin update all" on public.profiles
  for update using (public.is_admin());
