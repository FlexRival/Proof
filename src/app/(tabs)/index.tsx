import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { MeterBar, type MeterTone } from '@/components/meter-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { XpProgress } from '@/components/xp-progress';
import { ROUTES } from '@/constants/routes';
import { BottomTabInset, MaxContentWidth, Spacing, type ThemeColor } from '@/constants/theme';
import { formatCount } from '@/lib/format';
import { demoLevelProgress, HOME_DEMO, type DuelSide } from '@/lib/demo-data';

/**
 * Pantalla principal: quién eres, tu nivel, los pasos de hoy y el duelo en
 * curso. Sigue a `capturadiseño/Captura3.png`.
 *
 * **Los datos son de mentira todavía** (`HOME_MOCK`), tal y como pide KAN-22
 * mientras el backend no está. Ese archivo documenta a qué repositorio se
 * conectará cada campo.
 *
 * Los pasos van en neutro, nunca en Power: el diseño insiste en que los pasos
 * son actividad, no un contador de XP en vivo.
 */
export default function HomeScreen() {
  const { username, rank, steps, stepGoal, duel } = HOME_DEMO;
  const { level, xpIntoLevel, xpForNextLevel } = demoLevelProgress();

  const stepsToGoal = Math.max(0, stepGoal - steps);
  // Las dos barras del duelo se miden contra quien va ganando, para que la del
  // líder salga llena y la diferencia se lea de un vistazo.
  const duelLeader = duel ? Math.max(duel.you.steps, duel.rival.steps) : 0;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            {/* Avatar (KAN-19). */}
            <Card style={styles.avatar} />

            <View style={styles.identity}>
              <ThemedText type="bodyBold">{username}</ThemedText>
              <ThemedText type="label" themeColor="textDim">{`RANK · ${rank}`}</ThemedText>
            </View>

            <Chip label={`LV ${level}`} tone="primary" />
          </View>

          {duel ? (
            <>
              {/* Personaje (KAN-19): reserva el espacio del diseño. */}
              <Card style={styles.character} />

              <ThemedText type="heading" style={styles.level}>{`LEVEL ${level}`}</ThemedText>

              <XpProgress
                level={level}
                xpIntoLevel={xpIntoLevel}
                xpForNextLevel={xpForNextLevel}
              />

              <Card style={styles.block}>
                <ThemedText type="label" themeColor="textDim">
                  TODAY&apos;S STEPS
                </ThemedText>
                <ThemedText type="title" themeColor="steps">
                  {formatCount(steps)}
                </ThemedText>
                <ThemedText type="caption" themeColor="textMuted">
                  {`+${formatCount(stepsToGoal)} to goal · ${formatCount(stepGoal)}`}
                </ThemedText>
                <MeterBar value={steps} max={stepGoal} tone="steps" />
              </Card>

              <Card variant="highlight" style={styles.block}>
                <View style={styles.spread}>
                  <ThemedText type="label" themeColor="primary">
                    CURRENT DUEL
                  </ThemedText>
                  <ThemedText type="label" themeColor="textMuted">
                    {duel.endsIn}
                  </ThemedText>
                </View>

                <DuelSideRow side={duel.you} tone="power" leader={duelLeader} />
                <DuelSideRow side={duel.rival} tone="rival" leader={duelLeader} />

                <Button label="View duel" />
              </Card>

              <Button
                label="Challenge a friend"
                variant="secondary"
                onPress={() => router.push(ROUTES.newDuel.href)}
              />
            </>
          ) : (
            <NoDuelState steps={steps} />
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

/**
 * Pantalla principal sin ningún duelo en curso. Sigue a
 * `capturadiseño/Captura4.png`.
 *
 * Cae el progreso de XP y la card del duelo, y los pasos pasan a una card
 * compacta que explica para qué sirven: sin duelo no se gana XP, así que
 * enseñar la barra de XP aquí sería enseñar algo que no se mueve.
 */
function NoDuelState({ steps }: { steps: number }) {
  return (
    <>
      <EmptyState
        title="NO ACTIVE DUELS"
        message="Challenge someone and prove who's got it."
        actionLabel="Challenge a friend"
        onAction={() => router.push(ROUTES.newDuel.href)}>
        {/* Personaje inactivo (KAN-19): reserva el espacio del diseño. */}
        <Card variant="sunken" style={styles.idleCharacter} />
      </EmptyState>

      {/*
        Los pasos siguen contando sin duelo, pero no valen XP. La card lo dice
        en vez de callarlo: si no, el contador parece roto.
      */}
      <Card style={styles.idleSteps}>
        <View style={styles.idleStepsBody}>
          <ThemedText type="label" themeColor="textDim">
            TODAY&apos;S STEPS
          </ThemedText>
          <ThemedText type="title" themeColor="steps">
            {formatCount(steps)}
          </ThemedText>
        </View>

        <ThemedText type="caption" themeColor="textMuted" style={styles.idleStepsNote}>
          Win a duel to turn steps into XP
        </ThemedText>
      </Card>
    </>
  );
}

/** Color de la cifra de cada lado del duelo. El tuyo en Power, el rival en Rival. */
const SIDE_COUNT_COLOR: Record<Extract<MeterTone, 'power' | 'rival'>, ThemeColor> = {
  power: 'primary',
  rival: 'defeat',
};

type DuelSideRowProps = {
  side: DuelSide;
  tone: Extract<MeterTone, 'power' | 'rival'>;
  /** Pasos de quien va ganando: el denominador de las dos barras. */
  leader: number;
};

function DuelSideRow({ side, tone, leader }: DuelSideRowProps) {
  return (
    <View style={styles.duelRow}>
      {/* Avatar (KAN-19). */}
      <Card style={styles.duelAvatar} />

      <View style={styles.duelBody}>
        <View style={styles.spread}>
          <ThemedText type="smallBold">{side.name}</ThemedText>
          <ThemedText type="numeric" themeColor={SIDE_COUNT_COLOR[tone]}>
            {formatCount(side.steps)}
          </ThemedText>
        </View>
        <MeterBar value={side.steps} max={leader} tone={tone} />
      </View>
    </View>
  );
}

const AVATAR_SIZE = 44;
const DUEL_AVATAR_SIZE = 36;

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
    // La barra de pestañas flota sobre el contenido, así que el último botón
    // quedaría debajo de ella sin este hueco.
    paddingBottom: Spacing.three + BottomTabInset,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    padding: 0,
  },
  identity: {
    flex: 1,
    gap: Spacing.one,
  },
  character: {
    // Medido en `Captura3.png`: el recuadro del personaje ocupa la mitad del
    // ancho del contenido y va centrado, no a sangre.
    width: '50%',
    alignSelf: 'center',
    aspectRatio: 1,
  },
  idleCharacter: {
    // Sin duelo el personaje manda en la pantalla: en `Captura4.png` es más
    // alto que ancho y ocupa más que el de la pantalla con duelo.
    width: '60%',
    alignSelf: 'center',
    aspectRatio: 0.82,
  },
  idleSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  idleStepsBody: { gap: Spacing.one },
  idleStepsNote: {
    flexShrink: 1,
    textAlign: 'right',
  },
  level: {
    textAlign: 'center',
  },
  spread: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  block: {
    gap: Spacing.two,
  },
  duelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  duelAvatar: {
    width: DUEL_AVATAR_SIZE,
    height: DUEL_AVATAR_SIZE,
    padding: 0,
  },
  duelBody: {
    flex: 1,
    gap: Spacing.two,
  },
});
