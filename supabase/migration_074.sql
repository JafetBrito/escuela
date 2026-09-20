-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 074 — Sistema social real: amistades con solicitud, regalos y
-- invitaciones (retos / juegos / mundos) que hay que ACEPTAR, todo con
-- notificación en la campanita. Requiere migration_073 (tag).
--
-- Todo pasa por funciones security definer: las tablas no tienen políticas,
-- así que ningún cliente puede leerlas ni escribirlas directamente (nadie
-- puede fingir una solicitud, auto-regalarse ni mandar notificaciones falsas).
-- ════════════════════════════════════════════════════════════════════════

-- ─── 1. Etiqueta elegible (4 dígitos). Si ya está tomada, error claro ────
create or replace function public.assign_profile_tag()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.tag is not null
     and new.display_name is not distinct from old.display_name
     and new.tag is not distinct from old.tag then
    return new;
  end if;

  -- La persona eligió su etiqueta: se respeta o se rechaza, nunca se cambia sola.
  if tg_op = 'UPDATE' and new.tag is not null and new.tag is distinct from old.tag then
    if new.tag !~ '^[0-9]{4}$' then
      raise exception 'La etiqueta debe ser de 4 dígitos.';
    end if;
    if exists (
      select 1 from public.profiles
      where lower(coalesce(display_name, '')) = lower(coalesce(new.display_name, ''))
        and tag = new.tag and id <> new.id
    ) then
      raise exception 'tag_taken';
    end if;
    return new;
  end if;

  -- Cuenta nueva o cambio de nombre: si la etiqueta choca, se sortea otra.
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

-- ─── 2. Notificaciones accionables ──────────────────────────────────────
alter table public.student_notifications
  add column if not exists social_kind text,      -- friend_request | gift | invite | friend_accepted | invite_accepted | info
  add column if not exists social_id uuid,        -- id de la solicitud/regalo/invitación
  add column if not exists social_payload jsonb;  -- ej. { "path": "/vr" }

-- ─── 3. Tablas (sin políticas: solo las funciones de abajo las tocan) ────
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  unique (requester_id, addressee_id)
);
alter table public.friendships enable row level security;

create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  amount bigint not null default 1000,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);
alter table public.gifts enable row level security;

create table if not exists public.friend_invites (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('challenge', 'game', 'vr')),
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'done')),
  created_at timestamptz not null default now()
);
alter table public.friend_invites enable row level security;

