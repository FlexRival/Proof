import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { CharacterAvatar, EMPTY_EQUIPPED_COSMETICS } from '@/components/character-avatar';
import { Notice } from '@/components/notice';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ROUTES } from '@/constants/routes';
import { MaxContentWidth, Palette, Radius, Spacing } from '@/constants/theme';
import { useMyEquippedCosmetics } from '@/hooks/use-my-equipped-cosmetics';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { SETTINGS_DEMO } from '@/lib/demo-data';
import { formatCount, formatJoinDate } from '@/lib/format';
import { levelProgress } from '@/lib/xp';
import { profileRepository, RepositoryError, type EquippedCosmetics } from '@/repositories';

/**
 * Ajustes. Sigue a `capturadiseño/Captura14.png`.
 *
 * Identidad (username, nivel, fecha de alta) y avatar son **datos reales de
 * la sesión**. El resto — conmutadores de notificaciones, origen de pasos —
 * sigue de mentira: los conmutadores porque no hay tabla de preferencias
 * (guardarlos sería inventarse la capa de datos), y el origen de pasos
 * porque la captura de pasos no está implementada (`docs/conteo-de-pasos.md`).
 *
 * Esta pantalla fue la que destapó que las rutas fuera de las pestañas eran
 * inalcanzables: existía como archivo y abrirla pintaba la pantalla principal.
 * Ahora cuelga del `Stack` raíz.
 */
export default function SettingsScreen() {
  const [leadChanges, setLeadChanges] = useState(true);
  const [duelInvites, setDuelInvites] = useState(true);
  const [stepSummary, setStepSummary] = useState(false);
  const [logOutError, setLogOutError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const { state: profileState, reload: reloadProfile } = useProfile();
  const { state: equippedState } = useMyEquippedCosmetics();

  async function handleLogOut() {
    setLogOutError(null);
    try {
      // No hace falta navegar tras esto: el logout dispara `onAuthStateChange`,
      // `Stack.Protected` en `_layout.tsx` lo nota y cambia solo a `login`.
      await profileRepository.signOut();
    } catch (error) {
      setLogOutError(
        error instanceof RepositoryError ? error.message : 'No se pudo cerrar sesión.',
      );
    }
  }

  async function handleChangePhoto() {
    setAvatarError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setAvatarError('Enable photo library access in your device settings to set a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    if (!asset.base64) {
      setAvatarError('Could not read that photo. Try a different one.');
      return;
    }

    setAvatarUploading(true);
    try {
      await profileRepository.updateAvatar({
        base64: asset.base64,
        mimeType: asset.mimeType ?? 'image/jpeg',
      });
      await reloadProfile();
    } catch (error) {
      setAvatarError(
        error instanceof RepositoryError ? error.message : 'No se pudo subir la foto.',
      );
    } finally {
      setAvatarUploading(false);
    }
  }

  if (profileState.status !== 'ready') {
    // El guard de sesión de `_layout.tsx` ya garantiza que llegar aquí implica
    // sesión iniciada; esto solo cubre el instante de carga o un fallo real.
    return <ThemedView style={styles.screen} />;
  }

  const { username, xp, createdAt, avatarUrl } = profileState.data;
  const { level } = levelProgress(xp);
  const equipped = equippedState.status === 'ready' ? equippedState.data : EMPTY_EQUIPPED_COSMETICS;

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
            <Pressable onPress={handleChangePhoto} disabled={avatarUploading}>
              <ProfilePhoto avatarUrl={avatarUrl} equipped={equipped} />
            </Pressable>

            <View style={styles.identityBody}>
              <ThemedText type="bodyBold">{username}</ThemedText>
              <ThemedText type="caption" themeColor="textMuted">
                {`LV ${level} · JOINED ${formatJoinDate(createdAt)}`}
              </ThemedText>
              <ThemedText
                type="linkPrimary"
                onPress={avatarUploading ? undefined : handleChangePhoto}>
                {avatarUploading ? 'Uploading…' : 'Change photo'}
              </ThemedText>
            </View>
          </Card>

          {avatarError ? <Notice tone="rival" message={avatarError} /> : null}

          <Section title="ACTIVITY SOURCE">
            <SettingRow label="Step tracking">
              <ThemedText type="smallBold" themeColor="textMuted">
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

            <SettingRow label="Log out" labelColor="defeat" onPress={handleLogOut} />

            {logOutError ? <Notice tone="rival" message={logOutError} /> : null}
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

/**
 * Foto real si el usuario ya subió una; si no, el personaje de cosméticos
 * como respaldo — no un círculo vacío. Son dos conceptos distintos a
 * propósito: esta es tu identidad de cuenta, `CharacterAvatar` (Home, Perfil)
 * es tu personaje del juego.
 */
type ProfilePhotoProps = { avatarUrl: string | null; equipped: EquippedCosmetics };

function ProfilePhoto({ avatarUrl, equipped }: ProfilePhotoProps) {
  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={styles.avatarImage} contentFit="cover" />;
  }

  return <CharacterAvatar equipped={equipped} size={AVATAR_SIZE} />;
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
  onPress?: () => void;
  children?: ReactNode;
};

function SettingRow({ label, labelColor = 'text', onPress, children }: SettingRowProps) {
  const row = (
    <Card variant="sunken" style={styles.row}>
      <ThemedText type="small" themeColor={labelColor}>
        {label}
      </ThemedText>
      {children}
    </Card>
  );

  if (!onPress) {
    return row;
  }

  return <Pressable onPress={onPress}>{row}</Pressable>;
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
  identityBody: { flex: 1, gap: Spacing.one },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: Radius.pill,
  },
  section: { gap: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    minHeight: 48,
  },
});
