import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/atoms/button';
import { ThemedText } from '@/components/atoms/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';

/**
 * Pantalla vacía del diseño: ilustración, titular, una línea de explicación y
 * la acción que la resuelve. Cubre el home sin duelos y la lista sin amigos.
 *
 * Las dos maquetas comparten estructura y solo cambian la ilustración y el
 * copy, así que la ilustración entra por `children` en vez de intentar cubrir
 * los dos casos con props.
 *
 * El vacío no es un error: no lleva tono de aviso ni Rival. Es el estado
 * normal de una cuenta recién hecha, y lo que pide es dar el primer paso.
 */
export type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel: string;
  onAction?: () => void;
  /** Línea de apoyo bajo el botón. Solo la lleva el vacío de amigos. */
  note?: string;
  /** Ilustración: el personaje inactivo, o el duelo contra nadie. */
  children?: ReactNode;
};

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  note,
  children,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {children}

      <View style={styles.copy}>
        <ThemedText type="subtitle" style={styles.centered}>
          {title}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted" style={styles.centered}>
          {message}
        </ThemedText>
      </View>

      <Button label={actionLabel} onPress={onAction} style={styles.action} />

      {note ? (
        <ThemedText type="caption" themeColor="textDim" style={styles.centered}>
          {note}
        </ThemedText>
      ) : null}
    </View>
  );
}

/**
 * Ancho del botón en las maquetas: no ocupa todo el ancho como en el resto de
 * pantallas, va centrado y más estrecho para que el bloque respire.
 */
const ACTION_WIDTH = MaxContentWidth / 2;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.four,
    paddingVertical: Spacing.five,
  },
  copy: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  centered: { textAlign: 'center' },
  action: {
    width: '100%',
    maxWidth: ACTION_WIDTH,
  },
});
