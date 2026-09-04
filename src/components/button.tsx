import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Botón de la card COMPONENTS del diseño.
 *
 * - `primary`: relleno Power sólido. La acción de la pantalla.
 * - `secondary`: superficie oscura con contorno. Alternativa al lado del
 *   primario ("DECLINE" junto a "ACCEPT").
 * - `ghost`: sin relleno ni contorno. Salidas de bajo peso ("CONTINUE" debajo
 *   de "SHARE VICTORY").
 *
 * El primario es **plano**, no un degradado: medido en la lámina de
 * componentes da `#C6FF4A` idéntico arriba, en medio y abajo. `Gradients.power`
 * existe en la paleta pero no lo usa nadie todavía.
 *
 * Los labels van en mayúsculas siempre: es la variante `button` de la escala
 * tipográfica y el diseño no tiene ni un botón en minúsculas. El "Skip" en
 * minúscula del onboarding es un enlace, no un botón.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

/** El diseño no define estado pressed; esto es la afordancia mínima. */
const PRESSED_OPACITY = 0.75;
const DISABLED_OPACITY = 0.4;

export function Button({ label, variant = 'primary', disabled, style, ...rest }: ButtonProps) {
  const theme = useTheme();

  const surface: ViewStyle = {
    primary: { backgroundColor: theme.primary },
    secondary: {
      backgroundColor: theme.surface,
      borderColor: theme.borderStrong,
      borderWidth: 1,
    },
    ghost: {},
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        surface,
        { opacity: disabled ? DISABLED_OPACITY : pressed ? PRESSED_OPACITY : 1 },
        style,
      ]}
      {...rest}>
      <ThemedText
        type="button"
        themeColor={variant === 'primary' ? 'onPrimary' : 'text'}
        style={styles.label}
        numberOfLines={1}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  label: {
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
