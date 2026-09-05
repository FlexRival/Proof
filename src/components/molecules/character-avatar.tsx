import { Image } from 'expo-image';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Card } from '@/components/atoms/card';
import { ThemedText } from '@/components/atoms/themed-text';
import { COSMETIC_ASSETS } from '@/constants/cosmetic-assets';
import { Radius } from '@/constants/theme';
import type { CosmeticSlot, EquippedCosmetics } from '@/repositories';

/**
 * De abajo a arriba: la piel es la base, la ropa va encima, el pelo encima
 * de la ropa (para que un cuello alto no lo tape) y el sombrero/accesorio
 * por encima de todo.
 */
const LAYER_ORDER: readonly CosmeticSlot[] = ['SKIN', 'OUTFIT', 'HAIR', 'HEADWEAR', 'ACCESSORY'];

/** Para pantallas que todavía no cargaron lo equipado (o no hay sesión). */
export const EMPTY_EQUIPPED_COSMETICS: EquippedCosmetics = {
  SKIN: null,
  HAIR: null,
  OUTFIT: null,
  HEADWEAR: null,
  ACCESSORY: null,
};

export type CharacterAvatarProps = ViewProps & {
  equipped: EquippedCosmetics;
  size?: number;
};

/**
 * Renderiza el personaje apilando una capa de imagen por slot equipado
 * (KAN-19). Un slot equipado cuyo ítem todavía no tiene asset real en
 * `COSMETIC_ASSETS` se salta en vez de romper — pasa mientras se cura el set
 * de assets (ver `supabase/SCHEMA.md` §14).
 */
export function CharacterAvatar({ equipped, size = 160, style, ...rest }: CharacterAvatarProps) {
  const itemIds = LAYER_ORDER.map((slot) => equipped[slot]).filter(
    (itemId): itemId is string => itemId !== null,
  );
  const renderableLayers = itemIds.filter((itemId) => COSMETIC_ASSETS[itemId] !== undefined);

  return (
    <Card
      variant="sunken"
      style={[{ width: size, height: size, padding: 0, overflow: 'hidden' }, style]}
      {...rest}>
      <View style={styles.stage}>
        {renderableLayers.length === 0 ? (
          // Todavía no hay set de assets reales (ver `supabase/SCHEMA.md` §14):
          // esto se ve mientras se cura, no es un fallo del componente.
          <View style={styles.placeholder}>
            <ThemedText type="caption" themeColor="textDim" style={styles.placeholderText}>
              No look yet
            </ThemedText>
          </View>
        ) : (
          renderableLayers.map((itemId) => (
            <Image
              key={itemId}
              source={COSMETIC_ASSETS[itemId]}
              style={StyleSheet.absoluteFill}
              contentFit="contain"
            />
          ))
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    textAlign: 'center',
  },
});
