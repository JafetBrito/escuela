-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 050 — Herramienta de correo masivo HTML para el admin. Tres
-- tablas nuevas, todas admin-only (RLS is_admin() puro, sin lectura pública
-- — a diferencia de school_announcements/platform_settings de
-- migration_003.sql, esto es una herramienta interna, nadie más necesita
-- verla). El envío real ocurre en la Edge Function supabase/functions/
-- send-email/ (service role + SMTP de Gmail vía Deno.env), estas tablas solo
-- guardan plantillas reutilizables, el historial de envíos y la firma.
-- ════════════════════════════════════════════════════════════════════════

-- ─── email_templates ───────────────────────────────────────────────────────
-- Plantillas guardadas por el admin (además de las 3 de arranque que viven
-- en código, src/data/emailTemplates.js — esas no necesitan fila en la base
-- porque no se editan, solo se cargan como punto de partida).
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  html_content text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.email_templates enable row level security;

drop policy if exists "email_templates: admin only" on public.email_templates;
create policy "email_templates: admin only" on public.email_templates
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── email_campaigns ───────────────────────────────────────────────────────
-- Historial/log de cada envío masivo. Lo llena la Edge Function con el
-- service role (no el navegador directamente) al terminar de mandar todos
-- los lotes BCC, sea que haya salido bien o mal.
create table if not exists public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  html_content text not null,
  recipient_count integer not null default 0,
  sent_by uuid references auth.users(id),
  status text not null default 'sending', -- sending | sent | failed
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.email_campaigns enable row level security;

drop policy if exists "email_campaigns: admin only" on public.email_campaigns;
create policy "email_campaigns: admin only" on public.email_campaigns
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── email_settings ─────────────────────────────────────────────────────────
-- Almacén genérico clave/valor para configuración chica de esta herramienta.
-- Hoy solo se usa una fila (key = 'signature', value = HTML de la firma que
-- se le pega al final de cada correo) — se elige esta forma genérica a
-- propósito para que la próxima configuración pequeña de esta herramienta no
-- necesite otra tabla ni otra columna.
create table if not exists public.email_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.email_settings enable row level security;

drop policy if exists "email_settings: admin only" on public.email_settings;
create policy "email_settings: admin only" on public.email_settings
  for all using (public.is_admin()) with check (public.is_admin());
