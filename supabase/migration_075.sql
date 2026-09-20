-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 075 — Las invitaciones a un mundo ahora pueden apuntar a una sala
-- de transmisión: /vr/sala/<código de 6-12 letras/números>. Es invite_send de
-- migration_074 con esa ruta añadida a la lista permitida.
-- ════════════════════════════════════════════════════════════════════════

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
  if p_kind in ('game', 'vr') and (v_path is null or v_path !~ '^/(games/[a-z0-9-]+|vr|mundo|vr/sala/[a-z0-9]{6,12})$') then
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

grant execute on function public.invite_send(uuid, text, text, jsonb) to authenticated;
notify pgrst, 'reload schema';
