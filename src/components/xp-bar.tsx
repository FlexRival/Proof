import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Gradients, Motion, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Barra de XP del diseño: rótulo a la izquierda, `2,450 / 3,000` a la derecha
 * y una pista con relleno en degradado Power.
 *
 * Recibe el progreso ya calculado (`value` / `max`), no el XP total: quien
 * pinta la barra saca esos dos números de `levelProgress()` en `@/lib/xp`, que
 * es el único sitio donde vive la aritmética de nivel.
 */
export type XpBarProps = {
  /** XP acumulado dentro del nivel actual. */
  value: number;
  /** XP que hay que juntar para subir de nivel. */
  max: number;
  /** Rótulo de la izquierda. `null` lo quita y deja solo la pista. */
  label?: string | null;
  showValues?: boolean;
  /** A `false` la barra salta al valor nuevo. Útil en tests y en listas. */
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
};

const TRACK_HEIGHT = 8;

/**
 * Los separadores de millar siguen a la copy de la app, que está en inglés
 * (`2,450 / 3,000`). Cuando haya i18n esto sale de la locale, no de aquí.
 */
const NUMBER_FORMAT = new Intl.NumberFormat('en-US');

export function XpBar({
  value,
  max,
  label = 'XP PROGRESS',
  showValues = true,
  animated = true,
  style,
}: XpBarProps) {
  const theme = useTheme();

  // Un `max` de 0 solo puede venir de un bug de quien llama; pintar la barra
  // vacía es mejor que propagar un NaN al ancho.
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;

  const progress = useSharedValue(ratio);

  useEffect(() => {
    progress.value = animated
      ? withTiming(ratio, {
          duration: Motion.duration.base,
          easing: Easing.bezier(...Motion.easing.standard),
        })
      : ratio;
  }, [animated, progress, ratio]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  const hasHeader = label !== null || showValues;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max, now: value }}
      style={style}>
      {hasHeader ? (
        <View style={styles.header}>
          {label !== null ? (
            <ThemedText type="label" themeColor="textDim">
              {label}
            </ThemedText>
          ) : null}
          {showValues ? (
            <ThemedText type="caption" themeColor="xp">
              {`${NUMBER_FORMAT.format(value)} / ${NUMBER_FORMAT.format(max)}`}
            </ThemedText>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.track, { backgroundColor: theme.xpTrack }]}>
        <Animated.View style={[styles.fill, fillStyle]}>
          <LinearGradient
            colors={Gradients.xp}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
});
