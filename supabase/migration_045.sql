-- migration_045: clase de práctica "Introducción a la plataforma", siempre
-- disponible en /clases-disponibles. Corre esto después de migration_044 (o
-- después de run_all.sql si ya lo corriste completo).

-- Se inserta SIN demo_video_id a propósito: AvailableClassesPage.jsx solo
-- muestra clases de práctica que ya tienen video
-- (classes.filter(c => c.demo_video_id)), así que esta clase queda lista
-- pero invisible hasta que se le agregue uno — desde /admin (AdminLiveClassesPage,
-- campo "ID de YouTube" con su botón Guardar) o con:
--   update public.live_classes set demo_video_id = '<id-del-video>'
--   where title = 'Introducción a la plataforma';
do $$
declare
  v_admin uuid;
begin
  select id into v_admin from public.profiles where role = 'admin' order by updated_at asc limit 1;

  insert into public.live_classes
    (title, description, meet_url, scheduled_at, status, current_topic, agenda, resources, created_by)
  values (
    'Introducción a la plataforma',
    'Un recorrido guiado por Oliver Academy: cómo moverse por el Campus, elegir un curso, hablar con tu mascota IA y ganar tus primeras monedas y XP.',
    'https://meet.jit.si/OliverAcademy-intro',
    now(),
    'programada',
    'Bienvenida y recorrido por la plataforma',
    '[{"label":"Qué es Oliver Academy"},{"label":"Tu mascota IA y cómo ayudarte"},{"label":"Cursos, misiones y monedas"},{"label":"El Campus en VR"},{"label":"Dónde pedir ayuda"}]'::jsonb,
    '[{"label":"Guía rápida de inicio","url":"/guias"}]'::jsonb,
    v_admin
  );
end $$;
