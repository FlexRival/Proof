-- ============================================================================
-- MIGRACIÓN: COSMÉTICOS DE PERSONAJE — ProofIt
--
-- Catálogo de cosméticos equipables (piel, pelo, outfit, sombrero, accesorio)
-- para la pantalla "Customize character" del Perfil. Ver CLAUDE.md.
--
-- Modelo de seguridad (igual que el resto del esquema):
--   - `cosmetic_items` es catálogo estático: lo gestionan migraciones/admins,
--     el cliente solo lee (REVOKE ALL + GRANT SELECT).
--   - `user_cosmetics` (qué ha desbloqueado cada usuario) y
--     `user_equipped_cosmetics` (qué lleva puesto ahora) son igual de
--     anti-cheat: REVOKE ALL + GRANT SELECT, toda mutación pasa por RPCs
--     `SECURITY DEFINER` con `SET search_path = ''`.
--   - Los cosméticos LEVEL se desbloquean solos vía trigger cuando
--     `profiles.level` sube (mismo principio que las rachas: el cliente no
--     "reclama" nada, el servidor concede). Los PRO no tienen fila de
--     desbloqueo: se comprueban en vivo contra `profiles.is_pro` en el
--     momento de equipar, así se pierden solos si la suscripción caduca.
--
-- Catálogo sembrado al final de este archivo con contenido PLACEHOLDER: los
-- slugs y nombres son provisionales hasta curar el set real de assets
-- (pixel art estilo LPC/Liberated Pixel Cup). Añadir cosméticos reales será
-- una migración de solo-INSERT posterior.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TIPOS
-- ----------------------------------------------------------------------------
CREATE TYPE public.cosmetic_slot AS ENUM ('SKIN', 'HAIR', 'OUTFIT', 'HEADWEAR', 'ACCESSORY');
CREATE TYPE public.cosmetic_unlock_type AS ENUM ('FREE', 'LEVEL', 'PRO');

-- ----------------------------------------------------------------------------
-- 2. TABLAS
-- ----------------------------------------------------------------------------

-- Catálogo. `id` es un slug estable que la app usa como clave para mapear al
-- asset local (require() de la capa PNG correspondiente) — no hace falta una
-- columna `asset_key` aparte.
CREATE TABLE public.cosmetic_items (
  id           TEXT PRIMARY KEY CHECK (id ~ '^[a-z][a-z0-9_]*$'),
  slot         public.cosmetic_slot NOT NULL,
  name         TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  unlock_type  public.cosmetic_unlock_type NOT NULL DEFAULT 'FREE',
  unlock_level INT CHECK (unlock_level > 0),
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT cosmetic_items_unlock_level_matches_type CHECK (
    (unlock_type = 'LEVEL' AND unlock_level IS NOT NULL)
    OR (unlock_type <> 'LEVEL' AND unlock_level IS NULL)
  )
);

CREATE INDEX cosmetic_items_slot_idx ON public.cosmetic_items (slot, sort_order);

-- Qué ha desbloqueado cada usuario. Solo hace falta para cosméticos LEVEL: los
-- FREE están implícitamente desbloqueados para todos, los PRO se comprueban en
-- vivo (ver equip_cosmetic).
CREATE TABLE public.user_cosmetics (
  user_id     UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  item_id     TEXT NOT NULL REFERENCES public.cosmetic_items (id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, item_id)
);

-- Qué lleva puesto cada usuario ahora mismo, un ítem como máximo por slot.
-- Pública entre autenticados (a diferencia de clan_members, aquí no se
-- concede a `anon`: no hay pantalla pública sin sesión que la necesite):
-- duelos, amigos y victoria necesitan poder renderizar el personaje de
-- otro usuario logueado.
CREATE TABLE public.user_equipped_cosmetics (
  user_id     UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  slot        public.cosmetic_slot NOT NULL,
  item_id     TEXT NOT NULL REFERENCES public.cosmetic_items (id) ON DELETE CASCADE,
  equipped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, slot)
);

