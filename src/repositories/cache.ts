/**
 * Caché en memoria para repositorios: una entrada por instancia, viva
 * mientras la app esté abierta (se resetea al recargar, no persiste en
 * disco). Sirve para datos que se piden en varias pantallas y no cambian
 * todo el rato — "amigos", "clan actual"... — para no volver a pedirlos a
 * Supabase cada vez que se entra a esa sección.
 *
 * No la instancies dentro de un hook: viviría en el componente, no en la
 * app, y se perdería en cuanto la pantalla se desmonte. Vive en un
 * `Cached<Entidad>Repository` en `src/repositories/`, construido una sola
 * vez en `index.ts`. Ver skill `repository-pattern`.
 */
export const DEFAULT_STALE_MS = 30_000;

export class RepositoryCache<T> {
  private entry: { data: T; fetchedAt: number } | null = null;
  private pending: Promise<T> | null = null;

  constructor(private readonly staleMs: number = DEFAULT_STALE_MS) {}

  private isStale(): boolean {
    return !this.entry || Date.now() - this.entry.fetchedAt > this.staleMs;
  }

  /**
   * Devuelve el valor cacheado si no está viejo. Si está viejo (o no hay
   * ninguno todavía), llama a `fetcher` — una sola vez aunque
   * `getOrFetch` se pida en paralelo desde varias pantallas a la vez.
   */
  async getOrFetch(fetcher: () => Promise<T>): Promise<T> {
    if (!this.isStale()) {
      return this.entry!.data;
    }

    if (!this.pending) {
      this.pending = fetcher()
        .then((data) => {
          this.entry = { data, fetchedAt: Date.now() };
          this.pending = null;
          return data;
        })
        .catch((error) => {
          this.pending = null;
          throw error;
        });
    }

    return this.pending;
  }

  /** Fuerza que la próxima `getOrFetch` vuelva a pedir el dato, aunque no esté viejo. */
  invalidate(): void {
    this.entry = null;
  }
}
