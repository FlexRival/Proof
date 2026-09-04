import type { Href } from 'expo-router';

/**
 * Contrato de rutas de la app: un sitio único que dice qué rutas existen, su
 * texto y si aparecen en la barra de navegación. `Href` viene de los tipos
 * generados por Expo Router (rutas tipadas) — si el archivo de la ruta no
 * existe, esto no compila.
 *
 * `NativeTabs` (la barra nativa, en `app-tabs.tsx`) no admite generar tabs
 * dinámicamente — cada `NativeTabs.Trigger` se escribe a mano — así que este
 * contrato no sustituye esos triggers, pero sí es de donde salen su texto y
 * su href. La barra web (`app-tabs.web.tsx`) sí puede recorrer `TAB_ROUTES`
 * con un `.map()`.
 */
export type RouteKey = 'home' | 'duels' | 'friends' | 'profile' | 'settings';

export type RouteDefinition = {
  key: RouteKey;
  href: Href;
  label: string;
  /** Si aparece en la barra de navegación. */
  tab: boolean;
};

export const ROUTES: Record<RouteKey, RouteDefinition> = {
  home: { key: 'home', href: '/', label: 'Home', tab: true },
  duels: { key: 'duels', href: '/duels', label: 'Duels', tab: true },
  friends: { key: 'friends', href: '/friends', label: 'Friends', tab: true },
  profile: { key: 'profile', href: '/profile', label: 'Profile', tab: true },
  /**
   * Existe como ruta (para que enlazar a ella desde cualquier pantalla esté
   * tipado) pero no tiene entrada en la barra de navegación todavía. La
   * pantalla en `src/app/settings.tsx` es un placeholder sin contenido real.
   */
  settings: { key: 'settings', href: '/settings', label: 'Settings', tab: false },
};

/** Solo las rutas de la barra de navegación, en el orden en que se pintan. */
export const TAB_ROUTES: RouteDefinition[] = Object.values(ROUTES).filter((route) => route.tab);
