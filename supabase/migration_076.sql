-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 076 — Poderes del profesor, primera parte: ver a los alumnos
-- inscritos en SU academia, asignarles tareas y calificarlas.
--
-- Un alumno se inscribe a una academia desde la página de esa academia
-- (profiles.academy_id, migration_067). Un profesor pertenece a la academia
-- a la que lo sumó su director (assign_teacher_to_academy, migration_068).
-- Todo pasa por funciones acotadas: el profesor NUNCA lee ni escribe
-- directamente profiles/student_tasks, solo lo que estas funciones permiten
-- (y nunca datos privados como el nombre real o el correo).
-- ════════════════════════════════════════════════════════════════════════

-- Autosuficiente: por si esta migración se corre antes que la 073/074, se
-- asegura la columna tag y la función que arma "Nombre#1234".
alter table public.profiles add column if not exists tag text;

create or replace function public._profile_label(p_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce(display_name, 'Alguien') || '#' || coalesce(tag, '0000') from public.profiles where id = p_id
$$;
revoke execute on function public._profile_label(uuid) from public, anon, authenticated;

create or replace function public._my_teacher_academy()
returns text language sql stable security definer set search_path = public as $$
  select academy_id from public.profiles where id = auth.uid() and role in ('teacher', 'director')
$$;
revoke execute on function public._my_teacher_academy() from public, anon, authenticated;

-- Alumnos inscritos en mi academia.
create or replace function public.teacher_roster()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'name', p.display_name, 'tag', p.tag, 'avatar', p.avatar_url) order by p.display_name), '[]'::jsonb)
  from public.profiles p
  where public._my_teacher_academy() is not null
    and p.role = 'student' and p.academy_id = public._my_teacher_academy()
$$;

-- Asignar una tarea a varios alumnos de mi academia (los demás ids se ignoran).
create or replace function public.teacher_assign_task(p_students uuid[], p_title text, p_description text, p_subject text, p_due date)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_academy text := public._my_teacher_academy();
  v_student uuid;
  v_task uuid;
  v_count int := 0;
begin
  if v_academy is null then return jsonb_build_object('ok', false, 'message', 'Tu cuenta no pertenece a una academia todavía.'); end if;
  if length(trim(coalesce(p_title, ''))) not between 1 and 140 then return jsonb_build_object('ok', false, 'message', 'El título es obligatorio (máx. 140).'); end if;

  for v_student in
    select id from public.profiles where id = any(p_students) and role = 'student' and academy_id = v_academy
  loop
    insert into public.student_tasks (student_id, title, description, subject, due_date, assigned_by)
    values (v_student, trim(p_title), nullif(trim(coalesce(p_description, '')), ''), nullif(trim(coalesce(p_subject, '')), ''), p_due, auth.uid())
    returning id into v_task;
    insert into public.student_notifications (student_id, task_id, title, body)
    values (v_student, v_task, '📋 Nueva tarea: ' || trim(p_title), 'Tu profesor te asignó una tarea' || case when p_due is not null then ' para el ' || to_char(p_due, 'DD/MM') else '' end || '.');
    v_count := v_count + 1;
  end loop;

  return jsonb_build_object('ok', v_count > 0, 'count', v_count,
    'message', case when v_count > 0 then 'Tarea asignada a ' || v_count || ' alumno(s).' else 'Ningún alumno válido seleccionado.' end);
end;
$$;

-- Tareas que yo asigné, con el alumno.
create or replace function public.teacher_tasks()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', t.id, 'title', t.title, 'description', t.description, 'subject', t.subject, 'due', t.due_date,
    'status', t.status, 'grade', t.grade, 'gradeMax', t.grade_max, 'feedback', t.feedback,
    'student', public._profile_label(t.student_id), 'created', t.created_at
  ) order by (t.status = 'entregada') desc, t.created_at desc), '[]'::jsonb)
  from public.student_tasks t
  where t.assigned_by = auth.uid() and public._my_teacher_academy() is not null
$$;

-- Calificar una tarea mía (ya entregada o no) y avisar al alumno.
create or replace function public.teacher_grade_task(p_task uuid, p_grade numeric, p_feedback text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare t public.student_tasks;
begin
  select * into t from public.student_tasks where id = p_task and assigned_by = auth.uid() for update;
  if not found then return jsonb_build_object('ok', false, 'message', 'Tarea no encontrada.'); end if;
  if p_grade is null or p_grade < 0 or p_grade > coalesce(t.grade_max, 10) then
    return jsonb_build_object('ok', false, 'message', 'La calificación debe estar entre 0 y ' || coalesce(t.grade_max, 10) || '.');
  end if;
  update public.student_tasks
  set grade = p_grade, feedback = nullif(trim(coalesce(p_feedback, '')), ''), status = 'revisada', updated_at = now()
  where id = p_task;
  insert into public.student_notifications (student_id, task_id, title, body)
  values (t.student_id, p_task, '⭐ Tu tarea fue calificada', t.title || ': ' || p_grade || '/' || coalesce(t.grade_max, 10));
  return jsonb_build_object('ok', true, 'message', 'Calificación enviada.');
end;
$$;

grant execute on function
  public.teacher_roster(),
  public.teacher_assign_task(uuid[], text, text, text, date),
  public.teacher_tasks(),
  public.teacher_grade_task(uuid, numeric, text)
to authenticated;

notify pgrst, 'reload schema';
