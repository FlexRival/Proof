import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/atoms/themed-text';
import { Motion, Palette, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * La transición `11 → 12` de la subida de nivel: el nivel viejo apagado, la
 * flecha, y el nuevo entrando de golpe con el flash de marca.
 *
 * Es la pieza animada de la celebración y vive aparte de la pantalla para que
 * la victoria de un duelo pueda reutilizarla sin arrastrar el resto del
 * layout.
 *
 * `Palette.powerFlash` se usa directo de la paleta, sin token semántico: el
 * diseño lo reserva justo para este flash y no lo pide en ningún otro sitio —
 * ver `docs/design.md` § Acentos.
 */
export type LevelUpBadgeProps = {
  fromLevel: number;
  toLevel: number;
  /** A `false` el nivel nuevo aparece ya asentado, sin entrada ni flash. */
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Escala de la que arranca el nivel nuevo antes del rebote. */
const REVEAL_FROM_SCALE = 0.6;

/**
 * El nivel nuevo entra después de que el ojo haya leído el viejo. Sin esta
 * pausa las dos cifras aparecen a la vez y no se lee una transición.
 */
const REVEAL_DELAY = Motion.duration.fast;

const ARROW = '→';

export function LevelUpBadge({ fromLevel, toLevel, animated = true, style }: LevelUpBadgeProps) {
  const theme = useTheme();

  // Con «reducir movimiento» activado en el sistema se ve el resultado final,
  // sin rebote ni flash: una celebración a pantalla completa es justo el caso
  // que esa preferencia existe para cubrir.
  const prefersReducedMotion = useReducedMotion();
  const plays = animated && !prefersReducedMotion;

  const scale = useSharedValue(plays ? REVEAL_FROM_SCALE : 1);
  const flash = useSharedValue(0);

  useEffect(() => {
    if (!plays) {
      scale.value = 1;
      flash.value = 0;
      return;
    }

    scale.value = withDelay(REVEAL_DELAY, withSpring(1, Motion.spring.bouncy));
    flash.value = withDelay(
      REVEAL_DELAY,
      withSequence(
        withTiming(1, { duration: Motion.duration.fast }),
        withTiming(0, { duration: Motion.duration.celebrate }),
      ),
    );
  }, [flash, plays, scale]);

  const newLevelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    color: interpolateColor(flash.value, [0, 1], [theme.primary, Palette.powerFlash]),
  }));

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Level ${fromLevel} to level ${toLevel}`}
      style={[styles.row, style]}>
      <ThemedText type="heading" themeColor="textDim">
        {fromLevel}
      </ThemedText>

      <ThemedText type="heading" themeColor="textMuted">
        {ARROW}
      </ThemedText>

      <Animated.Text style={[Typography.display, newLevelStyle]}>{toLevel}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
});
