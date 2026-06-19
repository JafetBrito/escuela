-- ============================================================================
-- MIGRACIÓN 002 — Mi Equipo: entity_progress, item_types, player_items,
--                             player_equipment
-- ============================================================================
-- Idempotente: seguro de ejecutar varias veces (IF NOT EXISTS / ON CONFLICT DO NOTHING).
--
-- Cómo aplicar (elige una opción):
--
-- OPCIÓN A — Supabase Dashboard:
--   1. Ir a https://supabase.com/dashboard/project/ukucmognrcvsaibgniei/sql/new
--   2. Pegar TODO este archivo → Run
--
-- OPCIÓN B — CLI con DB password:
--   npx supabase link --project-ref ukucmognrcvsaibgniei --password <DB_PASSWORD>
--   npx supabase db push
--   (DB password: Settings → Database → Connection info → Database password)
--
-- OPCIÓN C — psql directo:
--   psql "postgresql://postgres.<ref>:<DB_PASSWORD>@aws-0-us-east-1.pooler.supabase.com:6543/postgres" -f migration_002.sql
-- ============================================================================

-- ─── 1. entity_progress ──────────────────────────────────────────────────────
-- Nivel y XP por entidad (avatar / mascota / futuras). Separado del snapshot
-- JSON para poder consultarse y actualizarse de forma eficiente.
CREATE TABLE IF NOT EXISTS public.entity_progress (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_id   TEXT        NOT NULL,           -- 'avatar' | 'mascota'
  level       INTEGER     NOT NULL DEFAULT 1  CHECK (level >= 1),
  current_xp  INTEGER     NOT NULL DEFAULT 0  CHECK (current_xp >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT entity_progress_user_entity UNIQUE (user_id, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_entity_progress_user
  ON public.entity_progress (user_id);

-- auto-actualizar updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_ep_updated_at ON public.entity_progress;
CREATE TRIGGER trg_ep_updated_at
  BEFORE UPDATE ON public.entity_progress
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.entity_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ep_owner" ON public.entity_progress;
CREATE POLICY "ep_owner" ON public.entity_progress
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 2. item_types ───────────────────────────────────────────────────────────
-- Catálogo maestro de todos los tipos de ítem del juego.
-- kind: 'equipment' | 'consumable' | 'radio-player' | 'ai-prompt' | 'cosmetic'
-- rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
CREATE TABLE IF NOT EXISTS public.item_types (
  id          TEXT        NOT NULL PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT,
  icon        TEXT,
  kind        TEXT        NOT NULL DEFAULT 'consumable',
  rarity      TEXT        NOT NULL DEFAULT 'common',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.item_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "it_public_read" ON public.item_types;
CREATE POLICY "it_public_read" ON public.item_types
  FOR SELECT USING (true);

-- Seed del catálogo (coincide con shopRegistry.js / itemsRegistry.js)
INSERT INTO public.item_types (id, name, description, icon, kind, rarity) VALUES
  ('radio',              'Radio',               'Mini reproductor de música portátil',       '📻', 'radio-player', 'common'),
  ('camara',             'Cámara',              'Toma fotos de tus aventuras',               '📷', 'equipment',    'common'),
  ('libro-python',       'Libro: Python',       'Referencia de programación en Python',      '📗', 'equipment',    'common'),
  ('libro-ia',           'Libro: IA',           'Introducción práctica a la IA',             '📘', 'equipment',    'common'),
  ('calavera-de-guldan', 'Calavera de Gul''dan','Artefacto legendario. Otorga sabiduría oscura.', '💀', 'equipment', 'legendary'),
  ('bola-de-nieve',      'Bola de Nieve',       'Lanzable en el mundo VR. Efecto estético.', '❄️', 'consumable',  'common')
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  icon        = EXCLUDED.icon,
  kind        = EXCLUDED.kind,
  rarity      = EXCLUDED.rarity;

-- ─── 3. player_items ─────────────────────────────────────────────────────────
-- Ítems que posee el usuario (colección). quantity >= 1.
CREATE TABLE IF NOT EXISTS public.player_items (
  id           UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type_id TEXT        NOT NULL REFERENCES public.item_types(id),
  quantity     INTEGER     NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  acquired_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pi_user_item UNIQUE (user_id, item_type_id)
);

CREATE INDEX IF NOT EXISTS idx_player_items_user
  ON public.player_items (user_id);

ALTER TABLE public.player_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pi_owner" ON public.player_items;
CREATE POLICY "pi_owner" ON public.player_items
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 4. player_equipment ─────────────────────────────────────────────────────
-- Qué lleva equipado cada entidad del usuario en cada slot.
-- Slots estándar: 'weapon' | 'head' | 'body' | 'accessory' | 'relic'
-- item_type_id = NULL significa slot vacío.
CREATE TABLE IF NOT EXISTS public.player_equipment (
  id           UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_id    TEXT        NOT NULL,   -- 'avatar' | 'mascota'
  slot         TEXT        NOT NULL,
  item_type_id TEXT        REFERENCES public.item_types(id) ON DELETE SET NULL,
  equipped_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pe_user_entity_slot UNIQUE (user_id, entity_id, slot)
);

CREATE INDEX IF NOT EXISTS idx_player_equipment_user
  ON public.player_equipment (user_id);

ALTER TABLE public.player_equipment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pe_owner" ON public.player_equipment;
CREATE POLICY "pe_owner" ON public.player_equipment
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 5. Función helper: equipar ítem con validación de propiedad ─────────────
CREATE OR REPLACE FUNCTION public.equip_item(
  p_entity_id    TEXT,
  p_slot         TEXT,
  p_item_type_id TEXT   -- NULL para desequipar
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_item_type_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.player_items
    WHERE user_id = auth.uid()
      AND item_type_id = p_item_type_id
      AND quantity > 0
  ) THEN
    RAISE EXCEPTION 'El usuario no posee el ítem: %', p_item_type_id;
  END IF;

  INSERT INTO public.player_equipment (user_id, entity_id, slot, item_type_id, equipped_at)
  VALUES (auth.uid(), p_entity_id, p_slot, p_item_type_id, now())
  ON CONFLICT (user_id, entity_id, slot)
  DO UPDATE SET item_type_id = EXCLUDED.item_type_id, equipped_at = now();
END;
$$;

-- ─── 6. Migración inicial — datos por defecto para usuarios existentes ────────
-- entity_progress: nivel 1 / 0 XP para avatar y mascota de cada usuario
INSERT INTO public.entity_progress (user_id, entity_id, level, current_xp)
SELECT id, 'avatar', 1, 0 FROM auth.users
ON CONFLICT (user_id, entity_id) DO NOTHING;

INSERT INTO public.entity_progress (user_id, entity_id, level, current_xp)
SELECT id, 'mascota', 1, 0 FROM auth.users
ON CONFLICT (user_id, entity_id) DO NOTHING;

-- player_equipment: 5 slots vacíos × 2 entidades para cada usuario
DO $$
DECLARE
  v_slots    TEXT[] := ARRAY['weapon','head','body','accessory','relic'];
  v_entities TEXT[] := ARRAY['avatar','mascota'];
  v_slot     TEXT;
  v_entity   TEXT;
BEGIN
  FOREACH v_entity IN ARRAY v_entities LOOP
    FOREACH v_slot IN ARRAY v_slots LOOP
      INSERT INTO public.player_equipment (user_id, entity_id, slot, item_type_id)
      SELECT id, v_entity, v_slot, NULL FROM auth.users
      ON CONFLICT (user_id, entity_id, slot) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;
