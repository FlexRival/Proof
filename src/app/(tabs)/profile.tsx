import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { StatTile } from '@/components/molecules/stat-tile';
import { ThemedText } from '@/components/atoms/themed-text';
import { ThemedView } from '@/components/atoms/themed-view';
import { XpProgress } from '@/components/organisms/xp-progress';
import { ROUTES } from '@/constants/routes';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { PROFILE_DEMO } from '@/lib/demo-data';
import { formatCompact, formatCount } from '@/lib/format';
import { levelProgress } from '@/lib/xp';

/**
 * Perfil del jugador: nivel y su historial de duelos.
 *
 * **No hay ningún personaje RPG que represente al usuario** (se descartó a
 * propósito, junto con el sistema de cosméticos que lo dibujaba) — el
 * recuadro de la cabecera es un hueco reservado, no un avatar.
 *
 * Identidad (username, nivel, XP, racha) es **dato real de la sesión**
 * (`useProfile`). Victorias, derrotas, duelos y pasos totales **siguen en
 * `PROFILE_DEMO`**: no hay repositorio de duelos/pasos todavía (ver los
 * comentarios de `src/lib/demo-data.ts`) — mostrar un 0 falso ahí sería tan de
 * mentira como el número de la captura, así que se quedan como están hasta
 * que exista esa pieza.
 *
 * Dos desvíos conscientes respecto a la captura:
 * - La captura rotula `@marcodev · VANGUARD`, y VANGUARD es una **clase de
 *   personaje**. Las clases se descartaron (el esquema borró `user_class` y
 *   `avatar_class`) y no hay ningún concepto de "rango" individual que lo
 *   sustituya en el esquema (`clans.rank_points` es de clan, no de jugador) —
 *   así que esa mitad de la línea se quita en vez de inventar un dato falso.
 * - El botón de ajustes de la cabecera es un icono circular en la captura.
 *   No hay sistema de iconos todavía, así que va como botón con texto.
 */
export default function ProfileScreen() {
  const { state: profileState } = useProfile();

  // Todavía de mentira: sin duel-repository ni agregación de step_logs no hay
  // de dónde sacar esto de verdad. Ver el comentario de arriba.
  const { wins, losses, totalSteps } = PROFILE_DEMO;
  const duels = wins + losses;
  const winRate = duels > 0 ? Math.round((wins / duels) * 100) : 0;

  if (profileState.status !== 'ready') {
    // El guard de sesión de `_layout.tsx` ya garantiza que llegar aquí implica
    // sesión iniciada; esto solo cubre el instante de carga o un fallo real.
    return <ThemedView style={styles.screen} />;
  }

  const { username, xp, streakDays } = profileState.data;
  const { level, xpIntoLevel, xpForNextLevel } = levelProgress(xp);

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

          <Card style={styles.character} />

          <ThemedText type="bodyBold" style={styles.identity}>
            {username}
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
            <StatTile label="STREAK" value={`🔥 ${formatCount(streakDays)}`} />
            <StatTile label="TOTAL STEPS" value={formatCompact(totalSteps)} />
          </View>
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
