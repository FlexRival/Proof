import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { LevelUpBadge } from '@/components/molecules/level-up-badge';
import { ThemedText } from '@/components/atoms/themed-text';
import { ThemedView } from '@/components/atoms/themed-view';
import { XpBar } from '@/components/molecules/xp-bar';
import { ROUTES } from '@/constants/routes';
import { MaxContentWidth, Spacing, type ThemeColor } from '@/constants/theme';
import { formatCount } from '@/lib/format';
import { parseVictory } from '@/lib/victory';
import { XP_PER_LEVEL, xpForDuelWin } from '@/lib/xp';

/**
 * Celebración de un duelo ganado.
 *
 * Se abre con el resultado en la URL
 * (`/victory?opponent=@alexruiz&steps=8742&days=3`). Si el duelo además hizo
 * subir de nivel, se añaden `from` y `to` y aparece el bloque de subida.
 *
 * No consulta al backend: cuando esta pantalla se ve, `resolve_duel` ya contó
 * el XP en el servidor. La cifra que se enseña se deriva con la misma regla
 * (`xpForDuelWin`), que espeja el SQL.
 */
export default function VictoryScreen() {
  const params = useLocalSearchParams();
  const victory = parseVictory(params);

  // Un enlace sin resultado válido no tiene nada que celebrar. El diseño no
  // define un estado de error aquí, así que se sale a la principal.
  if (!victory) {
    return <Redirect href={ROUTES.home.href} />;
  }

  const { opponent, steps, days, levelUp } = victory;
  const xpEarned = xpForDuelWin(steps);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headline}>
            <ThemedText type="label" themeColor="victory">
              VICTORY
            </ThemedText>
            <ThemedText type="title">YOU WIN</ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              {`${days} day duel vs ${opponent}`}
            </ThemedText>
          </View>

          {/* Personaje (KAN-19): reserva el espacio del diseño. */}
          <Card style={styles.character} />

          <View style={styles.stats}>
            <ResultTile label="FINAL STEPS" value={formatCount(steps)} />
            <ResultTile
              label="XP EARNED"
              value={`+${formatCount(xpEarned)}`}
              valueColor="xp"
              highlight
            />
          </View>

          {levelUp ? (
            <Card variant="highlight" style={styles.levelUp}>
              <ThemedText type="label" themeColor="primary">
                LEVEL UP!
              </ThemedText>
              <LevelUpBadge fromLevel={levelUp.fromLevel} toLevel={levelUp.toLevel} />
              <XpBar value={XP_PER_LEVEL} max={XP_PER_LEVEL} label={null} revealOnMount />
            </Card>
          ) : null}

          <View style={styles.actions}>
            {/*
              Compartir es el gancho viral del producto, pero necesita
              `react-native-view-shot` y una plantilla de imagen que todavía no
              existen (KAN-33, KAN-34, KAN-35). Deshabilitado antes que
              prometer algo que no ocurre.
            */}
            <Button label="Share victory" disabled />
            <Button label="Continue" variant="ghost" onPress={dismiss} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

/** Vuelve por donde se vino; si no hay historial, a la pantalla principal. */
function dismiss() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(ROUTES.home.href);
}

type ResultTileProps = {
  label: string;
  value: string;
  valueColor?: ThemeColor;
  /** La card de XP va con contorno Power; la de pasos, neutra. */
  highlight?: boolean;
};

function ResultTile({ label, value, valueColor, highlight = false }: ResultTileProps) {
  return (
    <Card variant={highlight ? 'highlight' : 'sunken'} style={styles.tile}>
      <ThemedText type="label" themeColor="textDim">
        {label}
      </ThemedText>
      <ThemedText type="subtitle" themeColor={valueColor}>
        {value}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  headline: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  character: {
    width: '100%',
    aspectRatio: 1.1,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  tile: {
    flex: 1,
    gap: Spacing.one,
  },
  levelUp: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  actions: {
    gap: Spacing.two,
  },
});
