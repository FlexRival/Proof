import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/atoms/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Selector de la card COMPONENTS: ACTIVE / PENDING / HISTORY. Es un filtro de
 * la pantalla, no navegación — la barra de tabs es otra cosa (`app-tabs.tsx`).
 *
 * Controlado: la pantalla es la dueña del segmento activo, para que el filtro
 * pueda venir de la URL o de una notificación y no solo de un toque.
 */
export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="tablist"
      // Medido en el diseño: la pista del selector es el fondo de pantalla
      // (#08090C) y el segmento activo la superficie elevada (#1B1E27).
      style={[styles.track, { backgroundColor: theme.background }, style]}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              selected && { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
            ]}>
            <ThemedText
              type="label"
              themeColor={selected ? 'text' : 'textMuted'}
              style={styles.label}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: Spacing.one,
    gap: Spacing.one,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    // El borde existe siempre para que seleccionar un segmento no desplace el
    // texto un píxel; en los no seleccionados es transparente.
    borderWidth: 1,
    borderColor: 'transparent',
    paddingVertical: Spacing.two,
  },
  label: {
    textTransform: 'uppercase',
  },
});
