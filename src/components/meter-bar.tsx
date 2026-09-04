import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Barra de progreso lisa: pista y relleno, sin rótulos ni cifras.
 *
 * La usan el objetivo de pasos y las dos barras del duelo de la pantalla
 * principal. No sustituye a `XpBar`, que además lleva rótulo, cifras y
 * degradado — esta es el caso simple.
 *
 * El tono `steps` es **neutro a propósito**: la lámina de fundamentos dice
 * «Steps are shown as activity and duel progress. Never as a live XP ticker»,
 * así que teñir los pasos de Power los haría leer como XP. Ver
 * `docs/design.md` § Pasos.
 */
export type MeterTone = 'steps' | 'power' | 'rival' | 'muted';

export type MeterBarProps = {
  value: number;
  max: number;
  tone?: MeterTone;
  style?: StyleProp<ViewStyle>;
};

const FILLS: Record<MeterTone, ThemeColor> = {
  steps: 'steps',
  power: 'primary',
  rival: 'defeat',
  // Medido en `Captura5.png`: cuando vas por detrás en un duelo, la fila de la
  // lista pinta la barra en gris (#767C8C, el Text Muted original del diseño),
  // no en Rival. El rojo se reserva para la cifra, no para la barra entera.
  muted: 'textMuted',
};

const TRACK_HEIGHT = 6;

export function MeterBar({ value, max, tone = 'steps', style }: MeterBarProps) {
  const theme = useTheme();

  // Mismo criterio que `XpBar`: un `max` de 0 solo puede venir de un bug de
  // quien llama, y pintar la barra vacía es mejor que propagar un NaN.
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max, now: value }}
      style={[styles.track, { backgroundColor: theme.meterTrack }, style]}>
      <View
        style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: theme[FILLS[tone]] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: TRACK_HEIGHT,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
});
