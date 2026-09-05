import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { Chip } from '@/components/atoms/chip';
import { StatTile } from '@/components/molecules/stat-tile';
import { ThemedText } from '@/components/atoms/themed-text';
import { ThemedView } from '@/components/atoms/themed-view';
import { ROUTES } from '@/constants/routes';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { findFriendProfile, type DuelOutcome, type FriendProfile } from '@/lib/demo-data';
import { formatCount } from '@/lib/format';

/**
 * Perfil de un amigo.
 *
 * Se abre con el usuario en la URL (`/friend-profile?username=@alexruiz`),
 * igual que `victory` y `new-duel`. Un usuario que no existe no tiene perfil
 * que enseñar y el diseño no define un estado de error, así que se sale a la
 * lista de amigos.
 *
 * **Datos de demostración todavía**: falta el `friendship-repository.ts` que
 * envuelva las RPC de amistades, y el cara a cara necesita además el
 * `duel-repository.ts` que tampoco existe.
 */
export default function FriendProfileScreen() {
  const { username } = useLocalSearchParams<{ username?: string }>();
  const profile = username ? findFriendProfile(username) : null;

  if (!profile) {
    return <Redirect href={ROUTES.friends.href} />;
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Button label="Back" variant="secondary" onPress={goBack} />
            <ThemedText type="label" themeColor="textDim">
              FRIEND PROFILE
            </ThemedText>
            {/* Hueco simétrico para que el rótulo quede centrado de verdad. */}
            <View style={styles.headerSpacer} />
          </View>

          {/*
            Personaje del amigo (KAN-19): reserva el espacio del diseño. Va en
            Rival porque en esta pantalla el amigo es el oponente, no tú.
          */}
          <Card variant="rival" style={styles.character} />

          <View style={styles.identity}>
            <ThemedText type="subtitle">{profile.username}</ThemedText>

            <View style={styles.chips}>
              <Chip label={`LV ${profile.level}`} tone="primary" />
              <Chip label={`🔥 ${profile.streakDays} DAY STREAK`} tone="rival" />
            </View>
          </View>

          <HeadToHeadCard record={profile.record} />

          <View style={styles.statsRow}>
            <StatTile
              label="DAILY AVG"
              value={profile.dailyAvgSteps === null ? UNKNOWN : formatCount(profile.dailyAvgSteps)}
            />
            <StatTile
              label="WIN RATE"
              value={profile.winRate === null ? UNKNOWN : `${profile.winRate}%`}
            />
          </View>

          <View style={styles.actions}>
            <Button
              label={`Challenge ${profile.username}`}
              onPress={() =>
                router.push({ pathname: '/new-duel', params: { opponent: profile.username } })
              }
            />
            {/*
              El historial de duelos no está diseñado ni tiene pantalla. Va
              deshabilitado en vez de llevar a un callejón sin salida, el mismo
              criterio que el botón de personalizar del perfil propio.
            */}
            <Button label="View duel history" variant="secondary" disabled />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

/**
 * Estadística que todavía no se conoce. Una raya, no un cero: un cero se lee
 * como un dato real y diría que ese amigo no anda ni gana nunca.
 */
const UNKNOWN = '—';

/** Vuelve por donde se vino; si no hay historial, a la lista de amigos. */
function goBack() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(ROUTES.friends.href);
}

/**
 * Marcador cara a cara y la tira de resultados. El marcador y el total salen
 * del propio historial: guardarlos aparte los dejaría desincronizarse.
 */
function HeadToHeadCard({ record }: { record: FriendProfile['record'] }) {
  const wins = record.filter((outcome) => outcome === 'WIN').length;
  const losses = record.length - wins;

  return (
    <Card style={styles.headToHead}>
      <ThemedText type="label" themeColor="textDim">
        HEAD TO HEAD
      </ThemedText>

      {record.length > 0 ? (
        <>
          <View style={styles.scoreRow}>
            <View style={styles.score}>
              <ThemedText type="subtitle" themeColor="victory">
                {String(wins)}
              </ThemedText>
              <ThemedText type="subtitle" themeColor="textDim">
                —
              </ThemedText>
              <ThemedText type="subtitle" themeColor="defeat">
                {String(losses)}
              </ThemedText>
            </View>

            <ThemedText type="caption" themeColor="textMuted">
              {`${formatCount(record.length)} ${record.length === 1 ? 'duel' : 'duels'} together`}
            </ThemedText>
          </View>

          <RecordStrip record={record} />
        </>
      ) : (
        <ThemedText type="small" themeColor="textMuted">
          No duels yet. Challenge them to start the record.
        </ThemedText>
      )}
    </Card>
  );
}

/**
 * Un segmento por duelo, del más antiguo al más reciente: Power si ganaste,
 * Rival si no. Es el historial, no un porcentaje — por eso todos los segmentos
 * miden lo mismo.
 */
function RecordStrip({ record }: { record: DuelOutcome[] }) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Duel history, oldest first: ${record.join(', ').toLowerCase()}`}
      style={styles.strip}>
      {record.map((outcome, index) => (
        <View
          key={index}
          style={[
            styles.stripSegment,
            { backgroundColor: outcome === 'WIN' ? theme.victory : theme.defeat },
          ]}
        />
      ))}
    </View>
  );
}

const STRIP_HEIGHT = 6;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerSpacer: { width: 88 },
  character: {
    width: '100%',
    aspectRatio: 1,
  },
  identity: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  headToHead: { gap: Spacing.three },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  score: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  strip: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  stripSegment: {
    flex: 1,
    height: STRIP_HEIGHT,
    borderRadius: Radius.pill,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actions: { gap: Spacing.two },
});
