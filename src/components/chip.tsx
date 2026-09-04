import { StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Píldora corta de la card COMPONENTS: `LV 12`, `● Online`, `🔥 9`.
 *
 * El relleno es un tinte, no la superficie a pelo: así está medido en el
 * diseño (marca al 12 %, blanco al 5 % en los neutros). Ver `docs/design.md`
 * § Superficies teñidas.
 */
export type ChipTone = 'neutral' | 'primary' | 'rival';

export type ChipProps = ViewProps & {
  label: string;
  tone?: ChipTone;
  /** Punto de estado a la izquierda del label (`● Online`). */
  dot?: boolean;
};

const TONES: Record<
  ChipTone,
  { fill: ThemeColor; border: ThemeColor; label: ThemeColor; dot: ThemeColor }
> = {
  neutral: {
    fill: 'neutralSurface',
    border: 'border',
    label: 'textSecondary',
    // El `● Online` del diseño lleva el punto en Power aunque el chip sea
    // neutro: el punto es el estado, el chip solo lo envuelve.
    dot: 'primary',
  },
  primary: { fill: 'primarySurface', border: 'primaryEdge', label: 'primary', dot: 'primary' },
  rival: { fill: 'rivalSurface', border: 'rivalEdge', label: 'defeat', dot: 'defeat' },
};

const DOT_SIZE = 6;

export function Chip({ label, tone = 'neutral', dot = false, style, ...rest }: ChipProps) {
  const theme = useTheme();
  const colors = TONES[tone];

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: theme[colors.fill], borderColor: theme[colors.border] },
        style,
      ]}
      {...rest}>
      {dot ? <View style={[styles.dot, { backgroundColor: theme[colors.dot] }]} /> : null}
      <ThemedText type="caption" themeColor={colors.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: Radius.pill,
  },
});
