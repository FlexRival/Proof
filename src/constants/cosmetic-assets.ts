import type { ImageSourcePropType } from 'react-native';

/**
 * Mapa de id de cosmético (el `id` de `cosmetic_items`, ver
 * `supabase/SCHEMA.md` §14) → asset local. `require()` necesita una ruta
 * estática por entrada, así que esto no puede construirse dinámicamente a
 * partir del id.
 *
 * Vacío hasta curar el set real de assets (pixel art estilo LPC). Un id sin
 * entrada aquí se renderiza como placeholder en `CharacterAvatar` — no es un
 * error, solo significa "todavía no tiene arte".
 */
export const COSMETIC_ASSETS: Partial<Record<string, ImageSourcePropType>> = {};
