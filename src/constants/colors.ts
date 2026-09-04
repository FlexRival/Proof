/**
 * Capa de color del sistema de diseño de ProofIt. Ver `docs/design.md` para
 * la referencia legible de cada token — este archivo es lo que corre, ese
 * documento es lo que se lee.
 *
 * Este archivo no importa nada a propósito: `scripts/check-contrast.mjs` lo
 * carga directamente con Node para verificar cada par texto/fondo contra WCAG
 * 2.1. Si le añades un import de `react-native` o del alias `@/`, rompes esa
 * comprobación.
 *
 * Al editar un valor, ejecuta `pnpm check:contrast` y actualiza
 * `docs/design.md` en el mismo cambio.
 */

/**
 * Valores en bruto tal cual los define `docs/design.md`. Único sitio del
 * proyecto donde vive un literal de color.
 *
 * Prefiere los tokens semánticos de `Colors` en los componentes. Baja aquí
 * solo para paradas de degradado (`Gradients`) o para config nativa que no
 * puede importar TypeScript (`app.json`).
 */
export const Palette = {
  // Superficies: pila de elevación, de más hundida a más elevada.
  void: '#05060A',
  frame: '#08090C',
  surface: '#101219',
  card: '#13151C',
  raised: '#1B1E27',
  dock: 'rgba(17, 19, 26, 0.94)',
  locked: '#0E1017',

  // Power: el jugador, XP, acción primaria, tab activa.
  power: '#C6FF4A',
  /**
   * El diseño original trae dos claros de marca (#E4FF95 y #E2FF8E) sin
   * distinguir cuándo usar cada uno. `powerBright` es el que se usa por
   * defecto; `powerBrightAlt` queda disponible sin token semántico hasta que
   * se aclare su contexto. Ver docs/design.md § huecos.
   */
  powerBright: '#E4FF95',
  powerBrightAlt: '#E2FF8E',
  powerDeep: '#B4F02E',
  powerMid: '#8CE03C',
  powerFlash: '#EEFFB8',
  onPower: '#0A0C05',

  // Rival: el oponente, derrotas, avisos.
  rival: '#FF5C38',

  // Texto.
  text: '#F1F2F6',
  textSoft: '#B7BCC8',
  /**
   * El diseño original daba #767C8C: 3.99–4.48:1 sobre las superficies
   * oscuras, por debajo del mínimo de 4.5:1 de WCAG AA. Aclarado al mínimo
   * necesario para pasarlo (4.52–5.08:1); ver `pnpm check:contrast`.
   */
  textMuted: '#808594',
  /** De-enfatizado a propósito: labels de sección, contenido bloqueado. */
  textDim: '#4E545F',
  navIdle: '#8A90A0',

  // Bordes y contornos. Todos translúcidos.
  hairline: 'rgba(255, 255, 255, 0.07)',
  hairlineStrong: 'rgba(255, 255, 255, 0.14)',
  powerEdge: 'rgba(198, 255, 74, 0.24)',
  powerEdgeStrong: 'rgba(198, 255, 74, 0.40)',
  rivalEdge: 'rgba(255, 92, 56, 0.24)',

  /**
   * Rellenos teñidos. Medidos sobre la lámina de componentes del diseño: un
   * chip no va sobre `card` a pelo, lleva encima una capa de marca al 12 %
   * (o de blanco al 5 % si es neutro). Sobre `card` dan `#293122`,
   * `#301D20` y `#1F2128`, que es justo lo que hay medido en el diseño.
   */
  powerTint: 'rgba(198, 255, 74, 0.12)',
  rivalTint: 'rgba(255, 92, 56, 0.12)',
  neutralTint: 'rgba(255, 255, 255, 0.05)',

  /**
   * Velo de modal. No está en la paleta original; deriva de `void` con el
   * mismo patrón (negro casi puro + alfa) que ya usaba la app.
   */
  scrim: 'rgba(5, 6, 10, 0.72)',
} as const;

