-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 077 — Clases en vivo del profesor. Un profesor crea y conduce
-- clases SOLO para los alumnos de su academia (live_classes.academy_id).
--
-- • Crear y notificar pasa por funciones acotadas (no toca profiles).
-- • Actualizar/borrar/responder: solo en SUS clases (created_by).
-- • Las clases de una academia solo las ven los alumnos inscritos en ella
--   (más el profesor y los admins); las clases sin academia siguen igual.
-- • Las recompensas (XP/oro) siguen siendo solo de admin.
-- Requiere migration_076 (_my_teacher_academy) y migration_048 (is_teacher).
-- ════════════════════════════════════════════════════════════════════════

alter table public.live_classes add column if not exists academy_id text;

-- Academia de la cuenta actual, cualquiera sea su rol (sirve dentro de políticas).
create or replace function public._my_academy()
returns text language sql stable security definer set search_path = public as $$
  select academy_id from public.profiles where id = auth.uid()
$$;
grant execute on function public._my_academy() to authenticated;

-- ─── Quién ve qué ───────────────────────────────────────────────────────
drop policy if exists "live_classes: read own or admin" on public.live_classes;
create policy "live_classes: read own or admin" on public.live_classes
  for select using (
    public.is_admin()
    or created_by = auth.uid()
    or ((student_id is null or student_id = auth.uid()) and (academy_id is null or academy_id = public._my_academy()))
  );

-- ─── El profesor conduce SUS clases ─────────────────────────────────────
drop policy if exists "live_classes: teacher updates own" on public.live_classes;
create policy "live_classes: teacher updates own" on public.live_classes
  for update using (public.is_teacher() and created_by = auth.uid())
  with check (public.is_teacher() and created_by = auth.uid());

drop policy if exists "live_classes: teacher deletes own" on public.live_classes;
create policy "live_classes: teacher deletes own" on public.live_classes
  for delete using (public.is_teacher() and created_by = auth.uid());

drop policy if exists "live_class_questions: teacher answers own" on public.live_class_questions;
create policy "live_class_questions: teacher answers own" on public.live_class_questions
  for update using (public.is_teacher() and exists (
    select 1 from public.live_classes c where c.id = live_class_id and c.created_by = auth.uid()));

drop policy if exists "live_class_questions: teacher deletes own" on public.live_class_questions;
create policy "live_class_questions: teacher deletes own" on public.live_class_questions
  for delete using (public.is_teacher() and exists (
    select 1 from public.live_classes c where c.id = live_class_id and c.created_by = auth.uid()));

drop policy if exists "live_class_pings: teacher reads own class" on public.live_class_pings;
create policy "live_class_pings: teacher reads own class" on public.live_class_pings
  for select using (exists (
    select 1 from public.live_classes c where c.id = live_class_id and c.created_by = auth.uid()));

drop policy if exists "live_class_chat: teacher deletes own" on public.live_class_chat;
create policy "live_class_chat: teacher deletes own" on public.live_class_chat
  for delete using (public.is_teacher() and exists (
    select 1 from public.live_classes c where c.id = live_class_id and c.created_by = auth.uid()));

drop policy if exists "class-resources: teacher upload" on storage.objects;
create policy "class-resources: teacher upload" on storage.objects
  for insert with check (bucket_id = 'class-resources' and public.is_teacher());

drop policy if exists "class-resources: teacher delete" on storage.objects;
create policy "class-resources: teacher delete" on storage.objects
  for delete using (bucket_id = 'class-resources' and public.is_teacher());

-- ─── Crear (y avisar a los alumnos de la academia) ──────────────────────
create or replace function public.teacher_create_live_class(p_title text, p_description text, p_meet_url text, p_scheduled timestamptz)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_academy text := public._my_teacher_academy();
  v_id uuid;
begin
  if v_academy is null then return jsonb_build_object('ok', false, 'message', 'Tu cuenta no pertenece a una academia todavía.'); end if;
  if length(trim(coalesce(p_title, ''))) not between 1 and 140 then return jsonb_build_object('ok', false, 'message', 'El título es obligatorio.'); end if;
  if p_meet_url !~ '^https://' and p_meet_url !~ '^https?://[^/]+/vr/sala/[a-z0-9]{6,12}$' then
    return jsonb_build_object('ok', false, 'message', 'Enlace de clase no válido.');
  end if;

  insert into public.live_classes (title, description, meet_url, scheduled_at, created_by, academy_id)
  values (trim(p_title), nullif(trim(coalesce(p_description, '')), ''), p_meet_url, p_scheduled, auth.uid(), v_academy)
  returning id into v_id;

  insert into public.student_notifications (student_id, class_id, title, body)
  select id, v_id, '📅 Nueva clase en tu academia', trim(p_title) from public.profiles where role = 'student' and academy_id = v_academy;

  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;

-- Avisar "¡tu clase está en vivo!" a los alumnos de la academia (la clase ya se marcó en_vivo).
create or replace function public.teacher_notify_live(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare c public.live_classes;
begin
  select * into c from public.live_classes where id = p_id and created_by = auth.uid() and academy_id is not null;
  if not found then return; end if;
  insert into public.student_notifications (student_id, class_id, title, body)
  select id, p_id, '¡Tu clase está en vivo!', c.title from public.profiles where role = 'student' and academy_id = c.academy_id;
end;
$$;

grant execute on function
  public.teacher_create_live_class(text, text, text, timestamptz),
  public.teacher_notify_live(uuid)
to authenticated;

notify pgrst, 'reload schema';
