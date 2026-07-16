-- migration_007: Mis Clases v2 — clase dirigida a un alumno específico,
-- misiones de clase, subida de PDFs a Storage. Corre este script en Supabase
-- SQL Editor, después de migration_006.

alter table public.live_classes add column if not exists student_id uuid references auth.users(id);
alter table public.live_classes add column if not exists missions jsonb not null default '[]'::jsonb;

-- Antes cualquier usuario logueado veía todas las clases. Con clases 1-a-1
-- (student_id set) eso filtraría info de otro alumno, así que cada quien solo
-- ve las suyas + las que son para "todos" (student_id null); el admin ve todo.
drop policy if exists "live_classes: everyone reads" on public.live_classes;
drop policy if exists "live_classes: read own or admin" on public.live_classes;
create policy "live_classes: read own or admin" on public.live_classes
  for select using (public.is_admin() or student_id is null or student_id = auth.uid());

-- ─── Storage: recursos tipo PDF que el profesor sube desde el panel ────────
insert into storage.buckets (id, name, public)
  values ('class-resources', 'class-resources', true)
  on conflict (id) do nothing;

drop policy if exists "class-resources: public read" on storage.objects;
create policy "class-resources: public read" on storage.objects
  for select using (bucket_id = 'class-resources');

drop policy if exists "class-resources: admin upload" on storage.objects;
create policy "class-resources: admin upload" on storage.objects
  for insert with check (bucket_id = 'class-resources' and public.is_admin());

drop policy if exists "class-resources: admin delete" on storage.objects;
create policy "class-resources: admin delete" on storage.objects
  for delete using (bucket_id = 'class-resources' and public.is_admin());
