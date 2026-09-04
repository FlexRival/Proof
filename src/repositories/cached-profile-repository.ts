import { RepositoryCache } from '@/repositories/cache';
import type { Profile, ProfileRepository } from '@/repositories/profile-repository';

/**
 * Envuelve cualquier `ProfileRepository` (hoy `SupabaseProfileRepository`,
 * mañana el que sea) y le añade caché: `getCurrentProfile()` solo pide al
 * backend si no se había pedido antes o si pasaron más de `staleMs`.
 *
 * Un cambio de sesión invalida el caché inmediatamente, sin esperar a que
 * caduque — el perfil cacheado puede ser el de otro usuario.
 */
export class CachedProfileRepository implements ProfileRepository {
  private readonly cache: RepositoryCache<Profile | null>;

  constructor(
    private readonly inner: ProfileRepository,
    staleMs?: number,
  ) {
    this.cache = new RepositoryCache<Profile | null>(staleMs);
    /**
     * Se suscribe aquí, en el constructor, para que esta invalidación llegue
     * SIEMPRE antes que la de cualquier hook: `index.ts` (que construye este
     * repositorio) se evalúa al cargar los módulos, antes de que ningún
     * componente pueda montarse y suscribirse él mismo a `onSessionChange`.
     * Supabase avisa a sus suscriptores en orden de suscripción, así que el
     * caché queda invalidado antes de que un hook llegue a leerlo de nuevo.
     * Si esto se moviera a un sitio que se suscribe más tarde (p. ej. dentro
     * de un hook), esa garantía de orden desaparece.
     */
    this.inner.onSessionChange(() => this.cache.invalidate());
  }

  getCurrentProfile(): Promise<Profile | null> {
    return this.cache.getOrFetch(() => this.inner.getCurrentProfile());
  }

  onSessionChange(listener: () => void): () => void {
    return this.inner.onSessionChange(listener);
  }
}