-- ─── 4. Ayudas internas (no expuestas a clientes) ───────────────────────
create or replace function public._profile_label(p_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce(display_name, 'Alguien') || '#' || coalesce(tag, '0000') from public.profiles where id = p_id
$$;

create or replace function public._social_notify(p_to uuid, p_title text, p_body text, p_kind text, p_id uuid, p_payload jsonb default null)
returns void language sql security definer set search_path = public as $$
  insert into public.student_notifications (student_id, title, body, social_kind, social_id, social_payload)
  values (p_to, p_title, p_body, p_kind, p_id, p_payload)
$$;

create or replace function public._are_friends(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.friendships
    where status = 'accepted'
      and ((requester_id = a and addressee_id = b) or (requester_id = b and addressee_id = a))
  )
$$;

revoke execute on function public._profile_label(uuid) from public, anon, authenticated;
revoke execute on function public._social_notify(uuid, text, text, text, uuid, jsonb) from public, anon, authenticated;
revoke execute on function public._are_friends(uuid, uuid) from public, anon, authenticated;

-- ─── 5. Amistades ───────────────────────────────────────────────────────
create or replace function public.friend_request_send(p_name text, p_tag text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := auth.uid();
  v_to uuid;
  v_fid uuid;
  v_status text;
  v_req uuid;
begin
  if v_me is null then return jsonb_build_object('ok', false, 'message', 'No autenticado.'); end if;

  select id into v_to from public.profiles
  where lower(display_name) = lower(trim(p_name)) and tag = trim(p_tag) limit 1;
  if v_to is null then return jsonb_build_object('ok', false, 'message', 'No existe nadie con ese nombre y etiqueta.'); end if;
  if v_to = v_me then return jsonb_build_object('ok', false, 'message', 'Ese eres tú.'); end if;

  select id, status, requester_id into v_fid, v_status, v_req from public.friendships
  where (requester_id = v_me and addressee_id = v_to) or (requester_id = v_to and addressee_id = v_me) limit 1;

  if found then
    if v_status = 'accepted' then return jsonb_build_object('ok', false, 'message', 'Ya son amigos.'); end if;
    if v_req = v_me then return jsonb_build_object('ok', false, 'message', 'Ya le enviaste una solicitud; espera su respuesta.'); end if;
    -- Esa persona ya te había pedido amistad: aceptarla es lo natural.
    update public.friendships set status = 'accepted' where id = v_fid;
    delete from public.student_notifications where student_id = v_me and social_kind = 'friend_request' and social_id = v_fid;
    perform public._social_notify(v_to, '🤝 ¡Nuevo amigo!', public._profile_label(v_me) || ' aceptó tu solicitud.', 'friend_accepted', v_fid);
    return jsonb_build_object('ok', true, 'message', 'Ya te había enviado una solicitud: ¡ahora son amigos!');
  end if;

  if (select count(*) from public.friendships where requester_id = v_me and status = 'pending') >= 20 then
    return jsonb_build_object('ok', false, 'message', 'Tienes demasiadas solicitudes pendientes.');
  end if;

  insert into public.friendships (requester_id, addressee_id) values (v_me, v_to) returning id into v_fid;
  perform public._social_notify(v_to, '🤝 Solicitud de amistad', public._profile_label(v_me) || ' quiere ser tu amigo.', 'friend_request', v_fid);
  return jsonb_build_object('ok', true, 'message', 'Solicitud enviada. Tiene que aceptarla para que sean amigos.');
end;
$$;

create or replace function public.friend_request_respond(p_id uuid, p_accept boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := auth.uid();
  f public.friendships;
begin
  select * into f from public.friendships where id = p_id and addressee_id = v_me and status = 'pending';
  if not found then return jsonb_build_object('ok', false, 'message', 'Solicitud no encontrada.'); end if;

  delete from public.student_notifications where student_id = v_me and social_kind = 'friend_request' and social_id = p_id;
  if p_accept then
    update public.friendships set status = 'accepted' where id = p_id;
    perform public._social_notify(f.requester_id, '🤝 ¡Nuevo amigo!', public._profile_label(v_me) || ' aceptó tu solicitud.', 'friend_accepted', p_id);
  else
    delete from public.friendships where id = p_id;
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.friend_remove(p_other uuid)
returns void language sql security definer set search_path = public as $$
  delete from public.friendships
  where (requester_id = auth.uid() and addressee_id = p_other) or (requester_id = p_other and addressee_id = auth.uid())
$$;

create or replace function public.friends_overview()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'friends', coalesce((
      select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.display_name, 'tag', p.tag, 'avatar', p.avatar_url) order by p.display_name)
      from public.friendships f
      join public.profiles p on p.id = case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end
      where f.status = 'accepted' and auth.uid() in (f.requester_id, f.addressee_id)
    ), '[]'::jsonb),
    'incoming', coalesce((
      select jsonb_agg(jsonb_build_object('id', f.id, 'name', p.display_name, 'tag', p.tag, 'avatar', p.avatar_url) order by f.created_at)
      from public.friendships f join public.profiles p on p.id = f.requester_id
      where f.status = 'pending' and f.addressee_id = auth.uid()
    ), '[]'::jsonb),
    'outgoing', coalesce((
      select jsonb_agg(jsonb_build_object('id', f.id, 'friendId', p.id, 'name', p.display_name, 'tag', p.tag) order by f.created_at)
      from public.friendships f join public.profiles p on p.id = f.addressee_id
      where f.status = 'pending' and f.requester_id = auth.uid()
    ), '[]'::jsonb),
    'challenges', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id, 'title', i.title, 'status', i.status, 'mine', i.recipient_id = auth.uid(),
        'other', public._profile_label(case when i.sender_id = auth.uid() then i.recipient_id else i.sender_id end)
      ) order by i.created_at desc)
      from public.friend_invites i
      where i.kind = 'challenge' and i.status in ('accepted', 'done') and auth.uid() in (i.sender_id, i.recipient_id)
        and i.created_at > now() - interval '30 days'
    ), '[]'::jsonb)
  )
$$;

