-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 071 — Insignia de rol en el foro. author_role lo fija un trigger
-- desde profiles.role (NO el cliente), así nadie puede fingir ser admin.
-- Requiere migration_069 y migration_070 ya corridas.
-- ════════════════════════════════════════════════════════════════════════

alter table public.forum_posts   add column if not exists author_role text;
alter table public.forum_replies add column if not exists author_role text;

create or replace function public.set_forum_author_role()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  new.author_role := (select role from public.profiles where id = new.author_id);
  return new;
end;
$$;

drop trigger if exists forum_posts_author_role on public.forum_posts;
create trigger forum_posts_author_role before insert on public.forum_posts
  for each row execute function public.set_forum_author_role();

drop trigger if exists forum_replies_author_role on public.forum_replies;
create trigger forum_replies_author_role before insert on public.forum_replies
  for each row execute function public.set_forum_author_role();

-- Refresca la caché de PostgREST (si una tabla nueva da 404 aunque exista).
notify pgrst, 'reload schema';