/**
 * Paradas de degradado. Un degradado es un array, no un color único, así que
 * no encaja como token de `Colors` — se pasa tal cual a un componente de
 * degradado (p. ej. `expo-linear-gradient`).
 */
export const Gradients = {
  /** Botón primario y elementos de marca. */
  power: [Palette.powerDeep, Palette.powerBright],
  /**
   * Relleno de la barra de XP. Medido en el diseño (#8DE03C → #C3FE49 a lo
   * ancho de la barra): arranca en Power Mid y termina en Power, no en Power
   * Bright.
   */
  xp: [Palette.powerMid, Palette.power],
} as const;

/**
 * Tokens semánticos. Un componente pide `surface`, nunca `Palette.card`,
 * para que la dirección visual cambie sin tocar los componentes.
 *
 * ProofIt es de tema único, oscuro — no hay `Colors.light`. Se conserva la
 * clave `dark` para no romper `Object.entries(Colors)` en
 * `check-contrast.mjs` y para que añadir un tema claro en el futuro sea
 * sumar una clave, no rediseñar el tipo `ThemeColor`.
 */
export const Colors = {
  dark: {
    text: Palette.text,
    textSecondary: Palette.textSoft,
    textMuted: Palette.textMuted,
    /** Labels de sección y contenido bloqueado. Contraste bajo a propósito. */
    textDim: Palette.textDim,
    /** Pestaña inactiva de la barra de navegación. */
    navIdle: Palette.navIdle,

    background: Palette.frame,
    surface: Palette.card,
    surfaceRaised: Palette.raised,
    surfaceSunken: Palette.surface,
    /** Fondo de slot bloqueado (logro/ítem sin desbloquear). */
    locked: Palette.locked,
    /** Relleno de chip de marca (`LV 12`). */
    primarySurface: Palette.powerTint,
    /** Relleno de chip de rival (racha). */
    rivalSurface: Palette.rivalTint,
    /** Relleno de chip neutro (`● Online`). */
    neutralSurface: Palette.neutralTint,
    /** Barra de navegación inferior. */
    dock: Palette.dock,

    border: Palette.hairline,
    /** Borde de botón secundario. */
    borderStrong: Palette.hairlineStrong,
    /** Borde de card destacada. */
    primaryEdge: Palette.powerEdge,
    /** Borde de card destacada + seleccionada. */
    primaryEdgeStrong: Palette.powerEdgeStrong,
    /** Borde de card de rival. */
    rivalEdge: Palette.rivalEdge,

    primary: Palette.power,
    primarySolid: Palette.powerDeep,
    onPrimary: Palette.onPower,

    /** Texto y cifras de XP. */
    xp: Palette.power,
    /** Relleno (inicio) de la barra de XP. */
    xpSolid: Palette.powerMid,
    onXp: Palette.onPower,
    /**
     * Pista de la barra de XP. Medida en el diseño como blanco al 7 % sobre
     * la superficie, no como un gris opaco: mismo valor que `border`.
     */
    xpTrack: Palette.hairline,

    /**
     * Racha. Medido en el diseño: el chip `🔥 9` va con relleno y texto
     * Rival, no Power como se supuso antes de tener las capturas.
     */
    streak: Palette.rival,
    /** Sin color propio: mismo caso que streak. */
    victory: Palette.power,
    defeat: Palette.rival,
    /** Sin color propio: gris neutro de texto en vez de un tono de marca nuevo. */
    info: Palette.textMuted,

    overlay: Palette.scrim,

    // Heredados del scaffold de Expo, hoy con uso real: fondo/selección de
    // los botones de la barra de tabs (`app-tabs.tsx`, `app-tabs.web.tsx`).
    backgroundElement: Palette.surface,
    backgroundSelected: Palette.raised,
  },
} as const;

export type ThemeColor = keyof typeof Colors.dark;
