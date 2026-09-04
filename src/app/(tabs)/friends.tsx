import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FRIEND_REQUESTS, FRIENDS, type Friend, type FriendRequest } from '@/lib/demo-data';

/**
 * Amigos: solicitudes pendientes y la lista, con el atajo para retar.
 * Sigue a `capturadiseño/Captura9.png`.
 *
 * **Datos de demostración todavía.** Aceptar, rechazar y retar no mutan nada:
 * falta un `friendship-repository.ts` que envuelva las RPC
 * `send_friend_request` / `respond_to_friend_request`, que sí existen ya en el
 * esquema (`supabase/SCHEMA.md` §13).
 *
 * El buscador filtra en local sobre la lista cargada, que es lo correcto
 * mientras quepa entera en memoria; cuando venga paginada del servidor habrá
 * que mover el filtro allí.
 */
export default function FriendsScreen() {
  const [query, setQuery] = useState('');

  const needle = query.trim().toLowerCase();
  const visible = needle
    ? FRIENDS.filter((friend) => friend.username.toLowerCase().includes(needle))
    : FRIENDS;

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="title">FRIENDS</ThemedText>
            <Button label="Add friend" variant="secondary" />
          </View>

          <SearchField value={query} onChange={setQuery} />

          {FRIEND_REQUESTS.length > 0 ? (
            <>
              <View style={styles.sectionHead}>
                <ThemedText type="label" themeColor="textDim">
                  REQUESTS
                </ThemedText>
                <Chip label={String(FRIEND_REQUESTS.length)} tone="rival" />
              </View>

              {FRIEND_REQUESTS.map((request) => (
                <RequestRow key={request.username} request={request} />
              ))}
            </>
          ) : null}

          <ThemedText type="label" themeColor="textDim">
            {`ALL FRIENDS · ${FRIENDS.length}`}
          </ThemedText>

          {visible.length > 0 ? (
            visible.map((friend) => <FriendRow key={friend.username} friend={friend} />)
          ) : (
            <ThemedText type="small" themeColor="textDim" style={styles.empty}>
              No friends match that search.
            </ThemedText>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

/**
 * Buscador del diseño: bloque hundido con el campo dentro. No es un primitivo
 * porque de momento solo lo usa esta pantalla; si aparece en otra, sube a
 * `src/components/`.
 */
function SearchField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const theme = useTheme();

  return (
    <Card variant="sunken" style={styles.search}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search by username"
        placeholderTextColor={theme.textDim}
        autoCapitalize="none"
        autoCorrect={false}
        style={[Typography.small, { color: theme.text }]}
      />
    </Card>
  );
}

function RequestRow({ request }: { request: FriendRequest }) {
  return (
    <Card style={styles.row}>
      {/* Avatar (KAN-19). */}
      <Card variant="sunken" style={styles.avatar} />

      <View style={styles.rowBody}>
        <ThemedText type="bodyBold">{request.username}</ThemedText>
        <ThemedText type="caption" themeColor="textMuted">
          {`LV ${request.level}`}
        </ThemedText>
      </View>

      <Button label="Accept" />
      <Button label="Decline" variant="secondary" />
    </Card>
  );
}

function FriendRow({ friend }: { friend: Friend }) {
  return (
    <Card style={styles.row}>
      {/* Avatar (KAN-19). */}
      <Card variant={friend.inDuel ? 'rival' : 'sunken'} style={styles.avatar} />

      <View style={styles.rowBody}>
        <ThemedText type="bodyBold">{friend.username}</ThemedText>
        <ThemedText type="caption" themeColor="textMuted">
          {`LV ${friend.level} · 🔥 ${friend.streakDays} DAYS`}
        </ThemedText>
      </View>

      {/*
        Con un duelo en curso el diseño no ofrece retar: pinta el estado. Un
        botón que fallaría al pulsarlo es peor que no tenerlo.
      */}
      {friend.inDuel ? <Chip label="IN DUEL" tone="rival" /> : <Button label="Challenge" />}
    </Card>
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
    paddingBottom: Spacing.three + BottomTabInset,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  search: {
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, padding: 0 },
  rowBody: { flex: 1, gap: Spacing.one },
  empty: { textAlign: 'center', paddingVertical: Spacing.four },
});
