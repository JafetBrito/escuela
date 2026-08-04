-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 027 — arregla el mismo hueco de RLS que ya se cerró para trivia
-- (migration_026.sql), pero para ajedrez: student_notifications solo tenía
-- la política "admin creates" (migration_004.sql), así que el insert que
-- hace useChessStore.js (sendInvite/respondInvite) al notificar una
-- invitación fallaba en silencio para cualquier alumno — la fila de
-- chess_invites sí se creaba, pero la notificación de campanita del
-- invitado nunca llegaba.
-- ════════════════════════════════════════════════════════════════════════

drop policy if exists "notifications: chess invite participant creates" on public.student_notifications;
create policy "notifications: chess invite participant creates" on public.student_notifications
  for insert with check (
    chess_invite_id is not null
    and coalesce(xp_reward, 0) = 0
    and coalesce(gold_reward, 0) = 0
    and exists (
      select 1 from public.chess_invites ci
      where ci.id = chess_invite_id
        and auth.uid() in (ci.from_id, ci.to_id)
        and student_id in (ci.from_id, ci.to_id)
    )
  );
