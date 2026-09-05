/**
 * Composition root de los repositorios: el único archivo del proyecto que
 * sabe que el backend actual es Supabase. Pantallas y hooks importan de aquí,
 * nunca de `supabase/*` ni de `@/lib/supabase` directamente.
 *
 * Cambiar de backend es escribir una clase nueva en un archivo hermano de
 * `supabase/` que implemente el mismo contrato, y apuntar aquí a esa clase.
 * Envolver esa clase en un `Cached<Entidad>Repository` (ver `cache.ts`) es lo
 * que hace que el dato viva a nivel de app en vez de pedirse cada vez que se
 * entra a la pantalla.
 */

import { supabase } from '@/lib/supabase';
import { CachedCosmeticsRepository } from '@/repositories/cached-cosmetics-repository';
import { CachedProfileRepository } from '@/repositories/cached-profile-repository';
import type { CosmeticsRepository } from '@/repositories/cosmetics-repository';
import type { ProfileRepository } from '@/repositories/profile-repository';
import { SupabaseCosmeticsRepository } from '@/repositories/supabase/cosmetics-repository';
import { SupabaseProfileRepository } from '@/repositories/supabase/profile-repository';

export type { Profile, ProfileRepository } from '@/repositories/profile-repository';
export type {
  CosmeticItem,
  CosmeticsRepository,
  CosmeticSlot,
  CosmeticUnlockType,
  EquippedCosmetics,
} from '@/repositories/cosmetics-repository';
export { RepositoryError } from '@/repositories/errors';

export const profileRepository: ProfileRepository = new CachedProfileRepository(
  new SupabaseProfileRepository(supabase),
);

// El catálogo de cosméticos es contenido de referencia (no cambia salvo que
// se añadan ítems nuevos): 30 minutos de caché en vez de los 30s por defecto.
export const cosmeticsRepository: CosmeticsRepository = new CachedCosmeticsRepository(
  new SupabaseCosmeticsRepository(supabase),
  30 * 60_000,
);
