import { Image } from 'expo-image';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Card } from '@/components/card';
import { COSMETIC_ASSETS } from '@/constants/cosmetic-assets';
import { Radius } from '@/constants/theme';
import type { CosmeticSlot, EquippedCosmetics } from '@/repositories';

/**
 * De abajo a arriba: la piel es la base, la ropa va encima, el pelo encima
 * de la ropa (para que un cuello alto no lo tape) y el sombrero/accesorio
 * por encima de todo.
 */
const LAYER_ORDER: readonly CosmeticSlot[] = ['SKIN', 'OUTFIT', 'HAIR', 'HEADWEAR', 'ACCESSORY'];

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
  const layers = LAYER_ORDER.map((slot) => equipped[slot]).filter(
    (itemId): itemId is string => itemId !== null,
  );

  return (
    <Card
      variant="sunken"
      style={[{ width: size, height: size, padding: 0, overflow: 'hidden' }, style]}
      {...rest}>
      <View style={styles.stage}>
        {layers.map((itemId) => {
          const asset = COSMETIC_ASSETS[itemId];
          if (!asset) {
            return null;
          }

          return (
            <Image
              key={itemId}
              source={asset}
              style={StyleSheet.absoluteFill}
              contentFit="contain"
            />
          );
        })}
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
});
