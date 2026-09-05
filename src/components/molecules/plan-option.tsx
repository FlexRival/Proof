import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/atoms/card';
import { ThemedText } from '@/components/atoms/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Una fila elegible del paywall: nombre del plan, su precio y, si ahorra algo,
 * la línea que lo dice.
 *
 * Es un radio, no un conmutador: solo puede haber un plan marcado, así que
 * quien la usa lleva el estado y esta fila solo avisa de la pulsación. El
 * `accessibilityRole="radio"` va con eso — un lector de pantalla anuncia
 * «seleccionado» en vez de leer dos botones sueltos.
 *
 * La maqueta marca el plan elegido con relleno azul; aquí lo marca el contorno
 * Power, que es como esta app señala lo destacado y seleccionado
 * (`primaryEdgeStrong`, el token que el sistema de diseño reserva justo para
 * "card destacada + seleccionada").
 */
export type PlanOptionProps = {
  name: string;
  /** Precio principal, ya formateado: `$9.99/mo`. */
  price: string;
  /** Segunda línea opcional: el ahorro del plan anual. */
  note?: string;
  selected: boolean;
  onPress: () => void;
};

const MARKER_SIZE = 22;

export function PlanOption({ name, price, note, selected, onPress }: PlanOptionProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={note ? `${name}, ${price}, ${note}` : `${name}, ${price}`}
      onPress={onPress}>
      <Card
        variant={selected ? 'highlight' : 'default'}
        style={selected ? { borderColor: theme.primaryEdgeStrong } : undefined}>
        <View style={styles.row}>
          <View style={styles.text}>
            <ThemedText type="bodyBold" themeColor={selected ? 'primary' : 'text'}>
              {name}
            </ThemedText>
            {note ? (
              <ThemedText type="caption" themeColor="textSecondary">
                {note}
              </ThemedText>
            ) : null}
          </View>

          <ThemedText type="smallBold">{price}</ThemedText>

          <Marker selected={selected} />
        </View>
      </Card>
    </Pressable>
  );
}

/**
 * El círculo de la derecha. Relleno Power con una marca cuando va elegido,
 * contorno vacío cuando no.
 *
 * La marca es el carácter `✓` y no un icono: la app no tiene todavía ninguna
 * librería de iconos, y meter una entera por una palomita no compensa.
 */
function Marker({ selected }: { selected: boolean }) {
  const theme = useTheme();

  if (!selected) {
    return <View style={[styles.marker, { borderColor: theme.borderStrong, borderWidth: 1 }]} />;
  }

  return (
    <View style={[styles.marker, { backgroundColor: theme.primary }]}>
      <ThemedText type="caption" themeColor="onPrimary">
        ✓
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
