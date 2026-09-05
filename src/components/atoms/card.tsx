import { StyleSheet, type ViewProps } from 'react-native';

import { ThemedView } from '@/components/atoms/themed-view';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Contenedor estándar del diseño: superficie + contorno de un pelo + radio
 * grande. La variante decide superficie y contorno a la vez porque en el
 * diseño van siempre emparejados (la card del rival es superficie oscura *y*
 * contorno Rival; nunca uno sin el otro).
 *
 * - `default`: card normal.
 * - `raised`: card elevada o seleccionada.
 * - `sunken`: bloque hundido dentro de otra card (stat, regla, buscador).
 * - `highlight`: card destacada con contorno Power (el duelo activo).
 * - `rival`: el lado del oponente.
 * - `locked`: slot sin desbloquear.
 */
export type CardVariant = 'default' | 'raised' | 'sunken' | 'highlight' | 'rival' | 'locked';

export type CardProps = ViewProps & {
  variant?: CardVariant;
};

const VARIANTS: Record<CardVariant, { surface: ThemeColor; border: ThemeColor }> = {
  default: { surface: 'surface', border: 'border' },
  raised: { surface: 'surfaceRaised', border: 'border' },
  sunken: { surface: 'surfaceSunken', border: 'border' },
  highlight: { surface: 'surface', border: 'primaryEdge' },
  rival: { surface: 'surface', border: 'rivalEdge' },
  locked: { surface: 'locked', border: 'border' },
};

export function Card({ variant = 'default', style, ...rest }: CardProps) {
  const theme = useTheme();
  const { surface, border } = VARIANTS[variant];

  return (
    <ThemedView
      type={surface}
      style={[styles.base, { borderColor: theme[border] }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
  },
});
