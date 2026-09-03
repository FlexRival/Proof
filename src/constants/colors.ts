/**
 * Capa de color del sistema de diseño de ProofIt.
 *
 * Este archivo no importa nada a propósito: `scripts/check-contrast.mjs` lo
 * carga directamente con Node para verificar cada par texto/fondo contra WCAG
 * 2.1. Si le añades un import de `react-native` o del alias `@/`, rompes esa
 * comprobación.
 *
 * Al editar un hexadecimal, ejecuta `pnpm check:contrast`.
 */

/**
 * Rampas en bruto. Único sitio del proyecto donde vive un hexadecimal literal.
 *
 * Los pasos intermedios (`ink150`, `ink450`, `ink550`, `ink750`, `gold700`,
 * `ember700`, `emerald700`, `mana700`) existen porque un par texto/fondo
 * concreto no alcanzaba el mínimo de contraste sin ellos, no por simetría de la
 * rampa. No los redondees a valores "más limpios" sin volver a pasar la
 * comprobación.
 *
 * Prefiere los tokens semánticos de `Colors` en los componentes. Alcanza aquí
 * solo cuando necesites paradas de un degradado o un brillo, que no tienen
 * token semántico.
 */
export const Palette = {
  // Neutros con tinte índigo: superficies, texto y bordes.
  ink50: '#F6F7FB',
  ink100: '#ECEEF6',
  ink150: '#E3E7F1',
  ink200: '#D9DDEB',
  ink300: '#B4BACF',
  ink400: '#8A91AC',
  ink450: '#767D9A',
  ink500: '#646B87',
  ink550: '#5A6178',
  ink600: '#474D65',
  ink700: '#2F3448',
  ink750: '#232839',
  ink800: '#1E2233',
  ink900: '#141726',
  ink950: '#0B0D18',

  // Amatista: color de marca. Acciones primarias y estado seleccionado.
  amethyst100: '#F0E9FD',
  amethyst200: '#DDD0FB',
  amethyst300: '#C0A8F7',
  amethyst400: '#A17DF0',
  amethyst500: '#8558E4',
  amethyst600: '#6B3FC9',
  amethyst700: '#54309F',
  amethyst900: '#241C3D',

  // Oro: experiencia y nivel.
  gold200: '#FBEBB8',
  gold300: '#F6D77A',
  gold400: '#EFBE3C',
  gold500: '#DDA119',
  gold600: '#B57D0E',
  gold700: '#8A5E06',

  // Ascua: rachas y clase Vanguardia.
  ember300: '#FCB08A',
  ember400: '#F8834E',
  ember500: '#EA5F22',
  ember600: '#C24714',
  ember700: '#AB3E11',

  // Esmeralda: duelo ganado y clase Explorador.
  emerald300: '#7DE0AE',
  emerald400: '#3CC98A',
  emerald500: '#1BA96C',
  emerald600: '#118455',
  emerald700: '#0E7049',

  // Carmesí: duelo perdido y acciones destructivas.
  crimson300: '#F9A3A3',
  crimson400: '#F26D6D',
  crimson500: '#DE3F3F',
  crimson600: '#B62C2C',

  // Maná: información y clase Arcanista.
  mana300: '#8FD8F5',
  mana400: '#4FC3F0',
  mana500: '#22A7DC',
  mana600: '#1785B4',
  mana700: '#126A8F',

  white: '#FFFFFF',

  // Velos de modal. Llevan alfa, así que no encajan en ninguna rampa.
  scrimDark: 'rgba(11, 13, 24, 0.72)',
  scrimLight: 'rgba(20, 23, 38, 0.48)',
} as const;

/**
 * Tokens semánticos por esquema de color. Un componente pide `surface`, nunca
 * `ink800`, para que la dirección visual cambie sin tocar los componentes.
 *
 * Las cuatro superficies son una pila de elevación por rol, de hundido a
 * elevado: `surfaceSunken` (pozos: carril de XP, campos) → `background`
 * (lienzo de la app) → `surface` (tarjeta) → `surfaceRaised` (modal o chip
 * sobre tarjeta).
 *
 * El rol es común a los dos esquemas, pero la luminancia va al revés: en
 * oscuro elevar aclara, y en claro elevar oscurece un poco, porque el blanco
 * del lienzo ya es el techo. Todo token de texto cumple 4.5:1 sobre las
 * cuatro en ambos esquemas.
 */
export const Colors = {
  light: {
    text: Palette.ink900,
    textSecondary: Palette.ink600,
    textMuted: Palette.ink550,

    background: Palette.white,
    surface: Palette.ink50,
    surfaceRaised: Palette.ink100,
    surfaceSunken: Palette.ink150,

    border: Palette.ink200,
    /** Contorno de control interactivo. Cumple el 3:1 de WCAG 1.4.11. */
    borderStrong: Palette.ink450,

    primary: Palette.amethyst600,
    primarySolid: Palette.amethyst600,
    onPrimary: Palette.white,
    primarySurface: Palette.amethyst100,

    /** Texto y cifras de XP. */
    xp: Palette.gold700,
    /** Relleno de la barra de XP. Igual en ambos esquemas: es la marca de XP. */
    xpSolid: Palette.gold400,
    onXp: Palette.ink950,
    /**
     * Carril oscuro incluso en esquema claro. Con un carril claro el oro de XP
     * se queda en 1.4:1 contra su propio relleno y la barra desaparece; la
     * alternativa era oscurecer el oro y perder el mismo oro en ambos esquemas.
     */
    xpTrack: Palette.ink600,

    streak: Palette.ember700,
    victory: Palette.emerald700,
    defeat: Palette.crimson600,
    /** También cubre el duelo pendiente de aceptar. */
    info: Palette.mana700,

    overlay: Palette.scrimLight,


    // Heredados del scaffold de Expo. Los consumen los componentes de demo.
    backgroundElement: Palette.ink100,
    backgroundSelected: Palette.ink200,
  },
  dark: {
    text: Palette.ink50,
    textSecondary: Palette.ink300,
    textMuted: Palette.ink400,

    background: Palette.ink900,
    surface: Palette.ink800,
    surfaceRaised: Palette.ink750,
    surfaceSunken: Palette.ink950,

    border: Palette.ink700,
    borderStrong: Palette.ink450,

    primary: Palette.amethyst300,
    primarySolid: Palette.amethyst600,
    onPrimary: Palette.white,
    primarySurface: Palette.amethyst900,

    xp: Palette.gold300,
    xpSolid: Palette.gold400,
    onXp: Palette.ink950,
    xpTrack: Palette.ink950,

    streak: Palette.ember300,
    victory: Palette.emerald300,
    defeat: Palette.crimson300,
    info: Palette.mana300,

    overlay: Palette.scrimDark,


    backgroundElement: Palette.ink800,
    backgroundSelected: Palette.ink700,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
