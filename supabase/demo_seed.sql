-- demo_seed.sql — datos de prueba para ver /mis-tareas, /anuncios y /mis-clases
-- poblados. NO es una migración de esquema, solo datos. Corre esto en el
-- SQL Editor de Supabase DESPUÉS de haber corrido migration_001 a 008.
--
-- Todo lo que crea este script empieza con "🧪 DEMO —" en el título, para que
-- sea fácil de encontrar y borrar. Para limpiar todo cuando ya no lo necesites,
-- corre esto:
--
--   delete from public.live_class_questions where live_class_id in (select id from public.live_classes where title like '🧪 DEMO —%');
--   delete from public.live_classes         where title like '🧪 DEMO —%';
--   delete from public.student_notifications where title like '🧪 DEMO —%';
--   delete from public.student_tasks         where title like '🧪 DEMO —%';
--   delete from public.school_announcements  where title like '🧪 DEMO —%';

do $$
declare
  demo_student uuid;
  demo_admin   uuid;
  t1 uuid; t2 uuid; t3 uuid; t4 uuid; t5 uuid;
begin
  select id into demo_student from public.profiles where role = 'student' order by updated_at asc limit 1;
  select id into demo_admin   from public.profiles where role = 'admin'   order by updated_at asc limit 1;

  if demo_student is null then
    raise notice 'No hay ningún alumno (role=student) todavía — crea una cuenta normal primero y vuelve a correr este script.';
    return;
  end if;

  -- ─── Clases en vivo (Mis Clases) ─────────────────────────────────────────
  -- Esta trae demo_video_id: en vez del link de Jitsi, el alumno ve un video
  -- de YouTube ya cargado — así puedes probar tú solo todo el Hub (agenda,
  -- recursos, misiones, preguntas en tiempo real) sin necesitar una segunda
  -- persona conectada. Está "en_vivo" desde ya, no hace falta darle Iniciar.
  insert into public.live_classes (title, description, meet_url, scheduled_at, status, current_topic, agenda, resources, missions, student_id, created_by, demo_video_id)
  values (
    '🧪 DEMO — Clase en vivo ahora mismo',
    'Repaso de closures y scope en JavaScript.',
    'https://meet.jit.si/OliverAcademy-demo-live',
    now() - interval '10 minutes',
    'en_vivo',
    'Closures: ejemplo con contador',
    '[{"label":"Repaso de scope"},{"label":"Closures: ejemplo con contador"},{"label":"Ejercicio en vivo"},{"label":"Preguntas"}]'::jsonb,
    '[{"label":"Diapositiva de portada","url":"https://picsum.photos/seed/oliver1/400/300","type":"image"},{"label":"Guía de la clase (PDF)","url":"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf","type":"pdf"},{"label":"Repo de ejemplos","url":"https://github.com"}]'::jsonb,
    '[{"title":"Escribe una función contador con closure","description":"Usa el patrón visto en clase y pruébalo en la consola."}]'::jsonb,
    demo_student, demo_admin, 'aqz-KE-bpKQ'
  );

  insert into public.live_classes (title, description, meet_url, scheduled_at, status, student_id, created_by)
  values (
    '🧪 DEMO — Empieza en 5 minutos',
    'Clase de práctica — el enlace ya debería estar desbloqueado.',
    'https://meet.jit.si/OliverAcademy-demo-soon',
    now() + interval '5 minutes',
    'programada',
    demo_student, demo_admin
  );

  insert into public.live_classes (title, description, meet_url, scheduled_at, status, student_id, created_by)
  values (
    '🧪 DEMO — Mañana',
    'Clase programada, todavía bloqueada.',
    'https://meet.jit.si/OliverAcademy-demo-tomorrow',
    now() + interval '1 day',
    'programada',
    demo_student, demo_admin
  );

  insert into public.live_classes (title, description, meet_url, scheduled_at, status, student_id, created_by)
  values (
    '🧪 DEMO — Más avanzada esta semana',
    'Otra clase programada para probar el calendario semanal.',
    'https://meet.jit.si/OliverAcademy-demo-week',
    now() + interval '3 days',
    'programada',
    demo_student, demo_admin
  );

  insert into public.live_classes (title, description, meet_url, scheduled_at, status, student_id, created_by)
  values (
    '🧪 DEMO — Clase de la semana pasada',
    'Ya terminó.',
    'https://meet.jit.si/OliverAcademy-demo-past',
    now() - interval '3 days',
    'finalizada',
    demo_student, demo_admin
  );

  -- ─── Tareas / proyectos / exámenes (Mis Tareas) ─────────────────────────
  insert into public.student_tasks (student_id, title, description, subject, type, status, due_date, assigned_by)
  values (demo_student, '🧪 DEMO — Ejercicios de closures', 'Resuelve los 5 ejercicios del PDF.', 'Programación', 'tarea', 'pendiente', current_date - 2, demo_admin)
  returning id into t1;

  insert into public.student_tasks (student_id, title, description, subject, type, status, due_date, assigned_by)
  values (demo_student, '🧪 DEMO — Ensayo corto: ética utilitarista', 'Mínimo 300 palabras.', 'Filosofía', 'tarea', 'pendiente', current_date + 1, demo_admin)
  returning id into t2;

  insert into public.student_tasks (student_id, title, description, subject, type, status, due_date, assigned_by, details)
  values (demo_student, '🧪 DEMO — Proyecto final: mini API', 'Construye una API REST simple con 3 endpoints.', 'Programación', 'proyecto', 'pendiente', current_date + 6, demo_admin,
    '{"deliverables":["Repositorio en GitHub","README con instrucciones","Video de 2 min explicando el código"]}'::jsonb)
  returning id into t3;

  insert into public.student_tasks (student_id, title, description, subject, type, status, due_date, assigned_by, details)
  values (demo_student, '🧪 DEMO — Examen parcial de Historia', 'Temas: Revolución Francesa e independencia de México.', 'Historia', 'examen', 'pendiente', current_date + 4, demo_admin,
    '{"time":"18:00","duration_minutes":45,"modality":"Oral por videollamada","topics":["Revolución Francesa","Independencia de México"]}'::jsonb)
  returning id into t4;

  insert into public.student_tasks (student_id, title, description, subject, type, status, due_date, assigned_by)
  values (demo_student, '🧪 DEMO — Tarea entregada, esperando revisión', 'Resumen del capítulo 3.', 'Biología', 'tarea', 'entregada', current_date - 1, demo_admin);

  insert into public.student_tasks (student_id, title, description, subject, type, status, due_date, assigned_by, grade, grade_max, feedback)
  values (demo_student, '🧪 DEMO — Tarea ya calificada', 'Práctica de fracciones.', 'Matemáticas', 'tarea', 'revisada', current_date - 5, demo_admin, 8.5, 10, '¡Buen trabajo! Solo revisa el ejercicio 4, te faltó simplificar.')
  returning id into t5;

  -- ─── Tablón de anuncios ───────────────────────────────────────────────────
  insert into public.school_announcements (title, body, icon, category, pinned, created_by)
  values ('🧪 DEMO — Bienvenidos al nuevo sistema de clases en vivo', 'Ya pueden ver sus clases programadas desde Mis Clases y Mis Tareas.', '🎓', 'general', true, demo_admin);

  insert into public.school_announcements (title, body, icon, category, created_by)
  values ('🧪 DEMO — Recordatorio: examen de Historia esta semana', 'Revisen los temas en Mis Tareas.', '🔔', 'recordatorio', demo_admin);

  insert into public.school_announcements (title, body, icon, category, created_by)
  values ('🧪 DEMO — Evento: sesión de dudas en vivo el viernes', 'Sesión abierta para resolver dudas de todos los cursos.', '📅', 'evento', demo_admin);

  -- ─── Buzón personal (student_notifications) ─────────────────────────────
  insert into public.student_notifications (student_id, task_id, title, body, read_at)
  values (demo_student, t5, '🧪 DEMO — Calificaron tu tarea', '"🧪 DEMO — Tarea ya calificada" · 8.5/10', now() - interval '1 day');

  insert into public.student_notifications (student_id, title, body)
  values (demo_student, '🧪 DEMO — ¡Tu clase está en vivo!', '🧪 DEMO — Clase en vivo ahora mismo');

  raise notice 'Datos demo creados para el alumno %', demo_student;
end $$;
