-- migration_044: permite borrar mensajes viejos del chat de "Clase Online".
-- Corre este script después de migration_043 (o después de run_all.sql si ya
-- lo corriste completo).

-- online_chat_messages (migration_009) solo tenía políticas de select/insert
-- — sin una de delete, RLS bloquea cualquier borrado por defecto. El cliente
-- (useOnlineChatStore.connect) borra oportunistamente los mensajes de más de
-- un día cada vez que alguien abre el canal (no hay cron en este proyecto).
-- La política solo permite borrar mensajes YA viejos (created_at < 1 día),
-- así que aunque un cliente intente borrar algo reciente, RLS lo bloquea.
drop policy if exists "online_chat: delete old" on public.online_chat_messages;
create policy "online_chat: delete old" on public.online_chat_messages
  for delete using (auth.uid() is not null and created_at < now() - interval '1 day');
