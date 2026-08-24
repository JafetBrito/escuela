-- migration_043: Foro (MVP) + regalo diario entre amigos
-- Corre este script en Supabase SQL Editor.

-- ─── forum_posts ────────────────────────────────────────────────────────────
-- MVP a propósito: solo publicaciones planas, sin respuestas/hilos todavía.
-- Cualquier alumno autenticado puede leer y publicar; solo el autor (o admin)
-- puede borrar su propia publicación.
create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade not null,
  author_name text not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.forum_posts enable row level security;

drop policy if exists "forum_posts: all can read" on public.forum_posts;
create policy "forum_posts: all can read" on public.forum_posts
  for select using (auth.role() = 'authenticated');

drop policy if exists "forum_posts: author can insert" on public.forum_posts;
create policy "forum_posts: author can insert" on public.forum_posts
  for insert with check (auth.uid() = author_id);

drop policy if exists "forum_posts: author or admin can delete" on public.forum_posts;
create policy "forum_posts: author or admin can delete" on public.forum_posts
  for delete using (auth.uid() = author_id or public.is_admin());

-- ─── gift_log + send_daily_gift() ───────────────────────────────────────────
-- Los "amigos" de la app son solo nombres de texto (useFriendsStore, sin
-- cuenta vinculada — ver project_community_restructure en memoria), así que
-- el regalo se manda por display_name (mismo criterio "difuso" que ya usa
-- esta página para el estado en línea). Tiene que ser un RPC server-side
-- porque un navegador no puede escribir el snapshot de OTRA cuenta —
-- ninguna política de RLS se lo permitiría directamente, así que esta es la
-- única forma de que el regalo realmente le llegue al amigo.
create table if not exists public.gift_log (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete cascade not null,
  recipient_id uuid references auth.users(id) on delete cascade not null,
  amount bigint not null,
  gifted_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (sender_id, gifted_on) -- un regalo por remitente por día
);

alter table public.gift_log enable row level security;

drop policy if exists "gift_log: sender or recipient can read own" on public.gift_log;
create policy "gift_log: sender or recipient can read own" on public.gift_log
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id or public.is_admin());

create or replace function public.send_daily_gift(p_recipient_name text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_recipient_id uuid;
  v_amount bigint := 1000; -- "cobre" — 10000 cobre = 1 oro (ver useCurrencyStore.js)
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'message', 'No autenticado.');
  end if;

  select id into v_recipient_id
  from public.profiles
  where lower(display_name) = lower(trim(p_recipient_name))
    and id != auth.uid()
  limit 1;

  if v_recipient_id is null then
    return jsonb_build_object('ok', false, 'message', 'No encontramos una cuenta con ese nombre.');
  end if;

  if exists (
    select 1 from public.gift_log
    where sender_id = auth.uid() and gifted_on = current_date
  ) then
    return jsonb_build_object('ok', false, 'message', 'Ya enviaste tu regalo de hoy — vuelve mañana.');
  end if;

  insert into public.gift_log (sender_id, recipient_id, amount)
  values (auth.uid(), v_recipient_id, v_amount);

  update public.profiles
  set snapshot = jsonb_set(
    coalesce(snapshot, '{}'::jsonb),
    '{coins}',
    to_jsonb(coalesce((snapshot->>'coins')::bigint, 0) + v_amount)
  )
  where id = v_recipient_id;

  return jsonb_build_object('ok', true, 'message', 'Regalo enviado 🎁', 'amount', v_amount);
end;
$$;
