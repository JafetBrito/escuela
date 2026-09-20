-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 072 — Fotos de perfil. Bucket público 'avatars': cualquiera lee,
-- cada usuario solo escribe dentro de su propia carpeta (<user_id>/...).
-- profiles.avatar_url ya existe (migration_048).
-- ════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars: public read" on storage.objects;
create policy "avatars: public read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars: user insert own" on storage.objects;
create policy "avatars: user insert own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars: user update own" on storage.objects;
create policy "avatars: user update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
