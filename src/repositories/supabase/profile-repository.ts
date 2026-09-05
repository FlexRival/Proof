import { decode } from 'base64-arraybuffer';

import type { SupabaseClient } from '@supabase/supabase-js';

import { RepositoryError } from '@/repositories/errors';
import type { PickedImage, Profile, ProfileRepository } from '@/repositories/profile-repository';

import type { Database, ProfileRow } from '@/lib/database.types';

const AVATAR_BUCKET = 'avatars';

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    level: row.level,
    xp: row.xp,
    streakDays: row.streak_days,
    isPro: row.is_pro,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** `image/jpeg` → `jpeg`. Cae a `jpg` si el mimeType no trae subtipo reconocible. */
function extensionForMimeType(mimeType: string): string {
  return mimeType.split('/')[1] || 'jpg';
}

export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getCurrentProfile(): Promise<Profile | null> {
    const { data: userData, error: userError } = await this.client.auth.getUser();

    if (userError || !userData.user) {
      return null;
    }

    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (error) {
      throw new RepositoryError('No se pudo cargar el perfil.', { cause: error });
    }

    return toProfile(data);
  }

  onSessionChange(listener: () => void): () => void {
    const {
      data: { subscription },
    } = this.client.auth.onAuthStateChange(() => listener());

    return () => subscription.unsubscribe();
  }

  async signInWithPassword(email: string, password: string): Promise<void> {
    const { error } = await this.client.auth.signInWithPassword({ email, password });

    if (error) {
      throw new RepositoryError('No se pudo iniciar sesión. Revisa tu email y contraseña.', {
        cause: error,
      });
    }
  }

  async signUp(
    email: string,
    password: string,
    username: string,
  ): Promise<{ needsEmailConfirmation: boolean }> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (error) {
      throw new RepositoryError('No se pudo crear la cuenta.', { cause: error });
    }

    // Si el proyecto exige confirmar el email, `signUp` crea el usuario pero
    // no abre sesión todavía: `data.session` viene `null` hasta que confirme.
    return { needsEmailConfirmation: !data.session };
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();

    if (error) {
      throw new RepositoryError('No se pudo cerrar sesión.', { cause: error });
    }
  }

  async updateAvatar(image: PickedImage): Promise<Profile> {
    const { data: userData, error: userError } = await this.client.auth.getUser();
    if (userError || !userData.user) {
      throw new RepositoryError('Necesitas iniciar sesión para cambiar tu foto de perfil.', {
        cause: userError,
      });
    }

    // Misma ruta siempre (una foto de perfil por usuario): `upsert` reemplaza
    // el archivo anterior en vez de acumular uno por subida.
    const path = `${userData.user.id}/avatar.${extensionForMimeType(image.mimeType)}`;

    const { error: uploadError } = await this.client.storage
      .from(AVATAR_BUCKET)
      .upload(path, decode(image.base64), { contentType: image.mimeType, upsert: true });

    if (uploadError) {
      throw new RepositoryError('No se pudo subir la foto.', { cause: uploadError });
    }

    const {
      data: { publicUrl },
    } = this.client.storage.from(AVATAR_BUCKET).getPublicUrl(path);

    // La ruta no cambia entre subidas, así que sin esto cualquier caché de
    // imagen (la del propio componente `<Image>`, un CDN) seguiría enseñando
    // la foto vieja con la misma URL.
    const avatarUrl = `${publicUrl}?updated=${Date.now()}`;

    const { data, error } = await this.client
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userData.user.id)
      .select('*')
      .single();

    if (error) {
      throw new RepositoryError('No se pudo guardar la foto en tu perfil.', { cause: error });
    }

    return toProfile(data);
  }
}
