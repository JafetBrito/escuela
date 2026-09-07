-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 052 — Gateway server-side para llamadas de IA (ai-chat)
-- ════════════════════════════════════════════════════════════════════════
-- Toda llamada a un proveedor de IA (mascota, NPCs de VR, El Oráculo de
-- Oliver, modo agente con herramientas) pasaba con un fetch() directo desde
-- el navegador — lo cual probablemente nunca funcionó del todo para
-- DeepSeek (y quizá otros): la mayoría de las APIs de proveedores de LLM no
-- mandan headers CORS permisivos, así que el navegador bloquea la
-- respuesta en silencio. La solución: una Edge Function nueva
-- (supabase/functions/ai-chat/) hace la llamada real del lado del
-- servidor — servidor llamando a servidor no tiene restricción CORS (es una
-- política exclusiva del navegador).
--
-- Esta tabla es el único cambio de esquema que necesita ese cambio: un
-- almacén genérico clave/valor (mismo patrón que email_settings, ver
-- migration_050.sql) para UNA fila (key = 'system_prompt_prefix') con un
-- prefijo de "actitud" que la Edge Function antepone a los mensajes de
-- TODA llamada de IA, editable sin redeploy desde el panel admin.
create table if not exists public.ai_gateway_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.ai_gateway_settings enable row level security;

drop policy if exists "ai_gateway_settings: admin only" on public.ai_gateway_settings;
create policy "ai_gateway_settings: admin only" on public.ai_gateway_settings
  for all using (public.is_admin()) with check (public.is_admin());
