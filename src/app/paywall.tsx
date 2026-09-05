import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/atoms/button';
import { ThemedText } from '@/components/atoms/themed-text';
import { ThemedView } from '@/components/atoms/themed-view';
import { Notice } from '@/components/molecules/notice';
import { PlanOption } from '@/components/molecules/plan-option';
import { ROUTES } from '@/constants/routes';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPrice } from '@/lib/format';
import {
  DEFAULT_PLAN_ID,
  PLANS,
  pricePerMonth,
  savingsPercent,
  type Plan,
  type PlanId,
} from '@/lib/paywall';

/**
 * Paywall de Pro. Sigue la estructura de la maqueta — cerrar y restaurar
 * arriba, titular, tres ventajas, prueba social, los dos planes, la llamada a
 * la acción y la letra pequeña — vestida con el sistema de diseño de ProofIt:
 * oscuro, Chakra Petch en cifras y títulos, y contorno Power donde la maqueta
 * pintaba relleno azul.
 *
 * **La copy de las ventajas es la de la plantilla, no de ProofIt** — «But
 * without the ads» habla de una publicidad que esta app no tiene. Se deja
 * literal a propósito: `CLAUDE.md` sigue con la monetización «por definir»
 * (KAN-25), y el sistema de diseño prohíbe inventarse contenido. En cuanto se
 * decida qué separa Pro de gratis, lo que se cambia es `BENEFITS`.
 *
 * **Comprar todavía no compra.** `react-native-purchases` no está instalado
 * (KAN-9), así que el botón lo dice en vez de no hacer nada en silencio.
 */
const BENEFITS = [
  'Full access to the product',
  'But without the ads',
  'So you can focus on what matters',
];

const TESTIMONIAL = {
  stars: '★★★★★',
  quote:
    '"This app has saved me so much time and effort. I\'m a big fan, and will keep coming back to it."',
  author: '- Joan A',
};

/** El plan contra el que se mide el ahorro de los demás: el primero. */
const BASELINE_PLAN = PLANS[0];

export default function PaywallScreen() {
  const [selectedId, setSelectedId] = useState<PlanId>(DEFAULT_PLAN_ID);
  const [purchaseAttempted, setPurchaseAttempted] = useState(false);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={dismiss}>
              <ThemedText type="subheading">✕</ThemedText>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setPurchaseAttempted(true)}>
              <ThemedText type="smallBold" themeColor="primary">
                Restore
              </ThemedText>
            </Pressable>
          </View>

          <ThemedText type="subtitle">Unlock Unlimited Access</ThemedText>

          <View style={styles.benefits}>
            {BENEFITS.map((benefit) => (
              <Benefit key={benefit} label={benefit} />
            ))}
          </View>

          <View style={styles.testimonial}>
            <ThemedText type="small" themeColor="primary">
              {TESTIMONIAL.stars}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.centered}>
              {TESTIMONIAL.quote}
            </ThemedText>
            <ThemedText type="caption" themeColor="textMuted">
              {TESTIMONIAL.author}
            </ThemedText>
          </View>

          <View style={styles.plans}>
            {PLANS.map((plan) => (
              <PlanOption
                key={plan.id}
                name={plan.name}
                price={priceLabel(plan)}
                note={savingsLabel(plan)}
                selected={plan.id === selectedId}
                onPress={() => setSelectedId(plan.id)}
              />
            ))}
          </View>

          <View style={styles.action}>
            <Button label="Try Free and Subscribe" onPress={() => setPurchaseAttempted(true)} />
            <ThemedText type="caption" themeColor="textMuted" style={styles.centered}>
              Cancel anytime
            </ThemedText>
          </View>

          {purchaseAttempted ? (
            <Notice tone="info" message="Purchases aren't wired up yet — RevenueCat is pending." />
          ) : null}

          <View style={styles.legal}>
            <LegalLink label="Restore Purchases" />
            <LegalLink label="Terms" />
            <LegalLink label="Privacy" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

/** `$9.99/mo` para el mensual, `$69.99/yr ($5.83/mo)` para el anual. */
function priceLabel(plan: Plan): string {
  if (plan.months === 1) {
    return `${formatPrice(plan.price)}/mo`;
  }

  return `${formatPrice(plan.price)}/yr (${formatPrice(pricePerMonth(plan))}/mo)`;
}

/**
 * `Save 42% (only $5.83/mo)`, o nada para el plan de referencia.
 *
 * El porcentaje sale de los dos precios, no escrito a mano: así no puede
 * acabar prometiendo un descuento que las cifras de al lado desmienten.
 */
function savingsLabel(plan: Plan): string | undefined {
  const saved = savingsPercent(plan, BASELINE_PLAN);
  if (saved === 0) return undefined;

  return `Save ${saved}% (only ${formatPrice(pricePerMonth(plan))}/mo)`;
}

/** Una ventaja: punto Power y la frase. */
function Benefit({ label }: { label: string }) {
  const theme = useTheme();

  return (
    <View style={styles.benefit}>
      <View style={[styles.bullet, { backgroundColor: theme.primary }]} />
      <ThemedText type="small">{label}</ThemedText>
    </View>
  );
}

/**
 * Letra pequeña del pie. Sin destino todavía: los términos y la privacidad no
 * existen como página, y restaurar compras necesita el SDK de RevenueCat
 * (KAN-9). Se pintan porque las tiendas los exigen en la pantalla de pago.
 */
function LegalLink({ label }: { label: string }) {
  return (
    <ThemedText type="link" themeColor="textDim">
      {label}
    </ThemedText>
  );
}

/** Vuelve por donde se vino; si no hay historial, a la pantalla principal. */
function dismiss() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(ROUTES.home.href);
}

const BULLET_SIZE = 6;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  benefits: {
    gap: Spacing.three,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  bullet: {
    width: BULLET_SIZE,
    height: BULLET_SIZE,
    borderRadius: Radius.pill,
  },
  testimonial: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  centered: {
    textAlign: 'center',
  },
  plans: {
    gap: Spacing.two,
  },
  action: {
    gap: Spacing.two,
  },
  legal: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.four,
  },
});
