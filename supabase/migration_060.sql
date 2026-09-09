-- ════════════════════════════════════════════════════════════════════════
-- Migration 060: El Oráculo de Oliver v2 — revisión comunitaria de cursos
-- generados por IA. Un alumno puede pedir que un admin revise su curso; si
-- se aprueba, se vuelve visible en la pestaña "Comunidad" del Oráculo
-- (NO en el catálogo general — courses.json sigue estático, ver el plan).
-- ════════════════════════════════════════════════════════════════════════

alter table public.courses add column if not exists review_status text
  check (review_status in ('pending','approved','rejected'));
alter table public.courses add column if not exists reviewed_by uuid references auth.users(id);
alter table public.courses add column if not exists reviewed_at timestamptz;
alter table public.courses add column if not exists review_note text;

-- Protege review_status/reviewed_by/reviewed_at/review_note de la policy de
-- UPDATE existente ("courses: users update their own ai-generated course",
-- migration_051.sql), que de otra forma dejaría a cualquier alumno
-- auto-aprobar su propio curso. Mismo patrón que
-- protect_admin_only_columns() para profiles (migration_022.sql): un admin
-- puede poner 'approved'/'rejected' (y se auto-rellenan reviewed_by/at); un
-- no-admin solo puede poner 'pending' (pedir o volver a pedir revisión),
-- cualquier otro intento de cambiar estas columnas se revierte en silencio.
create or replace function public.protect_course_review_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    if new.review_status is distinct from old.review_status
       and new.review_status in ('approved', 'rejected') then
      new.reviewed_by := auth.uid();
      new.reviewed_at := now();
    end if;
  else
    if new.review_status is distinct from old.review_status and new.review_status = 'pending' then
      -- Reenvío limpio: si el alumno pide revisión de nuevo (por ejemplo
      -- tras un rechazo), no debe arrastrar la nota/fecha de la revisión
      -- anterior.
      new.reviewed_by := null;
      new.reviewed_at := null;
      new.review_note := null;
    else
      new.review_status := old.review_status;
      new.reviewed_by := old.reviewed_by;
      new.reviewed_at := old.reviewed_at;
      new.review_note := old.review_note;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_course_review_columns_trigger on public.courses;
create trigger protect_course_review_columns_trigger
  before update on public.courses
  for each row execute function public.protect_course_review_columns();

-- ─── Notificaciones ─────────────────────────────────────────────────────
alter table public.student_notifications add column if not exists course_id text references public.courses(id) on delete cascade;

-- Pedir revisión: hecho por función security definer en vez de un insert
-- directo del alumno porque un alumno no puede, bajo RLS, saber ni
-- verificar quién es admin (profiles solo permite leer la fila propia o,
-- si eres admin, todas) — la función hace el chequeo de dueño, cambia el
-- estado, y notifica a TODOS los admins en una sola llamada de confianza.
create or replace function public.request_course_review(p_course_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course public.courses;
begin
  select * into v_course from public.courses where id = p_course_id;
  if v_course is null or v_course.created_by is distinct from auth.uid() or v_course.ai_generated is not true then
    raise exception 'not your course';
  end if;
  if v_course.review_status = 'approved' then
    raise exception 'already approved';
  end if;

  update public.courses
    set review_status = 'pending', reviewed_by = null, reviewed_at = null, review_note = null
    where id = p_course_id;

  insert into public.student_notifications (student_id, admin_id, course_id, title, body)
  select auth.uid(), p.id, p_course_id, '🔮 Nuevo curso para revisar',
         '"' || v_course.title || '" está esperando tu revisión.'
  from public.profiles p where p.role = 'admin';
end;
$$;

-- ─── Créditos en la pestaña Comunidad ───────────────────────────────────
-- courses.created_by referencia auth.users, no profiles — y profiles no se
-- puede leer libremente por otro uid bajo RLS. Esta función solo revela el
-- nombre de alguien que YA tiene al menos un curso aprobado (la misma
-- información que la pestaña Comunidad ya expone al listar el curso).
create or replace function public.get_approved_course_authors(author_ids uuid[])
returns table (id uuid, display_name text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.display_name
  from public.profiles p
  where p.id = any(author_ids)
    and exists (
      select 1 from public.courses c
      where c.created_by = p.id and c.ai_generated = true and c.review_status = 'approved'
    );
$$;
