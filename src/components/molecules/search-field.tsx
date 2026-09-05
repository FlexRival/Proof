import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Card } from '@/components/atoms/card';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Buscador del diseño: bloque hundido con el campo dentro, sin icono ni botón
 * de limpiar. Aparece igual en la lista de amigos y en el primer paso de crear
 * un duelo.
 *
 * Controlado a propósito: quien lo usa filtra su propia lista, así el mismo
 * campo sirve para filtrar en local ahora y para lanzar una búsqueda al
 * servidor cuando las listas vengan paginadas.
 */
export type SearchFieldProps = Omit<
  TextInputProps,
  'value' | 'onChange' | 'onChangeText' | 'style'
> & {
  value: string;
  onChange: (next: string) => void;
};

export function SearchField({
  value,
  onChange,
  placeholder = 'Search by username',
  ...rest
}: SearchFieldProps) {
  const theme = useTheme();

  return (
    <Card variant="sunken" style={styles.field}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textDim}
        autoCapitalize="none"
        autoCorrect={false}
        style={[Typography.small, { color: theme.text }]}
        {...rest}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  field: {
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
});
