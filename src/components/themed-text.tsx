import { Text, type TextProps, type TextStyle } from 'react-native';

import { ThemeColor, Typography, type TypographyVariant } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * `linkPrimary` no es una entrada de la escala tipográfica: son las métricas de
 * `link` con el color de marca. Vive aquí porque es una decisión de color.
 */
export type ThemedTextVariant = TypographyVariant | 'linkPrimary';

export type ThemedTextProps = TextProps & {
  type?: ThemedTextVariant;
  themeColor?: ThemeColor;
};

const VARIANT_STYLES: Record<ThemedTextVariant, TextStyle> = {
  ...Typography,
  linkPrimary: Typography.link,
};

/** Color por defecto de las variantes que no usan el color de texto normal. */
const VARIANT_COLORS: Partial<Record<ThemedTextVariant, ThemeColor>> = {
  linkPrimary: 'primary',
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const color = theme[themeColor ?? VARIANT_COLORS[type] ?? 'text'];

  return <Text style={[{ color }, VARIANT_STYLES[type], style]} {...rest} />;
}
