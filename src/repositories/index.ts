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
import { CachedProfileRepository } from '@/repositories/cached-profile-repository';
import type { ProfileRepository } from '@/repositories/profile-repository';
import { SupabaseProfileRepository } from '@/repositories/supabase/profile-repository';

export type { Profile, ProfileRepository } from '@/repositories/profile-repository';
export { RepositoryError } from '@/repositories/errors';

export const profileRepository: ProfileRepository = new CachedProfileRepository(
  new SupabaseProfileRepository(supabase),
);