-- ─── 6. Regalos (1 por día; el amigo debe aceptarlo) ────────────────────
create or replace function public.gift_send(p_friend uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := auth.uid();
  v_gid uuid;
begin
  if v_me is null or not public._are_friends(v_me, p_friend) then
    return jsonb_build_object('ok', false, 'message', 'Solo puedes regalarle a tus amigos.');
  end if;
  if exists (select 1 from public.gifts where sender_id = v_me and created_at::date = current_date) then
    return jsonb_build_object('ok', false, 'message', 'Ya enviaste tu regalo de hoy — vuelve mañana.');
  end if;
  insert into public.gifts (sender_id, recipient_id) values (v_me, p_friend) returning id into v_gid;
  perform public._social_notify(p_friend, '🎁 Te enviaron un regalo', public._profile_label(v_me) || ' te envió 1,000 🪙. Acéptalo para recibirlo.', 'gift', v_gid);
  return jsonb_build_object('ok', true, 'message', 'Regalo enviado 🎁 — tu amigo tiene que aceptarlo.');
end;
$$;

-- Devuelve el monto: el cliente del que acepta lo suma a sus monedas (así el
-- autoguardado de su progreso no lo pisa).
create or replace function public.gift_respond(p_id uuid, p_accept boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := auth.uid();
  g public.gifts;
begin
  select * into g from public.gifts where id = p_id and recipient_id = v_me and status = 'pending' for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'Regalo no encontrado o ya reclamado.'); end if;
  update public.gifts set status = case when p_accept then 'accepted' else 'declined' end where id = p_id;
  delete from public.student_notifications where student_id = v_me and social_kind = 'gift' and social_id = p_id;
  perform public._social_notify(g.sender_id,
    case when p_accept then '🎁 Aceptaron tu regalo' else 'Tu regalo fue rechazado' end,
    public._profile_label(v_me) || case when p_accept then ' recibió tu regalo.' else ' no quiso el regalo.' end,
    'info', p_id);
  return jsonb_build_object('ok', true, 'accepted', p_accept, 'amount', case when p_accept then g.amount else 0 end);
end;
$$;

-- ─── 7. Invitaciones: retos, juegos y mundos ────────────────────────────
create or replace function public.invite_send(p_friend uuid, p_kind text, p_title text, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := auth.uid();
  v_id uuid;
  v_path text := p_payload->>'path';
begin
  if v_me is null or not public._are_friends(v_me, p_friend) then
    return jsonb_build_object('ok', false, 'message', 'Solo puedes invitar a tus amigos.');
  end if;
  if p_kind not in ('challenge', 'game', 'vr') or length(coalesce(p_title, '')) not between 1 and 120 then
    return jsonb_build_object('ok', false, 'message', 'Invitación no válida.');
  end if;
  -- Un juego/mundo solo puede llevar a rutas internas conocidas.
  if p_kind in ('game', 'vr') and (v_path is null or v_path !~ '^/(games/[a-z0-9-]+|vr|mundo)$') then
    return jsonb_build_object('ok', false, 'message', 'Destino no válido.');
  end if;
  if (select count(*) from public.friend_invites where sender_id = v_me and status = 'pending') >= 10 then
    return jsonb_build_object('ok', false, 'message', 'Tienes demasiadas invitaciones pendientes.');
  end if;

  insert into public.friend_invites (sender_id, recipient_id, kind, title, payload)
  values (v_me, p_friend, p_kind, p_title, case when p_kind = 'challenge' then '{}'::jsonb else jsonb_build_object('path', v_path) end)
  returning id into v_id;

  perform public._social_notify(p_friend,
    case p_kind when 'challenge' then '🎯 Te retaron' when 'game' then '🎮 Te invitan a jugar' else '🌐 Te invitan al mundo' end,
    public._profile_label(v_me) || ': ' || p_title,
    'invite', v_id, jsonb_build_object('kind', p_kind, 'path', v_path));
  return jsonb_build_object('ok', true, 'message', 'Invitación enviada. Tu amigo tiene que aceptarla.');
end;
$$;

create or replace function public.invite_respond(p_id uuid, p_accept boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := auth.uid();
  i public.friend_invites;
begin
  select * into i from public.friend_invites where id = p_id and recipient_id = v_me and status = 'pending' for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'Invitación no encontrada.'); end if;
  update public.friend_invites set status = case when p_accept then 'accepted' else 'declined' end where id = p_id;
  delete from public.student_notifications where student_id = v_me and social_kind = 'invite' and social_id = p_id;
  perform public._social_notify(i.sender_id,
    case when p_accept then '✅ Aceptaron tu invitación' else '❌ Rechazaron tu invitación' end,
    public._profile_label(v_me) || ' — ' || i.title,
    case when p_accept and i.kind in ('game', 'vr') then 'invite_accepted' else 'info' end,
    p_id, i.payload);
  return jsonb_build_object('ok', true, 'accepted', p_accept, 'kind', i.kind, 'path', i.payload->>'path');
end;
$$;

-- El retado marca su reto como cumplido (palabra de honor) y se avisa a quien lo retó.
create or replace function public.invite_complete(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := auth.uid();
  i public.friend_invites;
begin
  select * into i from public.friend_invites
  where id = p_id and recipient_id = v_me and kind = 'challenge' and status = 'accepted' for update;
  if not found then return jsonb_build_object('ok', false); end if;
  update public.friend_invites set status = 'done' where id = p_id;
  perform public._social_notify(i.sender_id, '🏆 ¡Reto cumplido!', public._profile_label(v_me) || ' cumplió: ' || i.title, 'info', p_id);
  return jsonb_build_object('ok', true);
end;
$$;

-- El regalo anterior (directo, sin aceptar) se retira.
drop function if exists public.send_daily_gift(text);

grant execute on function
  public.friend_request_send(text, text),
  public.friend_request_respond(uuid, boolean),
  public.friend_remove(uuid),
  public.friends_overview(),
  public.gift_send(uuid),
  public.gift_respond(uuid, boolean),
  public.invite_send(uuid, text, text, jsonb),
  public.invite_respond(uuid, boolean),
  public.invite_complete(uuid)
to authenticated;

notify pgrst, 'reload schema';
