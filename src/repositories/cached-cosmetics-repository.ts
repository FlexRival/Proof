import { RepositoryCache } from '@/repositories/cache';
import type {
  CosmeticItem,
  CosmeticsRepository,
  CosmeticSlot,
  EquippedCosmetics,
} from '@/repositories/cosmetics-repository';

/**
 * Envuelve cualquier `CosmeticsRepository` y cachea solo `getCatalog()`: es
 * contenido de referencia que no cambia salvo que se añadan cosméticos
 * nuevos (una actualización de la app, no una acción de un usuario). El
 * resto de métodos no se cachean: dependen del usuario consultado o deben
 * reflejar el estado justo tras una mutación.
 */
export class CachedCosmeticsRepository implements CosmeticsRepository {
  private readonly catalogCache: RepositoryCache<CosmeticItem[]>;

  constructor(
    private readonly inner: CosmeticsRepository,
    staleMs?: number,
  ) {
    this.catalogCache = new RepositoryCache<CosmeticItem[]>(staleMs);
  }

  getCatalog(): Promise<CosmeticItem[]> {
    return this.catalogCache.getOrFetch(() => this.inner.getCatalog());
  }

  getUnlockedItemIds(): Promise<string[]> {
    return this.inner.getUnlockedItemIds();
  }

  getEquipped(userId: string): Promise<EquippedCosmetics> {
    return this.inner.getEquipped(userId);
  }

  equip(itemId: string): Promise<EquippedCosmetics> {
    return this.inner.equip(itemId);
  }

  unequip(slot: CosmeticSlot): Promise<EquippedCosmetics> {
    return this.inner.unequip(slot);
  }
}
