import { parseLevelUp, type LevelUp, type RouteParams } from '@/lib/level-up';

/**
 * Resultado de un duelo ganado y su lectura desde la URL.
 *
 * Mismo criterio que `level-up.ts`: la pantalla celebra algo que el servidor
 * ya calculó y guardó (`resolve_duel`), así que los datos viajan como
 * parámetros de ruta y no hay repositorio de por medio.
 *
 * Si el duelo además hizo subir de nivel, los parámetros `from` y `to`
 * describen esa subida y la pantalla añade su bloque; si no vienen, la
 * victoria se enseña sola.
 */
export type Victory = {
  opponent: string;
  /** Pasos del ganador durante el duelo. De aquí sale el XP. */
  steps: number;
  /** Duración del duelo, en días. */
  days: number;
  levelUp: LevelUp | null;
};

const MIN_DAYS = 1;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseCount(value: string | string[] | undefined, minimum: number): number | null {
  const raw = firstValue(value);

  if (raw === undefined || raw.trim() === '') return null;

  const count = Number(raw);

  return Number.isInteger(count) && count >= minimum ? count : null;
}

/**
 * Traduce los parámetros de ruta a una victoria, o `null` si el enlace no
 * describe ninguna.
 *
 * Los pasos pueden ser 0 —se gana un duelo teniendo más que el rival, y el
 * rival puede tener menos que uno— pero los días no: un duelo de cero días no
 * existe.
 */
export function parseVictory(params: RouteParams): Victory | null {
  const opponent = firstValue(params.opponent)?.trim();
  const steps = parseCount(params.steps, 0);
  const days = parseCount(params.days, MIN_DAYS);

  if (!opponent || steps === null || days === null) return null;

  return { opponent, steps, days, levelUp: parseLevelUp(params) };
}
