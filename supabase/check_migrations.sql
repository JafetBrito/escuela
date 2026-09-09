-- ════════════════════════════════════════════════════════════════════════
-- Chequeo de migraciones aplicadas — pegar en el SQL Editor de Supabase.
-- Para cada una de las 51 migraciones de supabase/*.sql, busca una "huella"
-- real en tu base (una tabla, columna, función, política o fila que esa
-- migración crea) y te dice si está o no. Generado automáticamente
-- leyendo los archivos de migración — no es infalible al 100% (algunas
-- migraciones viejas de puro contenido usan un chequeo aproximado), pero
-- para cualquier "aplicada = false" es una señal confiable de que falta.
--
-- No es una migración — no la agregues a run_all.sql, es de solo lectura,
-- se puede volver a correr cuantas veces quieras.
-- ════════════════════════════════════════════════════════════════════════

select '001' as migracion, 'Sistema de mascotas múltiples + tutorial' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='user_mascots') as aplicada
union all
select '002' as migracion, 'Mi Equipo: entity_progress, item_types, player_items,' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='entity_progress') as aplicada
union all
select '003' as migracion, 'migration_003: tareas de alumnos, anuncios escolares y confi' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='student_tasks') as aplicada
union all
select '004' as migracion, 'migration_004: tipos de tarea (Tarea/Proyecto/Examen) + noti' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='student_notifications') as aplicada
union all
select '005' as migracion, 'migration_005: campos extra específicos por tipo de tarea (d' as descripcion, exists (select 1 from information_schema.columns where table_schema='public' and table_name='student_tasks' and column_name='details') as aplicada
union all
select '006' as migracion, 'migration_006: Mis Clases — clases en vivo (Google Meet exte' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='live_classes') as aplicada
union all
select '007' as migracion, 'migration_007: Mis Clases v2 — clase dirigida a un alumno es' as descripcion, exists (select 1 from information_schema.columns where table_schema='public' and table_name='live_classes' and column_name='student_id') as aplicada
union all
select '008' as migracion, 'migration_008: video de prueba para clases en vivo — permite' as descripcion, exists (select 1 from information_schema.columns where table_schema='public' and table_name='live_classes' and column_name='demo_video_id') as aplicada
union all
select '009' as migracion, 'migration_009: acciones rápidas en el Hub (levantar la mano ' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='live_class_pings') as aplicada
union all
select '010' as migracion, 'Proyectos (student_projects)' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='student_projects') as aplicada
union all
select '011' as migracion, 'Entregas en Markdown + preguntas por tarea' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='task_questions') as aplicada
union all
select '012' as migracion, 'class_id en notificaciones (deep-link a "tu clase está en vi' as descripcion, exists (select 1 from information_schema.columns where table_schema='public' and table_name='student_notifications' and column_name='class_id') as aplicada
union all
select '013' as migracion, 'el admin también puede enviar ping ("atención") al alumno' as descripcion, exists (select 1 from pg_policies where schemaname='public' and tablename='live_class_pings' and policyname='live_class_pings: admin sends') as aplicada
union all
select '014' as migracion, 'nombre del alumno en la clase + chat temporal por clase' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='live_class_chat') as aplicada
union all
select '015' as migracion, 'recompensas XP/oro en tareas y clases, misión real' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='course_exams') as aplicada
union all
select '016' as migracion, 'ajedrez en línea: invitar por username, partidas con reloj' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='chess_invites') as aplicada
union all
select '017' as migracion, 'exámenes multi-idioma (course_exams.translations)' as descripcion, exists (select 1 from information_schema.columns where table_schema='public' and table_name='course_exams' and column_name='translations') as aplicada
union all
select '018' as migracion, 'Podcasts (playlist de YouTube)' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='podcasts') as aplicada
union all
select '019' as migracion, 'límite de tiempo por examen (course_exams.time_limit_minutes' as descripcion, exists (select 1 from information_schema.columns where table_schema='public' and table_name='course_exams' and column_name='time_limit_minutes') as aplicada
union all
select '020' as migracion, 'recompensa de graduación (XP/oro) por curso' as descripcion, exists (select 1 from information_schema.columns where table_schema='public' and table_name='course_exams' and column_name='graduation_xp') as aplicada
union all
select '021' as migracion, 'perfil de edad por cuenta (niños / normal / abuelos)' as descripcion, exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='age_profile') as aplicada
union all
select '022' as migracion, 'cuentas de niños pendientes de aprobación del admin' as descripcion, exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='account_status') as aplicada
union all
select '023' as migracion, 'el alumno puede borrar sus propias notificaciones' as descripcion, exists (select 1 from pg_policies where schemaname='public' and tablename='student_notifications' and policyname='notifications: student deletes own') as aplicada
union all
select '024' as migracion, 'tabla `courses`: contenido de cursos editable en vivo' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='courses') as aplicada
union all
select '025' as migracion, 'semilla de public.courses (generado por' as descripcion, exists (select 1 from public.courses where id = 'course-001') as aplicada
union all
select '026' as migracion, 'trivia en línea: banco de preguntas por categoría,' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='trivia_questions') as aplicada
union all
select '027' as migracion, 'arregla el mismo hueco de RLS que ya se cerró para trivia' as descripcion, exists (select 1 from pg_policies where schemaname='public' and tablename='student_notifications' and policyname='notifications: chess invite participant creates') as aplicada
union all
select '028' as migracion, '3 cursos nuevos en Academia de Programación: Fundamentos' as descripcion, exists (select 1 from public.courses where id = 'course-009') as aplicada
union all
select '029' as migracion, '8 cursos nuevos: 5 de fundamentos de ingeniería (Civil,' as descripcion, exists (select 1 from public.courses where id = 'course-ing-civil') as aplicada
union all
select '030' as migracion, '6 cursos nuevos: Escuela de Medicina ampliada (Anatomía y' as descripcion, exists (select 1 from public.courses where id = 'course-medicina-anatomia') as aplicada
union all
select '031' as migracion, '6 cursos nuevos: Prompt Engineering Práctico, Introducción' as descripcion, exists (select 1 from public.courses where id = 'course-prompt-practico') as aplicada
union all
select '032' as migracion, 'Agrega 2 video-lecciones generadas (Remotion + TTS) a' as descripcion, exists (select 1 from public.courses where id = 'course-003' and modules::text like '%aqz-KE-bpKQ%') as aplicada
union all
select '033' as migracion, '"Vista de Reclutador": enlaces de acceso temporal (24h)' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='recruiter_passes') as aplicada
union all
select '034' as migracion, '3 cursos nuevos para principiantes absolutos:' as descripcion, exists (select 1 from public.courses where id = 'course-consola-basica') as aplicada
union all
select '035' as migracion, 'Banco de preguntas para NZT48 (trivia): 120' as descripcion, exists (select 1 from public.trivia_questions where category = 'Ciencia' and questions::text like '%q-1-q6nf6b%') as aplicada
union all
select '036' as migracion, '"Oliver Cyber Range: Hospital": Hacker vs Doctor en' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='hospital_invites') as aplicada
union all
select '037' as migracion, '"4 Pared": teléfono en el mundo VR, mensajes prearmados' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='phone_messages') as aplicada
union all
select '038' as migracion, 'Curso "Git y GitHub: de Cero a Experto" (course-git-github)' as descripcion, exists (select 1 from public.courses where id = 'course-git-github') as aplicada
union all
select '039' as migracion, 'Curso "Matemáticas de la Antigua Grecia: Axiomas y los' as descripcion, exists (select 1 from public.courses where id = 'course-matematicas-griegas') as aplicada
union all
select '040' as migracion, 'Curso "APIs con Python: Crea tu Bot Consultor de Telegram"' as descripcion, exists (select 1 from public.courses where id = 'course-apis-python-telegram-bot') as aplicada
union all
select '041' as migracion, 'Curso "Ciberseguridad para Todos: Protege tu Vida Digital"' as descripcion, exists (select 1 from public.courses where id = 'course-ciberseguridad-basica') as aplicada
union all
select '042' as migracion, 'Curso "Inglés desde Cero (A1): Tu Primer Paso"' as descripcion, exists (select 1 from public.courses where id = 'course-ingles-a1') as aplicada
union all
select '043' as migracion, 'migration_043: Foro (MVP) + regalo diario entre amigos' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='forum_posts') as aplicada
union all
select '044' as migracion, 'migration_044: permite borrar mensajes viejos del chat de "C' as descripcion, exists (select 1 from pg_policies where schemaname='public' and tablename='online_chat_messages' and policyname='online_chat: delete old') as aplicada
union all
select '045' as migracion, 'migration_045: clase de práctica "Introducción a la platafor' as descripcion, exists (select 1 from public.live_classes where title = 'Introducción a la plataforma') as aplicada
union all
select '046' as migracion, 'Academia de China: 2 cursos nuevos' as descripcion, exists (select 1 from public.courses where id = 'course-china-caracteres') as aplicada
union all
select '047' as migracion, 'Notificaciones de tareas/proyectos en ambas direcciones.' as descripcion, exists (select 1 from information_schema.columns where table_schema='public' and table_name='student_notifications' and column_name='admin_id') as aplicada
union all
select '048' as migracion, 'Rol de profesor real. Hasta ahora la app solo conocía' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='lesson_reflections') as aplicada
union all
select '049' as migracion, 'Envío de reflexión de clase (alumno → profesor). La' as descripcion, exists (select 1 from information_schema.columns where table_schema='public' and table_name='student_notifications' and column_name='teacher_id') as aplicada
union all
select '050' as migracion, 'Herramienta de correo masivo HTML para el admin. Tres' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='email_templates') as aplicada
union all
select '051' as migracion, '"El Oráculo de Oliver": generador de cursos con IA' as descripcion, exists (select 1 from information_schema.columns where table_schema='public' and table_name='courses' and column_name='created_by') as aplicada
union all
select '052' as migracion, 'ai_gateway_settings: prompt de sistema global editable' as descripcion, exists (select 1 from information_schema.tables where table_schema='public' and table_name='ai_gateway_settings') as aplicada
union all
select '053' as migracion, 'Anatomía 12 sistemas + curso Cómo Funciona Nuestro Cerebro' as descripcion, exists (select 1 from public.courses where id = 'course-cerebro-neurociencia') as aplicada
union all
select '054' as migracion, 'Curso Evaluación del Paciente y Signos Vitales' as descripcion, exists (select 1 from public.courses where id = 'course-valoracion-paciente') as aplicada
union all
select '055' as migracion, 'Atlas del Cuerpo Humano: los 12 Sistemas' as descripcion, exists (select 1 from public.courses where id = 'course-atlas-cuerpo-humano') as aplicada
union all
select '056' as migracion, 'Atlas del Cuerpo Humano: ilustraciones reales (Wikimedia Commons)' as descripcion, exists (select 1 from public.courses where id = 'course-atlas-cuerpo-humano' and modules::text like '%sistema-esqueletico.jpg%') as aplicada
union all
select '057' as migracion, 'Academia de IA en inglés: course-001/003/prompt-practico via translations.en' as descripcion, exists (select 1 from public.courses where id = 'course-prompt-practico' and translations->'en'->>'title' is not null) as aplicada
order by 1;
