import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { StatTile } from '@/components/stat-tile';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { XpProgress } from '@/components/xp-progress';
import { ROUTES } from '@/constants/routes';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { demoLevelProgress, PROFILE_DEMO } from '@/lib/demo-data';
import { formatCompact, formatCount } from '@/lib/format';

/**
 * Perfil del jugador: personaje, nivel y su historial de duelos.
 * Sigue a `capturadiseño/Captura12.png`.
 *
 * **Datos de demostración todavía** (`PROFILE_DEMO`), igual que la pantalla
 * principal.
 *
 * Dos desvíos conscientes respecto a la captura, ambos porque el diseño es
 * anterior a decisiones que ya se tomaron:
 * - La captura rotula `@marcodev · VANGUARD`, y VANGUARD es una **clase de
 *   personaje**. Las clases se descartaron (el esquema borró `user_class` y
 *   `avatar_class`), así que aquí va el rango, como en la pantalla principal.
 * - El botón de ajustes de la cabecera es un icono circular en la captura.
 *   No hay sistema de iconos todavía, así que va como botón con texto.
 *
 * "Customize character" sí navega a una pantalla real
 * (`src/app/customize-character.tsx`) con sesión y repositorio de verdad —
 * a diferencia del resto de esta pantalla, que sigue en `PROFILE_DEMO`.
 */
export default function ProfileScreen() {
  const { username, rank, wins, losses, streak, totalSteps } = PROFILE_DEMO;
  const { level, xpIntoLevel, xpForNextLevel } = demoLevelProgress();

  // Duelos y acierto se derivan: guardarlos aparte los dejaría desincronizarse
  // de las victorias y las derrotas.
  const duels = wins + losses;
  const winRate = duels > 0 ? Math.round((wins / duels) * 100) : 0;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="subheading">CHARACTER</ThemedText>
            <Button
              label="Settings"
              variant="secondary"
              onPress={() => router.push(ROUTES.settings.href)}
            />
          </View>

          {/* Personaje (KAN-19): reserva el espacio del diseño. */}
          <Card style={styles.character} />

          <ThemedText type="bodyBold" style={styles.identity}>
            {`${username} · ${rank}`}
          </ThemedText>

          <ThemedText type="heading" style={styles.level}>{`LEVEL ${level}`}</ThemedText>

          <XpProgress level={level} xpIntoLevel={xpIntoLevel} xpForNextLevel={xpForNextLevel} />

          <View style={styles.statsRow}>
            <StatTile label="WINS" value={formatCount(wins)} valueColor="victory" />
            <StatTile label="LOSSES" value={formatCount(losses)} valueColor="defeat" />
            <StatTile label="WIN RATE" value={`${winRate}%`} />
          </View>

          <View style={styles.statsRow}>
            <StatTile label="DUELS" value={formatCount(duels)} />
            <StatTile label="STREAK" value={`🔥 ${formatCount(streak)}`} />
            <StatTile label="TOTAL STEPS" value={formatCompact(totalSteps)} />
          </View>

          <Button
            label="Customize character"
            onPress={() => router.push(ROUTES.customizeCharacter.href)}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    paddingBottom: Spacing.three + BottomTabInset,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  character: {
    width: '70%',
    alignSelf: 'center',
    aspectRatio: 0.85,
  },
  identity: {
    textAlign: 'center',
  },
  level: {
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
