import { useCallback, useEffect, useState } from 'react';

import { cosmeticsRepository, profileRepository } from '@/repositories';
import type { EquippedCosmetics } from '@/repositories';

import type { AuthedAsyncState } from '@/hooks/async-state';

export type MyEquippedCosmeticsState = AuthedAsyncState<EquippedCosmetics>;

async function fetchState(): Promise<MyEquippedCosmeticsState> {
  try {
    const profile = await profileRepository.getCurrentProfile();
    if (!profile) {
      return { status: 'signedOut' };
    }

    const equipped = await cosmeticsRepository.getEquipped(profile.id);
    return { status: 'ready', data: equipped };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido.';
    return { status: 'error', message };
  }
}

/**
 * Qué lleva puesto el usuario de la sesión actual. Para pantallas que solo
 * necesitan pintar su avatar (Home, Perfil) sin el catálogo completo ni los
 * desbloqueos que sí necesita la pantalla de personalización — ver
 * `useCharacterCustomization`, que cubre ese caso más grande.
 */
export function useMyEquippedCosmetics() {
  const [state, setState] = useState<MyEquippedCosmeticsState>({ status: 'loading' });

  const reload = useCallback(async () => {
    setState(await fetchState());
  }, []);

  useEffect(() => {
    let subscribed = true;

    async function sync() {
      const next = await fetchState();

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
