import type { SupabaseClient } from '@supabase/supabase-js';

import { RepositoryError } from '@/repositories/errors';
import type {
  CosmeticItem,
  CosmeticsRepository,
  CosmeticSlot,
  EquippedCosmetics,
} from '@/repositories/cosmetics-repository';

import type { CosmeticItemRow, Database, UserEquippedCosmeticRow } from '@/lib/database.types';

const SLOTS: readonly CosmeticSlot[] = ['SKIN', 'HAIR', 'OUTFIT', 'HEADWEAR', 'ACCESSORY'];

function toCosmeticItem(row: CosmeticItemRow): CosmeticItem {
  return {
    id: row.id,
    slot: row.slot,
    name: row.name,
    unlockType: row.unlock_type,
    unlockLevel: row.unlock_level,
    sortOrder: row.sort_order,
  };
}

function toEquipped(rows: readonly Pick<UserEquippedCosmeticRow, 'slot' | 'item_id'>[]): EquippedCosmetics {
  const equipped = Object.fromEntries(SLOTS.map((slot) => [slot, null])) as EquippedCosmetics;
  for (const row of rows) {
    equipped[row.slot] = row.item_id;
  }
  return equipped;
}

export class SupabaseCosmeticsRepository implements CosmeticsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getCatalog(): Promise<CosmeticItem[]> {
    const { data, error } = await this.client
      .from('cosmetic_items')
      .select('*')
      .order('slot', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      throw new RepositoryError('No se pudo cargar el catálogo de cosméticos.', { cause: error });
    }

    return data.map(toCosmeticItem);
  }

  async getUnlockedItemIds(): Promise<string[]> {
    const { data: userData, error: userError } = await this.client.auth.getUser();
    if (userError || !userData.user) {
      return [];
    }

    const { data, error } = await this.client
      .from('user_cosmetics')
      .select('item_id')
      .eq('user_id', userData.user.id);

    if (error) {
      throw new RepositoryError('No se pudieron cargar tus cosméticos desbloqueados.', {
        cause: error,
      });
    }

    return data.map((row) => row.item_id);
  }

  async getEquipped(userId: string): Promise<EquippedCosmetics> {
    const { data, error } = await this.client
      .from('user_equipped_cosmetics')
      .select('slot, item_id')
      .eq('user_id', userId);

    if (error) {
      throw new RepositoryError('No se pudo cargar el personaje equipado.', { cause: error });
    }

    return toEquipped(data);
  }

  async equip(itemId: string): Promise<EquippedCosmetics> {
    const callerId = await this.requireCallerId('equipar cosméticos');

    const { error } = await this.client.rpc('equip_cosmetic', { p_item_id: itemId });
    if (error) {
      throw new RepositoryError('No se pudo equipar ese cosmético.', { cause: error });
    }

    return this.getEquipped(callerId);
  }

  async unequip(slot: CosmeticSlot): Promise<EquippedCosmetics> {
    const callerId = await this.requireCallerId('cambiar tu personaje');

    const { error } = await this.client.rpc('unequip_cosmetic', { p_slot: slot });
    if (error) {
      throw new RepositoryError('No se pudo quitar ese cosmético.', { cause: error });
    }

    return this.getEquipped(callerId);
  }

  private async requireCallerId(action: string): Promise<string> {
    const { data: userData, error: userError } = await this.client.auth.getUser();
    if (userError || !userData.user) {
      throw new RepositoryError(`Necesitas iniciar sesión para ${action}.`, { cause: userError });
    }
    return userData.user.id;
  }
}
