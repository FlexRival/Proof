import { useFonts } from 'expo-font';
import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { FONT_ASSETS } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);

  // El splash nativo sigue en pantalla (`preventAutoHideAsync`), así que no
  // pintar nada aquí no deja un hueco en blanco: lo tapa el splash. Si
  // pintáramos antes, el primer frame saldría con la fuente del sistema y
  // saltaría de golpe al entrar Chakra Petch.
  if (!fontsLoaded && !fontError) return null;

  // Un fallo de carga no bloquea la app: preferimos las pantallas con la
  // fuente del sistema antes que un negro permanente. Se avisa por consola
  // porque si no el fallo es visible pero silencioso.
  if (fontError) {
    console.warn('[fonts] no se pudieron cargar las fuentes de marca:', fontError.message);
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
