import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Notice } from '@/components/notice';
import { SegmentedControl, type SegmentedOption } from '@/components/segmented-control';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { profileRepository, RepositoryError } from '@/repositories';

type Mode = 'signIn' | 'signUp';

const MODE_OPTIONS: SegmentedOption<Mode>[] = [
  { value: 'signIn', label: 'Sign in' },
  { value: 'signUp', label: 'Sign up' },
];

/**
 * Puerta de entrada sin sesión. `src/app/_layout.tsx` la muestra en vez de
 * `(tabs)` mientras no haya sesión (`Stack.Protected`) — un login exitoso no
 * navega a mano: en cuanto `signInWithPassword`/`signUp` crea sesión,
 * `useProfile()` lo nota vía `onAuthStateChange` y el layout raíz cambia
 * solo a `(tabs)`.
 */
export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const canSubmit =
    !submitting &&
    email.trim().length > 0 &&
    password.length > 0 &&
    (mode === 'signIn' || username.trim().length >= 3);

  async function handleSubmit() {
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      if (mode === 'signIn') {
        await profileRepository.signInWithPassword(email.trim(), password);
      } else {
        const { needsEmailConfirmation } = await profileRepository.signUp(
          email.trim(),
          password,
          username.trim(),
        );

        if (needsEmailConfirmation) {
          setInfo('Check your email to confirm your account before signing in.');
        }
      }
    } catch (caught) {
      setError(
        caught instanceof RepositoryError ? caught.message : 'Something went wrong. Try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <ThemedText type="title" style={styles.title}>
            PROOFIT
          </ThemedText>

          <SegmentedControl options={MODE_OPTIONS} value={mode} onChange={setMode} />

          <View style={styles.fields}>
            {mode === 'signUp' && (
              <TextField
                label="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Heroe_1234"
              />
            )}

            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="you@example.com"
            />

            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
            />
          </View>

          {error ? <Notice tone="rival" message={error} /> : null}
          {info ? <Notice tone="info" message={info} /> : null}

          <Button
            label={mode === 'signIn' ? 'Sign in' : 'Create account'}
            onPress={handleSubmit}
            disabled={!canSubmit}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  title: { textAlign: 'center' },
  fields: { gap: Spacing.three },
});
