/**
 * Aritmética de XP y nivel.
 *
 * Espeja `level_for_xp(p_xp) = 1 + p_xp / 1000` de
 * `supabase/migrations/20260903140914_duel_rpcs.sql`. La fórmula se duplica a
 * propósito, aunque el esquema exponga la RPC al cliente: la barra de XP se
 * repinta en cada fotograma de la animación y no puede pagar una ida y vuelta
 * de red por fotograma.
 *
 * Esa duplicación es el riesgo real de este archivo, así que
 * `scripts/check-xp-formula.mjs` compara la constante con el SQL y falla si se
 * separan. Ejecútalo con `pnpm check:xp`.
 */

/**
 * XP necesario por nivel. Placeholder deliberado, igual que en el SQL —
 * `supabase/SCHEMA.md` lo lista como pendiente de ajustar.
 */
export const XP_PER_LEVEL = 1000;

/** Mismo redondeo que la división entera de Postgres para valores no negativos. */
export function levelForXp(xp: number): number {
  return 1 + Math.floor(normalizeXp(xp) / XP_PER_LEVEL);
}

export type LevelProgress = {
  level: number;
  /** XP acumulado dentro del nivel actual. */
  xpIntoLevel: number;
  /** XP que hay que juntar para pasar de nivel. */
  xpForNextLevel: number;
  /** Fracción de 0 a 1, lista para el ancho de la barra. */
  ratio: number;
};

/** Todo lo que la barra de XP necesita para pintarse, desde un solo número. */
export function levelProgress(xp: number): LevelProgress {
  const total = normalizeXp(xp);
  const xpIntoLevel = total % XP_PER_LEVEL;

  return {
    level: levelForXp(total),
    xpIntoLevel,
    xpForNextLevel: XP_PER_LEVEL,
    ratio: xpIntoLevel / XP_PER_LEVEL,
  };
}

/**
 * El esquema tiene `CHECK (xp >= 0)`, así que un valor negativo solo puede
 * venir de un bug. Se recorta en vez de propagar una barra de ancho negativo.
 */
function normalizeXp(xp: number): number {
  return Math.max(0, Math.floor(xp));
}

/**
 * XP que se lleva quien gana un duelo.
 *
 * Espeja `xp += floor(pasos_ganador / 10)` de `resolve_duel`
 * (`supabase/SCHEMA.md` §7). Igual que `XP_PER_LEVEL`, se duplica a propósito:
 * la pantalla de victoria enseña la cifra antes de volver a consultar al
 * servidor, y el cálculo real ya lo hizo Postgres.
 */
export const STEPS_PER_XP = 10;

export function xpForDuelWin(winnerSteps: number): number {
  return Math.floor(normalizeXp(winnerSteps) / STEPS_PER_XP);
}