-- ============================================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.cosmetic_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cosmetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_equipped_cosmetics ENABLE ROW LEVEL SECURITY;

-- Catálogo: público, cualquiera lo consulta para mostrar el selector.
CREATE POLICY "cosmetic_items_select_all"
  ON public.cosmetic_items FOR SELECT
  TO authenticated, anon
  USING (true);

-- Desbloqueos: privados, cada quien ve solo lo suyo (revela progreso/grind,
-- no hace falta exponerlo a terceros).
CREATE POLICY "user_cosmetics_select_own"
  ON public.user_cosmetics FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Equipado: público entre autenticados, para renderizar el look de cualquiera.
CREATE POLICY "user_equipped_cosmetics_select_all"
  ON public.user_equipped_cosmetics FOR SELECT
  TO authenticated
  USING (true);

-- No hay policies de INSERT/UPDATE/DELETE en ninguna: todo pasa por las RPCs
-- de abajo (o, para el catálogo, por migraciones).

-- ============================================================================
-- 4. GRANTS DE TABLA (el cliente solo lee)
-- ============================================================================
REVOKE ALL ON public.cosmetic_items FROM anon, authenticated;
GRANT SELECT ON public.cosmetic_items TO authenticated, anon;

REVOKE ALL ON public.user_cosmetics FROM anon, authenticated;
GRANT SELECT ON public.user_cosmetics TO authenticated;

REVOKE ALL ON public.user_equipped_cosmetics FROM anon, authenticated;
GRANT SELECT ON public.user_equipped_cosmetics TO authenticated;

