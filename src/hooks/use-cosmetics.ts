import { useCallback, useEffect, useState } from 'react';

import { cosmeticsRepository, profileRepository } from '@/repositories';
import type { CosmeticItem, CosmeticSlot, EquippedCosmetics } from '@/repositories';

import type { AuthedAsyncState } from '@/hooks/async-state';

export type CharacterCustomization = {
  catalog: CosmeticItem[];
  unlockedItemIds: string[];
  equipped: EquippedCosmetics;
  isPro: boolean;
};

export type CharacterCustomizationState = AuthedAsyncState<CharacterCustomization>;

async function fetchState(): Promise<CharacterCustomizationState> {
  try {
    const profile = await profileRepository.getCurrentProfile();
    if (!profile) {
      return { status: 'signedOut' };
    }

    const [catalog, unlockedItemIds, equipped] = await Promise.all([
      cosmeticsRepository.getCatalog(),
      cosmeticsRepository.getUnlockedItemIds(),
      cosmeticsRepository.getEquipped(profile.id),
    ]);

    return { status: 'ready', data: { catalog, unlockedItemIds, equipped, isPro: profile.isPro } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido.';
    return { status: 'error', message };
  }
}

/**
 * Todo lo que necesita la pantalla de personalización: catálogo, qué ha
 * desbloqueado el usuario de la sesión actual, qué lleva puesto y si es Pro
 * (los ítems PRO se comprueban en vivo, no quedan "recordados").
 *
 * `equip`/`unequip` actualizan el estado local con la respuesta de la
 * mutación en vez de recargar todo desde cero; si la mutación falla, lanzan
 * (`RepositoryError`) y es la pantalla quien decide cómo avisarlo — el
 * estado `ready` no se pierde por un equip fallido.
 */
export function useCharacterCustomization() {
  const [state, setState] = useState<CharacterCustomizationState>({ status: 'loading' });

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

    return () => {
      subscribed = false;
    };
  }, []);

  const equip = useCallback(async (itemId: string) => {
    const equipped = await cosmeticsRepository.equip(itemId);
    setState((prev) =>
      prev.status === 'ready' ? { ...prev, data: { ...prev.data, equipped } } : prev,
    );
  }, []);

  const unequip = useCallback(async (slot: CosmeticSlot) => {
    const equipped = await cosmeticsRepository.unequip(slot);
    setState((prev) =>
      prev.status === 'ready' ? { ...prev, data: { ...prev.data, equipped } } : prev,
    );
  }, []);

  return { state, reload, equip, unequip };
}
