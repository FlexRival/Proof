import { useSyncExternalStore } from 'react';
import { Appearance, useColorScheme as useRNColorScheme } from 'react-native';

/** react-native no exporta `ColorSchemeName`, así que se deriva de su hook. */
type ColorSchemeName = ReturnType<typeof useRNColorScheme>;

function subscribe(onStoreChange: () => void) {
  const subscription = Appearance.addChangeListener(onStoreChange);

  return () => subscription.remove();
}

function getSnapshot(): ColorSchemeName {
  return Appearance.getColorScheme() ?? 'unspecified';
}

/**
 * El render estático de web ocurre sin acceso a las preferencias del cliente,
 * así que parte de claro y `useSyncExternalStore` reconcilia al hidratar.
 */
function getServerSnapshot(): ColorSchemeName {
  return 'light';
}

export function useColorScheme(): ColorSchemeName {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
