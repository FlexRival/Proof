import { useCallback, useEffect, useState } from 'react';

import type { ProfileRow } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type ProfileState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'ready'; profile: ProfileRow }
  | { status: 'error'; message: string };

async function fetchProfileState(): Promise<ProfileState> {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { status: 'signedOut' };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();

  if (error) {
    return { status: 'error', message: error.message };
  }

  return { status: 'ready', profile: data };
}

/**
 * Perfil del usuario actual: nivel, XP, racha y flag Pro.
 *
 * Devuelve un estado discriminado en vez de `profile | null` para que la
 * pantalla tenga que distinguir «cargando» de «sin sesión» de «falló», que en
 * la interfaz son tres cosas distintas.
 *
 * Se resuscribe a los cambios de sesión, así que al iniciar o cerrar sesión el
 * perfil se actualiza solo.
 */
export function useProfile() {
  const [state, setState] = useState<ProfileState>({ status: 'loading' });

  const reload = useCallback(async () => {
    setState(await fetchProfileState());
  }, []);

  useEffect(() => {
    let subscribed = true;

    async function sync() {
      const next = await fetchProfileState();

      if (subscribed) {
        setState(next);
      }
    }

    void sync();

    const { data } = supabase.auth.onAuthStateChange(() => {
      void sync();
    });

    return () => {
      subscribed = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { state, reload };
}
