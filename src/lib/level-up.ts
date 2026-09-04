/**
 * Datos de una subida de nivel y su lectura desde la URL.
 *
 * La pantalla de subida de nivel (`src/app/level-up.tsx`) celebra un evento
 * que ya ocurrió: se abre justo después de que se resuelva un duelo. No lee
 * nada del backend, así que los datos viajan como parámetros de ruta y no por
 * un repositorio — por eso esto vive en `lib/` y no en `repositories/`.
 *
 * Expo Router entrega los parámetros siempre como texto (o como array, si la
 * URL repite la clave), así que este archivo es una frontera: entra lo que
 * venga en el enlace, sale un tipo de dominio o `null`.
 */

/** Mismo suelo que la restricción `profiles_level_positive` del esquema. */
const MIN_LEVEL = 1;

export type LevelUp = {
  /** Nivel que el jugador acaba de dejar atrás. */
  fromLevel: number;
  /** Nivel recién alcanzado. Siempre mayor que `fromLevel`. */
  toLevel: number;
  /**
   * Recompensa desbloqueada, si la hay. El diseño reserva una card para esto
   * («New character accessory unlocked»), pero todavía no existe el sistema
   * de recompensas que la llene: `null` la oculta en vez de inventarse una.
   */
  reward: string | null;
};

/** Forma en la que Expo Router entrega los parámetros de una ruta. */
export type RouteParams = Record<string, string | string[] | undefined>;

/** Una clave repetida en la URL llega como array; vale la primera. */
function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseLevel(value: string | string[] | undefined): number | null {
  const raw = firstValue(value);

  if (raw === undefined || raw.trim() === '') return null;

  const level = Number(raw);

  return Number.isInteger(level) && level >= MIN_LEVEL ? level : null;
}

/**
 * Traduce los parámetros de ruta a una subida de nivel, o `null` si el enlace
 * no describe ninguna.
 *
 * Rechaza `toLevel <= fromLevel` a propósito: celebrar una bajada o un empate
 * sería mentirle al jugador, y solo puede salir de un enlace mal construido.
 */
export function parseLevelUp(params: RouteParams): LevelUp | null {
  const fromLevel = parseLevel(params.from);
  const toLevel = parseLevel(params.to);

  if (fromLevel === null || toLevel === null) return null;
  if (toLevel <= fromLevel) return null;

  return { fromLevel, toLevel, reward: firstValue(params.reward) ?? null };
}
