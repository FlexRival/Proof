/**
 * Punto de entrada del sistema de diseño de ProofIt.
 *
 * Los componentes importan de aquí. La capa interna es `colors.ts`: rampas y
 * tokens semánticos, sin dependencias, para poder validarlo con Node.
 *
 * Guía de color: https://docs.expo.dev/guides/color-schemes/
 */

import '@/global.css';

import { Platform, type TextStyle, type ViewStyle } from 'react-native';

import { Palette } from '@/constants/colors';

export { Colors, Gradients, Palette, type ThemeColor } from '@/constants/colors';

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/**
 * Escala tipográfica. Solo métricas: el color lo pone el tema, para que una
 * misma variante sirva sobre cualquier superficie.
 *
 * `default`, `title`, `subtitle`, `small`, `smallBold`, `link` y `code`
 * conservan las métricas del scaffold de Expo para no alterar las pantallas de
 * demo que todavía las usan.
 */
export const Typography = {
  /** Cifra protagonista de la subida de nivel. */
  display: { fontSize: 56, lineHeight: 58, fontWeight: 800, letterSpacing: -1 },
  title: { fontSize: 48, lineHeight: 52, fontWeight: 600 },
  subtitle: { fontSize: 32, lineHeight: 44, fontWeight: 600 },
  heading: { fontSize: 24, lineHeight: 30, fontWeight: 700 },
  subheading: { fontSize: 20, lineHeight: 26, fontWeight: 600 },
  default: { fontSize: 16, lineHeight: 24, fontWeight: 500 },
  bodyBold: { fontSize: 16, lineHeight: 24, fontWeight: 700 },
  small: { fontSize: 14, lineHeight: 20, fontWeight: 500 },
  smallBold: { fontSize: 14, lineHeight: 20, fontWeight: 700 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: 600 },
  /** Rótulos cortos en mayúsculas: NIVEL, XP, RACHA. */
  label: { fontSize: 11, lineHeight: 14, fontWeight: 700, letterSpacing: 0.8 },
  /**
   * Contadores. `tabular-nums` fija el ancho de los dígitos para que los pasos
   * y el XP no bailen mientras se animan.
   */
  numeric: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: 700,
    fontVariant: ['tabular-nums'],
  },
  link: { fontSize: 14, lineHeight: 30, fontWeight: 500 },
  code: {
    fontSize: 12,
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof Typography;

export const Radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/**
 * Sombras. `shadow*` las aplica iOS y `elevation` Android, así que cada nivel
 * declara ambos.
 *
 * En oscuro las sombras casi no se leen: la jerarquía la lleva la pila
 * `surfaceSunken` → `background` → `surface` → `surfaceRaised`, y la sombra
 * solo la refuerza.
 */
export const Elevation = {
  low: {
    shadowColor: Palette.void,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  medium: {
    shadowColor: Palette.void,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  high: {
    shadowColor: Palette.void,
    shadowOpacity: 0.26,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
} as const satisfies Record<string, ViewStyle>;

/**
 * Tokens de animación para la barra de XP, la subida de nivel y el duelo.
 *
 * `easing` guarda los puntos de control de la bezier en crudo, no un objeto de
 * Reanimated, para que este archivo no dependa de la librería de animación.
 * En el componente: `Easing.bezier(...Motion.easing.standard)`.
 */
export const Motion = {
  duration: {
    fast: 150,
    base: 250,
    slow: 400,
    /** Celebraciones: subida de nivel, duelo ganado. */
    celebrate: 800,
  },
  easing: {
    standard: [0.2, 0, 0, 1],
    decelerate: [0, 0, 0, 1],
    accelerate: [0.3, 0, 1, 1],
  },
  spring: {
    snappy: { damping: 20, stiffness: 220, mass: 1 },
    gentle: { damping: 26, stiffness: 120, mass: 1 },
    /** Rebote para recompensas. Usar con moderación. */
    bouncy: { damping: 12, stiffness: 180, mass: 1 },
  },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
