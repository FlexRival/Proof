import { StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/atoms/themed-text';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Fila de aviso en línea: punto de estado + texto, sobre una card hundida.
 * En el diseño es «● You took the lead in your duel» y «● Duel accepted. It's
 * on.» — no es un toast flotante, va dentro del flujo de la pantalla.
 */
export type NoticeTone = 'primary' | 'rival' | 'info';

export type NoticeProps = ViewProps & {
  message: string;
  tone?: NoticeTone;
};

const TONES: Record<NoticeTone, ThemeColor> = {
  primary: 'primary',
  rival: 'defeat',
  info: 'info',
};

const DOT_SIZE = 8;

export function Notice({ message, tone = 'primary', style, ...rest }: NoticeProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.base,
        // Medido en el diseño: la fila de aviso va sobre la superficie
        // elevada (#1B1E27), no sobre la card normal.
        { backgroundColor: theme.surfaceRaised, borderColor: theme.border },
        style,
      ]}
      {...rest}>
      <View style={[styles.dot, { backgroundColor: theme[TONES[tone]] }]} />
      <ThemedText type="small" style={styles.message}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: Radius.pill,
  },
  message: {
    flex: 1,
  },
});
