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
  /** `null` si el usuario nunca subió una foto de perfil. */
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Una imagen ya elegida por el usuario (de `expo-image-picker` u otro
 * selector), en la forma mínima que cualquier backend necesita para
 * guardarla: no acopla el contrato a un tipo de una librería concreta.
 */
export type PickedImage = {
  base64: string;
  mimeType: string;
};

export interface ProfileRepository {
  /** Perfil de la sesión actual, o `null` si no hay sesión iniciada. */
  getCurrentProfile(): Promise<Profile | null>;

  /**
   * Se dispara en cada cambio de sesión (login, logout, refresco de token).
   * Devuelve la función para cancelar la suscripción.
   */
  onSessionChange(listener: () => void): () => void;

  /** Inicia sesión con email/contraseña. Lanza `RepositoryError` si falla. */
  signInWithPassword(email: string, password: string): Promise<void>;

  /**
   * Crea una cuenta nueva. Si el proyecto exige confirmar el email antes de
   * abrir sesión, `needsEmailConfirmation` viene en `true` y todavía no hay
   * sesión — la pantalla debe avisarlo en vez de asumir que ya se puede
   * entrar.
   */
  signUp(
    email: string,
    password: string,
    username: string,
  ): Promise<{ needsEmailConfirmation: boolean }>;

  /** Cierra la sesión actual. */
  signOut(): Promise<void>;

  /**
   * Sube una foto de perfil nueva y actualiza `avatarUrl` en el perfil del
   * usuario de la sesión actual. Devuelve el perfil ya actualizado.
   */
  updateAvatar(image: PickedImage): Promise<Profile>;
}
