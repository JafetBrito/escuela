-- migration_008: video de prueba para clases en vivo — permite marcar una
-- clase como "demo": en vez de abrir el link externo de Jitsi, el alumno ve
-- un video de YouTube ya preparado, para poder probar todo el Hub (agenda,
-- recursos, misiones, preguntas) sin necesitar a otra persona conectada en
-- vivo al mismo tiempo. Corre este script después de migration_007.

alter table public.live_classes add column if not exists demo_video_id text;
