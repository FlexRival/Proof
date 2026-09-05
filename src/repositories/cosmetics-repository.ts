/**
 * Contrato de los cosméticos de personaje. Ni este archivo ni quien lo
 * consuma saben que detrás hay Supabase — eso vive en
 * `supabase/cosmetics-repository.ts`.
 */

export type CosmeticSlot = 'SKIN' | 'HAIR' | 'OUTFIT' | 'HEADWEAR' | 'ACCESSORY';

export type CosmeticUnlockType = 'FREE' | 'LEVEL' | 'PRO';

/** Un ítem del catálogo. `unlockLevel` solo existe cuando `unlockType === 'LEVEL'`. */
export type CosmeticItem = {
  id: string;
  slot: CosmeticSlot;
  name: string;
  unlockType: CosmeticUnlockType;
  unlockLevel: number | null;
  sortOrder: number;
};

/** Qué lleva puesto un usuario ahora mismo: un ítem como máximo por slot, o ninguno. */
export type EquippedCosmetics = Record<CosmeticSlot, string | null>;

export interface CosmeticsRepository {
  /** Catálogo completo. Contenido de referencia: no cambia salvo que se añadan cosméticos nuevos. */
  getCatalog(): Promise<CosmeticItem[]>;

  /**
   * IDs de cosméticos de tipo `LEVEL` que el usuario de la sesión actual ya
   * desbloqueó. Los `FREE` no aparecen aquí (siempre están disponibles) y
   * los `PRO` tampoco (se comprueban en vivo contra `Profile.isPro`).
   */
  getUnlockedItemIds(): Promise<string[]>;

  /** Qué lleva puesto un usuario cualquiera ahora mismo (para renderizar su personaje). */
  getEquipped(userId: string): Promise<EquippedCosmetics>;

  /** Equipa un cosmético para el usuario de la sesión actual; falla si no está desbloqueado. */
  equip(itemId: string): Promise<EquippedCosmetics>;

  /** Quita lo que hubiera puesto en ese slot para el usuario de la sesión actual. */
  unequip(slot: CosmeticSlot): Promise<EquippedCosmetics>;
}
