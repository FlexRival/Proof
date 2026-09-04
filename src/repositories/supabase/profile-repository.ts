import type { SupabaseClient } from '@supabase/supabase-js';

import { RepositoryError } from '@/repositories/errors';
import type { Profile, ProfileRepository } from '@/repositories/profile-repository';

import type { Database, ProfileRow } from '@/lib/database.types';

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    level: row.level,
    xp: row.xp,
    streakDays: row.streak_days,
    isPro: row.is_pro,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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
}
