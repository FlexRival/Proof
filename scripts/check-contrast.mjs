/**
 * Verifica los tokens de color de ProofIt contra los mínimos de contraste de
 * WCAG 2.1. Se ejecuta con `pnpm check:contrast`.
 *
 * Carga `src/constants/colors.ts` directamente: Node le quita los tipos, y por
 * eso ese archivo no puede tener imports.
 *
 * Cada token de `Colors` tiene que estar clasificado en una de las listas de
 * abajo. Si añades uno y no lo clasificas, la comprobación falla a propósito:
 * un token de color sin garantía de contraste no debería llegar a una pantalla.
 */

import { Colors } from '../src/constants/colors.ts';

const MIN_TEXT = 4.5; // WCAG 1.4.3, texto normal
const MIN_NON_TEXT = 3; // WCAG 1.4.11, componentes de interfaz

/** Superficies principales: todo token de texto debe leerse sobre las cuatro. */
const MAIN_SURFACES = ['background', 'surface', 'surfaceRaised', 'surfaceSunken'];

/** Tokens de texto e iconografía. */
const TEXT_TOKENS = [
  'text',
  'textSecondary',
  'textMuted',
  'primary',
  'xp',
  'streak',
  'victory',
  'defeat',
  'info',
];

/** Superficies de cromo heredadas del scaffold, solo con texto a plena fuerza. */
const CHROME_SURFACES = ['backgroundElement', 'backgroundSelected'];
const CHROME_TEXT = ['text', 'textSecondary'];

/** Superficie teñida de marca y los únicos textos que admite. */
const TINTED = { surface: 'primarySurface', text: ['text', 'primary'] };

/** Texto sobre relleno sólido. */
const SOLID_PAIRS = [
  ['onPrimary', 'primarySolid'],
  ['onXp', 'xpSolid'],
];

/** Pares no textuales que deben distinguirse entre sí. */
const NON_TEXT_PAIRS = [['xpSolid', 'xpTrack']];

/** Contorno de control interactivo: 3:1 sobre las superficies principales. */
const INTERACTIVE_BORDER = 'borderStrong';

/**
 * Exentos. `border` es una divisoria decorativa, no un componente que haya que
 * percibir para operar. `overlay` lleva alfa y su contraste depende de lo que
 * tape.
 */
const EXEMPT = ['border', 'overlay'];

function channelLuminance(value) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  return (
    0.2126 * channelLuminance((n >> 16) & 255) +
    0.7152 * channelLuminance((n >> 8) & 255) +
    0.0722 * channelLuminance(n & 255)
  );
}

function contrastRatio(foreground, background) {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}

const failures = [];
const checks = [];

function check(scheme, tokens, foregroundKey, backgroundKey, minimum) {
  const foreground = tokens[foregroundKey];
  const background = tokens[backgroundKey];
  const ratio = contrastRatio(foreground, background);
  const passed = ratio >= minimum;
  const row = { scheme, foregroundKey, backgroundKey, ratio, minimum, passed };
  checks.push(row);
  if (!passed) failures.push(row);
}

function assertEveryTokenClassified(scheme, tokens) {
  const classified = new Set([
    ...MAIN_SURFACES,
    ...TEXT_TOKENS,
    ...CHROME_SURFACES,
    ...EXEMPT,
    TINTED.surface,
    INTERACTIVE_BORDER,
    ...SOLID_PAIRS.flat(),
    ...NON_TEXT_PAIRS.flat(),
  ]);
  const unclassified = Object.keys(tokens).filter((key) => !classified.has(key));
  if (unclassified.length > 0) {
    console.error(
      `\n[${scheme}] tokens sin clasificar en check-contrast.mjs: ${unclassified.join(', ')}\n` +
        'Añádelos a una de las listas (texto, superficie, sólido, no textual o exento).',
    );
    process.exitCode = 1;
  }
}

for (const [scheme, tokens] of Object.entries(Colors)) {
  assertEveryTokenClassified(scheme, tokens);

  for (const text of TEXT_TOKENS) {
    for (const surface of MAIN_SURFACES) check(scheme, tokens, text, surface, MIN_TEXT);
  }
  for (const text of CHROME_TEXT) {
    for (const surface of CHROME_SURFACES) check(scheme, tokens, text, surface, MIN_TEXT);
  }
  for (const text of TINTED.text) check(scheme, tokens, text, TINTED.surface, MIN_TEXT);
  for (const [text, fill] of SOLID_PAIRS) check(scheme, tokens, text, fill, MIN_TEXT);
  for (const surface of MAIN_SURFACES) {
    check(scheme, tokens, INTERACTIVE_BORDER, surface, MIN_NON_TEXT);
  }
  for (const [a, b] of NON_TEXT_PAIRS) check(scheme, tokens, a, b, MIN_NON_TEXT);
}

for (const row of failures) {
  console.error(
    `FALLO  ${row.scheme}  ${row.foregroundKey} sobre ${row.backgroundKey}  ` +
      `${row.ratio.toFixed(2)}:1  (mínimo ${row.minimum}:1)`,
  );
}

const worst = checks.reduce((a, b) => (a.ratio < b.ratio ? a : b));
console.log(
  `${checks.length} pares comprobados, ${failures.length} fallos. ` +
    `Par más ajustado: ${worst.scheme} ${worst.foregroundKey}/${worst.backgroundKey} ` +
    `${worst.ratio.toFixed(2)}:1 (mínimo ${worst.minimum}:1).`,
);

if (failures.length > 0) process.exitCode = 1;
