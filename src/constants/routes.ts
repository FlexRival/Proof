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
export type RouteKey =
  | 'home'
  | 'duels'
  | 'friends'
  | 'profile'
  | 'settings'
  | 'levelUp'
  | 'victory'
  | 'newDuel'
  | 'friendProfile'
  | 'customizeCharacter';

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
  /**
   * Celebración, no destino: se abre con los niveles en la URL
   * (`/level-up?from=11&to=12`) cuando un duelo hace subir de nivel, y se
   * cierra volviendo atrás. Nunca va en la barra de navegación — el `href`
   * de aquí es la ruta pelada, sin parámetros, y quien la abre los añade.
   */
  levelUp: { key: 'levelUp', href: '/level-up', label: 'Level up', tab: false },
  /**
   * La otra celebración: el resultado de un duelo ganado. Mismo trato que
   * `levelUp` — se abre con el resultado en la URL
   * (`/victory?opponent=@alexruiz&steps=8742&days=3`) y se cierra volviendo
   * atrás. El `href` de aquí es la ruta pelada; quien la abre pone lo demás.
   */
  victory: { key: 'victory', href: '/victory', label: 'Victory', tab: false },
  /**
   * Asistente de crear duelo. Tampoco es destino de la barra: se abre desde el
   * atajo de la pantalla principal (`/new-duel`) o desde el botón de retar de
   * una fila de amigos, que trae el rival ya elegido
   * (`/new-duel?opponent=@alexruiz`). El `href` de aquí es la ruta pelada.
   */
  newDuel: { key: 'newDuel', href: '/new-duel', label: 'New duel', tab: false },
  /**
   * Perfil de otro jugador. Se abre desde una fila de la lista de amigos con
   * el usuario en la URL (`/friend-profile?username=@alexruiz`); el `href` de
   * aquí es la ruta pelada, y quien la abre pone el parámetro.
   */
  friendProfile: {
    key: 'friendProfile',
    href: '/friend-profile',
    label: 'Friend profile',
    tab: false,
  },
  /**
   * Personalización del personaje, abierta desde el botón "Customize
   * character" del Perfil. Destino, no tarea: se apila y se vuelve con el
   * botón de atrás, como `settings`/`friendProfile`.
   */
  customizeCharacter: {
    key: 'customizeCharacter',
    href: '/customize-character',
    label: 'Customize character',
    tab: false,
  },
};

/** Solo las rutas de la barra de navegación, en el orden en que se pintan. */
export const TAB_ROUTES: RouteDefinition[] = Object.values(ROUTES).filter((route) => route.tab);
