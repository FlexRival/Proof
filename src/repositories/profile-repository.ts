/**
 * Contrato del perfil. Ni este archivo ni quien lo consuma saben que detrás
 * hay Supabase — eso vive en `supabase/profile-repository.ts`.
 */

/** Modelo de dominio: independiente de cómo lo guarde el backend. */
export type Profile = {
  id: string;
  username: string;
  level: number;
  xp: number;
  streakDays: number;
  isPro: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface ProfileRepository {
  /** Perfil de la sesión actual, o `null` si no hay sesión iniciada. */
  getCurrentProfile(): Promise<Profile | null>;

  /**
   * Se dispara en cada cambio de sesión (login, logout, refresco de token).
   * Devuelve la función para cancelar la suscripción.
   */
  onSessionChange(listener: () => void): () => void;
}
