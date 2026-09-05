import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/button';
import { Card } from '@/components/atoms/card';
import { CharacterAvatar } from '@/components/molecules/character-avatar';
import { Notice } from '@/components/molecules/notice';
import { SegmentedControl, type SegmentedOption } from '@/components/molecules/segmented-control';
import { ThemedText } from '@/components/atoms/themed-text';
import { ThemedView } from '@/components/atoms/themed-view';
import { ROUTES } from '@/constants/routes';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useCharacterCustomization } from '@/hooks/use-cosmetics';
import { isCosmeticUnlocked } from '@/lib/cosmetics';
import type { CosmeticItem, CosmeticSlot } from '@/repositories';

const SLOT_OPTIONS: SegmentedOption<CosmeticSlot>[] = [
  { value: 'SKIN', label: 'Skin' },
  { value: 'HAIR', label: 'Hair' },
  { value: 'OUTFIT', label: 'Outfit' },
  { value: 'HEADWEAR', label: 'Head' },
  { value: 'ACCESSORY', label: 'Extra' },
];

/**
 * Personalización del personaje (KAN-19 + botón de `profile.tsx`, hoy
 * deshabilitado). Requiere sesión real: a diferencia del resto de pantallas
 * de la app (todavía en `PROFILE_DEMO`/`HOME_DEMO`), esta pasa por
 * `cosmeticsRepository`/`profileRepository` de verdad desde el primer día,
 * porque equipar algo es una mutación real contra `equip_cosmetic` (ver
 * `supabase/SCHEMA.md` §14) — no tiene sentido fingirla contra datos de
 * prueba.
 */
export default function CustomizeCharacterScreen() {
  const { state, equip, unequip } = useCharacterCustomization();
  const [slot, setSlot] = useState<CosmeticSlot>('SKIN');
  const [actionError, setActionError] = useState<string | null>(null);

  const handlePress = useCallback(
    async (item: CosmeticItem, isEquipped: boolean) => {
      setActionError(null);
      try {
        if (isEquipped) {
          await unequip(item.slot);
        } else {
          await equip(item.id);
        }
      } catch (error) {
        setActionError(error instanceof Error ? error.message : 'No se pudo actualizar.');
      }
    },
    [equip, unequip],
  );

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Button label="Back" variant="secondary" onPress={goBack} />
            <ThemedText type="subheading">CUSTOMIZE</ThemedText>
            <View style={styles.headerSpacer} />
          </View>

          {state.status === 'loading' && (
            <ThemedText type="small" themeColor="textMuted">
              Loading your character…
            </ThemedText>
          )}

          {state.status === 'signedOut' && (
            <Notice tone="info" message="Sign in to customize your character." />
          )}

          {state.status === 'error' && <Notice tone="rival" message={state.message} />}

          {state.status === 'ready' && (
            <>
              <CharacterAvatar
                equipped={state.data.equipped}
                size={200}
                style={styles.preview}
              />

              {actionError ? <Notice tone="rival" message={actionError} /> : null}

              <SegmentedControl options={SLOT_OPTIONS} value={slot} onChange={setSlot} />

              <View style={styles.grid}>
                {state.data.catalog
                  .filter((item) => item.slot === slot)
                  .map((item) => {
                    const unlocked = isCosmeticUnlocked(
                      item,
                      state.data.unlockedItemIds,
                      state.data.isPro,
                    );
                    const isEquipped = state.data.equipped[slot] === item.id;

                    return (
                      <CosmeticTile
                        key={item.id}
                        item={item}
                        unlocked={unlocked}
                        equipped={isEquipped}
                        onPress={() => handlePress(item, isEquipped)}
                      />
                    );
                  })}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

/** Vuelve por donde se vino; si no hay historial, al perfil. */
function goBack() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(ROUTES.profile.href);
}

type CosmeticTileProps = {
  item: CosmeticItem;
  unlocked: boolean;
  equipped: boolean;
  onPress: () => void;
};

function CosmeticTile({ item, unlocked, equipped, onPress }: CosmeticTileProps) {
  const variant = equipped ? 'highlight' : unlocked ? 'default' : 'locked';

  return (
    <Pressable disabled={!unlocked} onPress={onPress} style={styles.tileWrapper}>
      <Card variant={variant} style={styles.tile}>
        <ThemedText type="small" themeColor={unlocked ? 'text' : 'textDim'} numberOfLines={2}>
          {item.name}
        </ThemedText>
        {!unlocked && (
          <ThemedText type="caption" themeColor="textMuted">
            {item.unlockType === 'PRO' ? 'PRO' : `LV ${item.unlockLevel}`}
          </ThemedText>
        )}
      </Card>
    </Pressable>
  );
}

const TILE_MIN_WIDTH = 104;

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
  preview: { alignSelf: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tileWrapper: { flexGrow: 1, minWidth: TILE_MIN_WIDTH },
  tile: {
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: 64,
    justifyContent: 'center',
  },
});
