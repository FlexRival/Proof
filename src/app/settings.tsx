import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { MaxContentWidth, Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { demoLevelProgress, HOME_DEMO, SETTINGS_DEMO } from '@/lib/demo-data';
import { formatCount } from '@/lib/format';

/**
 * Ajustes. Sigue a `capturadiseño/Captura14.png`.
 *
 * **Nada de esto persiste todavía.** Los conmutadores son estado local: no hay
 * tabla de preferencias en el esquema, así que guardarlos sería inventarse la
 * capa de datos.
 *
 * Esta pantalla fue la que destapó que las rutas fuera de las pestañas eran
 * inalcanzables: existía como archivo y abrirla pintaba la pantalla principal.
 * Ahora cuelga del `Stack` raíz.
 */
export default function SettingsScreen() {
  const [leadChanges, setLeadChanges] = useState(true);
  const [duelInvites, setDuelInvites] = useState(true);
  const [stepSummary, setStepSummary] = useState(false);

  const { level } = demoLevelProgress();

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Button label="Back" variant="secondary" onPress={goBack} />
            <ThemedText type="subheading">SETTINGS</ThemedText>
            {/* Hueco simétrico para que el título quede centrado de verdad. */}
            <View style={styles.headerSpacer} />
          </View>

          <Card style={styles.identity}>
            {/* Avatar (KAN-19). */}
            <Card variant="sunken" style={styles.avatar} />

            <View style={styles.identityBody}>
              <ThemedText type="bodyBold">{HOME_DEMO.username}</ThemedText>
              <ThemedText type="caption" themeColor="textMuted">
                {`LV ${level} · ${SETTINGS_DEMO.joined}`}
              </ThemedText>
            </View>
          </Card>

          <Section title="ACTIVITY SOURCE">
            <SettingRow label="Step tracking">
              <ThemedText type="smallBold" themeColor="primary">
                {SETTINGS_DEMO.stepTracking}
              </ThemedText>
            </SettingRow>

            <SettingRow label="Daily step goal">
              <ThemedText type="smallBold" themeColor="textMuted">
                {formatCount(SETTINGS_DEMO.dailyStepGoal)}
              </ThemedText>
            </SettingRow>
          </Section>

          <Section title="NOTIFICATIONS">
            <SettingRow label="Lead changes">
              <Toggle value={leadChanges} onChange={setLeadChanges} label="Lead changes" />
            </SettingRow>

            <SettingRow label="Duel invites">
              <Toggle value={duelInvites} onChange={setDuelInvites} label="Duel invites" />
            </SettingRow>

            <SettingRow label="Daily step summary">
              <Toggle value={stepSummary} onChange={setStepSummary} label="Daily step summary" />
            </SettingRow>
          </Section>

          <Section title="ACCOUNT">
            <SettingRow label="Privacy and visibility" />

            {/*
              Cerrar sesión de verdad tiene que pasar por el repositorio, no
              por `supabase.auth` a pelo: fuera de `src/repositories/` la app no
              habla con el backend. Queda como fila sin acción hasta que exista
              ese método, en vez de un botón que miente.
            */}
            <SettingRow label="Log out" labelColor="defeat" />
          </Section>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

/** Vuelve por donde se vino; si no hay historial, a la pantalla principal. */
function goBack() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(ROUTES.home.href);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="label" themeColor="textDim">
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

type SettingRowProps = {
  label: string;
  labelColor?: 'text' | 'defeat';
  children?: ReactNode;
};

function SettingRow({ label, labelColor = 'text', children }: SettingRowProps) {
  return (
    <Card variant="sunken" style={styles.row}>
      <ThemedText type="small" themeColor={labelColor}>
        {label}
      </ThemedText>
      {children}
    </Card>
  );
}

/**
 * Conmutador del sistema teñido con la paleta. `Switch` solo acepta colores
 * sueltos, no tokens semánticos, así que es de los pocos sitios donde se baja
 * a `Palette` — mismo caso que las paradas de degradado.
 */
type ToggleProps = {
  value: boolean;
  onChange: (next: boolean) => void;
  label: string;
};

function Toggle({ value, onChange, label }: ToggleProps) {
  const theme = useTheme();

  return (
    <Switch
      value={value}
      onValueChange={onChange}
      accessibilityLabel={label}
      trackColor={{ false: theme.surfaceRaised, true: theme.primary }}
      thumbColor={value ? Palette.onPower : theme.textMuted}
      ios_backgroundColor={theme.surfaceRaised}
    />
  );
}

const AVATAR_SIZE = 44;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerSpacer: { width: Spacing.six },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, padding: 0 },
  identityBody: { flex: 1, gap: Spacing.one },
  section: { gap: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    minHeight: 48,
  },
});
