import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { SearchField } from '@/components/search-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { demoLevelProgress, FRIENDS, HOME_DEMO, type Friend } from '@/lib/demo-data';

/**
 * Crear un duelo. Sigue a `capturadiseño/Captura7.png`.
 *
 * Es **una sola ruta con tres pasos en estado local**, no tres rutas: el
 * diseño trae su propia barra de progreso y su botón de volver retrocede de
 * paso, no de pantalla. Con tres rutas, volver desde el paso 2 saldría del
 * asistente en vez de devolverte a elegir amigo.
 *
 * Se puede abrir con el rival ya puesto (`/new-duel?opponent=@alexruiz`, que
 * es lo que hace el botón «Challenge» de la lista de amigos); entonces empieza
 * directamente en el paso 2.
 *
 * **No crea nada todavía.** No existe `duel-repository.ts` ni RPC de crear
 * duelo a la que llamar, así que «START DUEL» cierra el asistente igual que
 * los demás botones sin backend. Es KAN-32 quien conecta esto a Supabase.
 */
export default function NewDuelScreen() {
  const { opponent: presetOpponent } = useLocalSearchParams<{ opponent?: string }>();
  const preset = findChallengeable(presetOpponent);

  const [step, setStep] = useState<WizardStep>(preset ? 2 : 1);
  const [opponent, setOpponent] = useState<Friend | null>(preset);
  const [duration, setDuration] = useState<DuelDuration>(DEFAULT_DURATION);

  function goBack() {
    if (step === 1) {
      dismiss();
      return;
    }

    setStep(step === 3 ? 2 : 1);
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.frame}>
          <View style={styles.header}>
            <Button label="Back" variant="secondary" onPress={goBack} />
            <ThemedText type="label" themeColor="textDim">
              {`STEP ${step} OF ${TOTAL_STEPS}`}
            </ThemedText>
            {/* Hueco simétrico para que el rótulo quede centrado de verdad. */}
            <View style={styles.headerSpacer} />
          </View>

          {/*
            En el diseño la maqueta del paso 3 no trae barra (medido: los pasos
            1 y 2 sí la tienen). Se pinta igualmente y completa, porque una
            barra que desaparece justo cuando estaría llena se lee como un
            fallo, no como el final del asistente.
          */}
          <StepProgress step={step} />

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {step === 1 ? <ChooseFriendStep selected={opponent} onSelect={setOpponent} /> : null}

            {step === 2 && opponent ? (
              <SetDuelStep
                opponent={opponent}
                duration={duration}
                onChangeDuration={setDuration}
                onChangeOpponent={() => setStep(1)}
              />
            ) : null}

            {step === 3 && opponent ? (
              <ConfirmStep opponent={opponent} duration={duration} />
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            {step === 1 ? (
              <Button label="Continue" disabled={opponent === null} onPress={() => setStep(2)} />
            ) : null}

            {step === 2 && opponent ? (
              <>
                <Button label="Review duel" onPress={() => setStep(3)} />
                <ThemedText type="label" themeColor="textDim" style={styles.footerNote}>
                  {`${handleOf(opponent).toUpperCase()} MUST CONFIRM BEFORE IT STARTS`}
                </ThemedText>
              </>
            ) : null}

            {step === 3 ? <Button label="Start duel" onPress={dismiss} /> : null}
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const TOTAL_STEPS = 3;
type WizardStep = 1 | 2 | 3;

/** Duraciones que ofrece el diseño, en días. */
const DURATIONS = [1, 3, 7] as const;
type DuelDuration = (typeof DURATIONS)[number];
const DEFAULT_DURATION: DuelDuration = 3;

/** `@alexruiz` → `alexruiz`. El diseño rotula el aviso del paso 2 sin arroba. */
function handleOf(friend: Friend): string {
  return friend.username.replace(/^@/, '');
}

/**
 * Un amigo con un duelo en curso no se puede retar otra vez, así que un enlace
 * que lo traiga preseleccionado se ignora y el asistente arranca en el paso 1.
 */
function findChallengeable(username: string | undefined): Friend | null {
  const friend = FRIENDS.find((candidate) => candidate.username === username);
  return friend && !friend.inDuel ? friend : null;
}

/** Vuelve por donde se vino; si no hay historial, a la pantalla principal. */
function dismiss() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(ROUTES.home.href);
}

/** Barra de progreso: un segmento por paso, los ya recorridos en Power. */
function StepProgress({ step }: { step: WizardStep }) {
  const theme = useTheme();

  return (
    <View style={styles.progress}>
      {Array.from({ length: TOTAL_STEPS }, (_, index) => (
        <View
          key={index}
          style={[
            styles.progressSegment,
            { backgroundColor: index < step ? theme.primary : theme.meterTrack },
          ]}
        />
      ))}
    </View>
  );
}

type ChooseFriendStepProps = {
  selected: Friend | null;
  onSelect: (friend: Friend) => void;
};

function ChooseFriendStep({ selected, onSelect }: ChooseFriendStepProps) {
  const [query, setQuery] = useState('');

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? FRIENDS.filter((friend) => friend.username.toLowerCase().includes(needle))
    : FRIENDS;

  return (
    <>
      <ThemedText type="title">{'CHOOSE\nA FRIEND'}</ThemedText>

      <SearchField value={query} onChange={setQuery} />

      {visible.length > 0 ? (
        visible.map((friend) => (
          <FriendOption
            key={friend.username}
            friend={friend}
            selected={friend.username === selected?.username}
            onSelect={() => onSelect(friend)}
          />
        ))
      ) : (
        <ThemedText type="small" themeColor="textDim" style={styles.empty}>
          No friends match that search.
        </ThemedText>
      )}
    </>
  );
}

type FriendOptionProps = {
  friend: Friend;
  selected: boolean;
  onSelect: () => void;
};

/**
 * Fila seleccionable de la lista. Con un duelo en curso queda inerte y marcada
 * `IN DUEL`, la misma regla que en la lista de amigos: dejar elegirla solo
 * serviría para fallar tres pasos más tarde.
 */
function FriendOption({ friend, selected, onSelect }: FriendOptionProps) {
  const theme = useTheme();
  const disabled = friend.inDuel;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onSelect}>
      <Card variant={selected ? 'highlight' : 'default'} style={styles.option}>
        {/* Avatar (KAN-19). */}
        <Card variant={disabled ? 'rival' : 'sunken'} style={styles.avatar} />

        <View style={styles.optionBody}>
          <ThemedText type="bodyBold">{friend.username}</ThemedText>
          <ThemedText type="caption" themeColor="textMuted">
            {`LV ${friend.level} · 🔥 ${friend.streakDays} DAYS`}
          </ThemedText>
        </View>

        {disabled ? <Chip label="IN DUEL" tone="rival" /> : null}

        {selected ? (
          <View style={[styles.check, { backgroundColor: theme.primary }]}>
            <ThemedText type="caption" themeColor="onPrimary">
              ✓
            </ThemedText>
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

type SetDuelStepProps = {
  opponent: Friend;
  duration: DuelDuration;
  onChangeDuration: (next: DuelDuration) => void;
  onChangeOpponent: () => void;
};

function SetDuelStep({ opponent, duration, onChangeDuration, onChangeOpponent }: SetDuelStepProps) {
  return (
    <>
      <ThemedText type="title">SET THE DUEL</ThemedText>

      <Card style={styles.option}>
        {/* Avatar (KAN-19). */}
        <Card variant="rival" style={styles.avatar} />

        <View style={styles.optionBody}>
          <ThemedText type="bodyBold">{opponent.username}</ThemedText>
          <ThemedText type="caption" themeColor="textMuted">
            {`LV ${opponent.level} · 🔥 ${opponent.streakDays} DAYS`}
          </ThemedText>
        </View>

        <Pressable accessibilityRole="link" onPress={onChangeOpponent}>
          <ThemedText type="linkPrimary">Change</ThemedText>
        </Pressable>
      </Card>

      <ThemedText type="label" themeColor="textDim">
        DURATION
      </ThemedText>

      <View style={styles.durations}>
        {DURATIONS.map((days) => (
          <DurationOption
            key={days}
            days={days}
            selected={days === duration}
            onSelect={() => onChangeDuration(days)}
          />
        ))}
      </View>

      <Card variant="sunken" style={styles.rules}>
        <ThemedText type="label" themeColor="textDim">
          RULES
        </ThemedText>

        <ThemedText type="subheading">The player with the most steps wins.</ThemedText>

        {RULES.map((rule) => (
          <ThemedText key={rule} type="small" themeColor="textMuted">
            {rule}
          </ThemedText>
        ))}
      </Card>
    </>
  );
}

/**
 * Copy de la card de reglas, transcrita del diseño. Coincide con lo que hace
 * el servidor: `resolve_duel` gana por pasos y da `floor(pasos / 10)` de XP
 * solo al ganador, sin tocar la racha (`supabase/SCHEMA.md`).
 */
const RULES = [
  'Steps count from the moment your rival accepts.',
  'The winner earns XP equal to their steps divided by 10.',
  'The loser earns nothing. Streaks stay intact.',
];

type DurationOptionProps = {
  days: DuelDuration;
  selected: boolean;
  onSelect: () => void;
};

function DurationOption({ days, selected, onSelect }: DurationOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onSelect}
      style={styles.durationSlot}>
      <Card variant={selected ? 'highlight' : 'default'} style={styles.duration}>
        <ThemedText type="subtitle" themeColor={selected ? 'primary' : 'text'}>
          {String(days)}
        </ThemedText>
        <ThemedText type="label" themeColor={selected ? 'primary' : 'textDim'}>
          {days === 1 ? 'DAY' : 'DAYS'}
        </ThemedText>
      </Card>
    </Pressable>
  );
}

function ConfirmStep({ opponent, duration }: { opponent: Friend; duration: DuelDuration }) {
  const { level } = demoLevelProgress();

  return (
    <>
      <View style={styles.headline}>
        <ThemedText type="label" themeColor="primary">
          {`${duration} DAY DUEL`}
        </ThemedText>
        <ThemedText type="title" style={styles.headlineTitle}>
          {'READY TO\nPROVE IT?'}
        </ThemedText>
      </View>

      <View style={styles.versus}>
        <Fighter variant="highlight" username={HOME_DEMO.username} level={level} />

        <ThemedText type="heading">VS</ThemedText>

        <Fighter variant="rival" username={opponent.username} level={opponent.level} />
      </View>

      <ThemedText type="small" themeColor="textMuted" style={styles.versusNote}>
        {`Most steps in ${duration} ${duration === 1 ? 'day' : 'days'} wins. Winner takes the XP.`}
      </ThemedText>
    </>
  );
}

type FighterProps = {
  variant: 'highlight' | 'rival';
  username: string;
  level: number;
};

function Fighter({ variant, username, level }: FighterProps) {
  return (
    <View style={styles.fighter}>
      {/* Personaje (KAN-19): reserva el espacio del diseño. */}
      <Card variant={variant} style={styles.fighterArt} />

      <ThemedText type="smallBold">{username.toUpperCase()}</ThemedText>
      <ThemedText type="caption" themeColor="textMuted">
        {`LV ${level}`}
      </ThemedText>
    </View>
  );
}

const AVATAR_SIZE = 44;
const CHECK_SIZE = 22;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  frame: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerSpacer: { width: 88 },
  progress: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: Radius.pill,
  },
  content: {
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  empty: { textAlign: 'center', paddingVertical: Spacing.four },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  optionBody: { flex: 1, gap: Spacing.one },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, padding: 0 },
  check: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durations: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  durationSlot: { flex: 1 },
  duration: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  rules: { gap: Spacing.two },
  headline: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  headlineTitle: { textAlign: 'center' },
  versus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  fighter: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  fighterArt: {
    width: '100%',
    aspectRatio: 0.78,
  },
  versusNote: { textAlign: 'center' },
  footer: {
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  footerNote: { textAlign: 'center' },
});