-- ============================================================================
-- 5. DESBLOQUEO AUTOMÁTICO POR NIVEL
-- Mismo principio que las rachas: el servidor concede solo, el cliente nunca
-- "reclama" un desbloqueo.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.grant_level_cosmetics(p_user_id UUID, p_level INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_cosmetics (user_id, item_id)
  SELECT p_user_id, id
  FROM public.cosmetic_items
  WHERE unlock_type = 'LEVEL' AND unlock_level <= p_level
  ON CONFLICT (user_id, item_id) DO NOTHING;
END;
$$;

-- Solo se llama desde el trigger (que corre como owner); el cliente no la
-- ejecuta directamente.
REVOKE EXECUTE ON FUNCTION public.grant_level_cosmetics(UUID, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grant_level_cosmetics(UUID, INT) TO service_role;

CREATE OR REPLACE FUNCTION public.profiles_touch_level_cosmetics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.grant_level_cosmetics(NEW.id, NEW.level);
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_level_cosmetics
  AFTER INSERT OR UPDATE OF level ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_touch_level_cosmetics();

-- ============================================================================
-- 6. RPCs
-- ============================================================================

-- ----------------------------------------------------------------------------
-- equip_cosmetic: equipa un ítem en su slot (sustituye lo que hubiera puesto).
-- Rechaza si el ítem no existe, si es LEVEL y no está en user_cosmetics, o si
-- es PRO y profiles.is_pro no es true ahora mismo.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.equip_cosmetic(p_item_id TEXT)
RETURNS public.user_equipped_cosmetics
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller UUID := (SELECT auth.uid());
  v_item   public.cosmetic_items;
  v_is_pro BOOLEAN;
  v_row    public.user_equipped_cosmetics;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Autenticación requerida';
  END IF;

  SELECT * INTO v_item FROM public.cosmetic_items WHERE id = p_item_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ese cosmético no existe';
  END IF;

  IF v_item.unlock_type = 'LEVEL' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_cosmetics
      WHERE user_id = v_caller AND item_id = p_item_id
    ) THEN
      RAISE EXCEPTION 'Todavía no has desbloqueado este cosmético';
    END IF;
  ELSIF v_item.unlock_type = 'PRO' THEN
    SELECT is_pro INTO v_is_pro FROM public.profiles WHERE id = v_caller;
    IF NOT COALESCE(v_is_pro, FALSE) THEN
      RAISE EXCEPTION 'Este cosmético es exclusivo de Pro';
    END IF;
  END IF;

  INSERT INTO public.user_equipped_cosmetics (user_id, slot, item_id)
  VALUES (v_caller, v_item.slot, p_item_id)
  ON CONFLICT (user_id, slot)
  DO UPDATE SET item_id = EXCLUDED.item_id, equipped_at = NOW()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- ----------------------------------------------------------------------------
-- unequip_cosmetic: quita lo que haya puesto en ese slot. Idempotente.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.unequip_cosmetic(p_slot public.cosmetic_slot)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller UUID := (SELECT auth.uid());
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Autenticación requerida';
  END IF;

  DELETE FROM public.user_equipped_cosmetics
  WHERE user_id = v_caller AND slot = p_slot;
END;
$$;

-- ----------------------------------------------------------------------------
-- PERMISOS DE EJECUCIÓN
-- ----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.equip_cosmetic(TEXT)                   FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.unequip_cosmetic(public.cosmetic_slot) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.equip_cosmetic(TEXT)                   TO authenticated;
GRANT EXECUTE ON FUNCTION public.unequip_cosmetic(public.cosmetic_slot) TO authenticated;

-- ============================================================================
-- 7. REALTIME
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_equipped_cosmetics;

-- ============================================================================
-- 8. CATÁLOGO INICIAL (PLACEHOLDER)
-- Slugs y nombres provisionales — pendiente de reemplazar/ampliar cuando se
-- curen los assets reales. unlock_level son placeholders tuneables, igual que
-- el resto de constantes de progresión del esquema.
-- ============================================================================
INSERT INTO public.cosmetic_items (id, slot, name, unlock_type, unlock_level, sort_order) VALUES
  ('skin_light',          'SKIN',      'Piel clara',       'FREE',  NULL, 0),
  ('skin_tan',            'SKIN',      'Piel morena',      'FREE',  NULL, 1),
  ('skin_dark',           'SKIN',      'Piel oscura',      'FREE',  NULL, 2),

  ('hair_short_black',    'HAIR',      'Corto negro',      'FREE',  NULL, 0),
  ('hair_bob_brown',      'HAIR',      'Bob castaño',      'FREE',  NULL, 1),
  ('hair_pony_blonde',    'HAIR',      'Coleta rubia',     'LEVEL', 5,    2),
  ('hair_mohawk_red',     'HAIR',      'Cresta roja',      'LEVEL', 15,   3),
  ('hair_long_white',     'HAIR',      'Largo plateado',   'PRO',   NULL, 4),

  ('outfit_tunic_green',  'OUTFIT',    'Túnica verde',     'FREE',  NULL, 0),
  ('outfit_leather_armor','OUTFIT',    'Armadura de cuero','LEVEL', 10,   1),
  ('outfit_chainmail',    'OUTFIT',    'Cota de malla',    'LEVEL', 20,   2),
  ('outfit_wizard_robe',  'OUTFIT',    'Túnica de mago',   'PRO',   NULL, 3),
  ('outfit_royal_cape',   'OUTFIT',    'Capa real',        'PRO',   NULL, 4),

  ('headwear_bandana',    'HEADWEAR',  'Pañuelo',          'FREE',  NULL, 0),
  ('headwear_iron_helmet','HEADWEAR',  'Casco de hierro',  'LEVEL', 8,    1),
  ('headwear_crown',      'HEADWEAR',  'Corona',           'PRO',   NULL, 2),

  ('accessory_wooden_shield', 'ACCESSORY', 'Escudo de madera', 'FREE',  NULL, 0),
  ('accessory_torch',         'ACCESSORY', 'Antorcha',         'LEVEL', 3,    1),
  ('accessory_wings',         'ACCESSORY', 'Alas',             'PRO',   NULL, 2)
ON CONFLICT (id) DO NOTHING;
