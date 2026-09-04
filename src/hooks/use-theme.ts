import { Colors } from '@/constants/theme';

/**
 * Sigue siendo un hook (no una constante) para que `ThemedText`/`ThemedView`
 * no cambien si algún día vuelve un tema claro y esto pasa a leer
 * `useColorScheme()` otra vez.
 */
export function useTheme() {
  return Colors.dark;
}
