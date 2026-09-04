import { useCallback, useEffect, useState } from 'react';

import { type Profile, profileRepository } from '@/repositories';

import type { AuthedAsyncState } from '@/hooks/async-state';

export type ProfileState = AuthedAsyncState<Profile>;

async function fetchProfileState(): Promise<ProfileState> {
  try {
    const profile = await profileRepository.getCurrentProfile();
    return profile ? { status: 'ready', data: profile } : { status: 'signedOut' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido.';
    return { status: 'error', message };
  }
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

    const unsubscribe = profileRepository.onSessionChange(() => {
      void sync();
    });

    return () => {
      subscribed = false;
      unsubscribe();
    };
  }, []);

  return { state, reload };
}
