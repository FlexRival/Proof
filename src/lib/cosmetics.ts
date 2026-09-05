import type { CosmeticItem } from '@/repositories/cosmetics-repository';

/**
 * Si un ítem del catálogo se puede equipar ahora mismo: los FREE siempre,
 * los PRO dependen de la suscripción activa (se pierden solos al cancelar,
 * no quedan "recordados"), los LEVEL dependen de si el servidor ya los
 * concedió (`CosmeticsRepository.getUnlockedItemIds`).
 */
export function isCosmeticUnlocked(
  item: CosmeticItem,
  unlockedItemIds: readonly string[],
  isPro: boolean,
): boolean {
  switch (item.unlockType) {
    case 'FREE':
      return true;
    case 'PRO':
      return isPro;
    case 'LEVEL':
      return unlockedItemIds.includes(item.id);
  }
}
