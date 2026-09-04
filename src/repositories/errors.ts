/**
 * Único tipo de error que un repositorio puede lanzar. El resto de la app
 * captura `RepositoryError`, nunca el error nativo del backend (`PostgrestError`,
 * un `Response` de fetch, lo que sea) — así una pantalla no acaba acoplada a la
 * forma de error de un backend concreto.
 */
export class RepositoryError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'RepositoryError';
  }
}
