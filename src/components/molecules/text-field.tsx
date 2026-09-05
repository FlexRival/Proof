import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Card } from '@/components/atoms/card';
import { ThemedText } from '@/components/atoms/themed-text';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Campo de texto genérico con label, para formularios reales (login, altas).
 * A diferencia de `SearchField` (atado a filtrar listas: placeholder fijo,
 * sin label), este pasa casi todas las props nativas de `TextInput` tal
 * cual — `secureTextEntry`, `keyboardType`, etc. funcionan sin envolverlas.
 */
export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
};

export function TextField({ label, ...rest }: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <ThemedText type="label" themeColor="textDim">
          {label}
        </ThemedText>
      ) : null}
      <Card variant="sunken" style={styles.field}>
        <TextInput
          placeholderTextColor={theme.textMuted}
          style={[Typography.small, { color: theme.text }]}
          {...rest}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.one },
  field: { paddingVertical: Spacing.two, borderRadius: Radius.md },
});
