import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { FONT_ASSETS } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

/**
 * Layout raíz: un `Stack` con el grupo de pestañas dentro.
 *
 * El `Stack` no es decorativo. Antes la app era solo un navegador de
 * pestañas, y un navegador de pestañas únicamente registra las rutas que
 * tienen trigger: `/settings` existía como archivo pero abrirla pintaba la
 * pantalla principal. Todo lo que no es pestaña —ajustes, la subida de
 * nivel— necesita esta capa para poder abrirse encima de las pestañas y
 * poder cerrarse volviendo atrás.
 */
export default function RootLayout() {
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

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        {/*
          La subida de nivel se presenta como modal: tapa las pestañas
          mientras dura la celebración y su «Continue» es un `back` que
          devuelve exactamente a donde estabas.
        */}
        <Stack.Screen name="level-up" options={{ presentation: 'modal' }} />
        <Stack.Screen name="victory" options={{ presentation: 'modal' }} />
        {/*
          Crear un duelo también es modal: es una tarea con principio y fin
          que se abre encima de donde estabas y te devuelve ahí al cerrarse.
          Sus tres pasos viven dentro de esta única pantalla.
        */}
        <Stack.Screen name="new-duel" options={{ presentation: 'modal' }} />
        {/*
          El perfil de un amigo sí es un destino, no una tarea: se apila sobre
          la lista de amigos y se vuelve con el botón de atrás, como ajustes.
        */}
        <Stack.Screen name="friend-profile" />
      </Stack>
    </ThemeProvider>
  );
}
