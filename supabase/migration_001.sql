-- ============================================================================
-- MIGRACIÓN 001 — Sistema de mascotas múltiples + tutorial
-- ============================================================================
-- Cómo aplicar:
--   1. Ve a tu proyecto en https://supabase.com
--   2. "SQL Editor" → "New query" → pega este archivo → "Run"
--
-- También puedes ejecutarlo vía CLI:
--   npx supabase login
--   npx supabase link --project-ref ukucmognrcvsaibgniei
--   npx supabase db push
-- ============================================================================

-- ── Cambios en profiles ──────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nickname           TEXT,
  ADD COLUMN IF NOT EXISTS avatar_registry_id INT DEFAULT 8,
  ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- ── Tabla de mascotas del usuario ────────────────────────────────────────────
-- Un usuario puede tener múltiples mascotas; solo 1 activa al mismo tiempo.
-- registry_id = id en mascotRegistry.js (modelo 3D, cosmético)
-- class_id    = clave de OLIVER_CLASSES (determina habilidades y progresión)
CREATE TABLE IF NOT EXISTS public.user_mascots (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registry_id   INT         NOT NULL,
  nickname      TEXT        NOT NULL DEFAULT 'Mi compañero',
  class_id      TEXT,
  skills        JSONB       NOT NULL DEFAULT '{"unlocked":[],"equipped":[],"talentPoints":3}',
  hp_max        INT         NOT NULL DEFAULT 80,
  is_active     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ          DEFAULT now()
);

ALTER TABLE public.user_mascots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_mascots: select own" ON public.user_mascots
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_mascots: insert own" ON public.user_mascots
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_mascots: update own" ON public.user_mascots
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_mascots: delete own" ON public.user_mascots
  FOR DELETE USING (auth.uid() = user_id);

-- Solo 1 mascota activa por usuario
CREATE UNIQUE INDEX IF NOT EXISTS user_mascots_one_active
  ON public.user_mascots (user_id) WHERE is_active;
