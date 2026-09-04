/**
 * Forma estándar del estado de cualquier hook que lee de un repositorio.
 * Existe para que Supabase (o lo que sea) tardando más de lo esperado tenga
 * un estado explícito (`loading`) que la pantalla pueda pintar, en vez de que
 * cada hook invente su propia unión discriminada.
 */
export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; message: string };

/** `AsyncState` + `signedOut`, para datos que requieren sesión iniciada. */
export type AuthedAsyncState<T> = AsyncState<T> | { status: 'signedOut' };
