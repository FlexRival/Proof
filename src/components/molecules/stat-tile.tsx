import { StyleSheet } from 'react-native';

import { Card } from '@/components/atoms/card';
import { ThemedText } from '@/components/atoms/themed-text';
import { Spacing, type ThemeColor } from '@/constants/theme';

/**
 * Celda de la rejilla de estadísticas del perfil: rótulo pequeño arriba y
 * cifra grande debajo (`WINS` / `28`).
 *
 * El color de la cifra lo decide quien la usa, porque en el diseño solo dos
 * llevan color —victorias en Power, derrotas en Rival— y el resto van en
 * texto normal.
 */
export type StatTileProps = {
  label: string;
  value: string;
  valueColor?: ThemeColor;
};

export function StatTile({ label, value, valueColor }: StatTileProps) {
  return (
    <Card variant="sunken" style={styles.tile}>
      <ThemedText type="label" themeColor="textDim">
        {label}
      </ThemedText>
      <ThemedText type="subheading" themeColor={valueColor}>
        {value}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    gap: Spacing.one,
  },
});
