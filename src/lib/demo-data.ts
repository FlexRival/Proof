import { levelProgress, type LevelProgress } from '@/lib/xp';

/**
 * Datos de mentira de las pantallas.
 *
 * **Temporal y a propósito.** KAN-22 pide montar la pantalla principal con
 * datos falsos mientras el backend no está; el perfil va detrás con el mismo
 * criterio. Tenerlos aquí, y no repartidos por el JSX, hace que sustituirlos
 * sea borrar un import en vez de reescribir las pantallas.
 *
 * A qué se conectará cada campo:
 * - `username`, `rank`, `xp`, `streak` → `profileRepository.getCurrentProfile()`,
 *   que ya existe (`src/repositories/profile-repository.ts`).
 * - `steps`, `stepGoal`, `totalSteps` → todavía no hay origen. La captura de
 *   pasos no está decidida: ver `docs/conteo-de-pasos.md` (HealthKit + Health
 *   Connect, exige development build).
 * - `duel`, `wins`, `losses` → pendientes de un `duel-repository.ts`.
 */
export type DuelSide = {
  name: string;
  steps: number;
};

export type HomeData = {
  username: string;
  rank: string;
  xp: number;
  steps: number;
  stepGoal: number;
  duel: {
    /** Cuenta atrás ya formateada. La dará el servidor, no se calcula aquí. */
    endsIn: string;
    you: DuelSide;
    rival: DuelSide;
  };
};

export type ProfileData = {
  username: string;
  rank: string;
  xp: number;
  wins: number;
  losses: number;
  streak: number;
  totalSteps: number;
};

/**
 * Cifras tomadas de `capturadiseño/Captura3.png`, salvo el XP: la captura dice
 * `2,450 / 3,000`, pero la regla real del juego son 1.000 XP por nivel
 * (`XP_PER_LEVEL`, que espeja el SQL). 11.450 da nivel 12 con 550 para el 13,
 * que es justo lo que rotula el diseño.
 */
export const HOME_DEMO: HomeData = {
  username: '@marcodev',
  rank: 'CHALLENGER',
  xp: 11450,
  steps: 8742,
  stepGoal: 10000,
  duel: {
    endsIn: '2D 10H LEFT',
    you: { name: 'YOU', steps: 8742 },
    rival: { name: 'ALEX', steps: 7931 },
  },
};

/**
 * Cifras de `capturadiseño/Captura12.png`. Son coherentes entre sí, así que se
 * conservan tal cual: 28 victorias + 18 derrotas = 46 duelos, y 28/46 da el
 * 61 % que rotula la captura — por eso la pantalla deriva duelos y porcentaje
 * en vez de guardarlos repetidos aquí.
 */
export const PROFILE_DEMO: ProfileData = {
  username: HOME_DEMO.username,
  rank: HOME_DEMO.rank,
  xp: HOME_DEMO.xp,
  wins: 28,
  losses: 18,
  streak: 9,
  totalSteps: 1420000,
};

/** Progreso de nivel de los datos de demostración, con la aritmética real. */
export function demoLevelProgress(): LevelProgress {
  return levelProgress(HOME_DEMO.xp);
}

/**
 * Duelos de demostración, de `capturadiseño/Captura5.png` (activos) y
 * `Captura6.png` (pendientes).
 *
 * Los nombres de usuario salen de esas capturas. A ese tamaño alguno es
 * difícil de leer letra a letra; son contenido de relleno, no copy de
 * producto, así que no pasa nada si alguno no es exacto.
 */
export type ActiveDuel = {
  opponent: string;
  yourSteps: number;
  theirSteps: number;
  /** Cuenta atrás ya formateada; la dará el servidor. */
  endsIn: string;
};

export type PendingDuel = {
  opponent: string;
  level: number;
  /** Línea de contexto ya redactada («Challenged you · 3 days»). */
  note: string;
};

export const FEATURED_DUEL: ActiveDuel = {
  opponent: '@alexruiz',
  yourSteps: 8742,
  theirSteps: 7931,
  endsIn: '2 DAYS LEFT',
};

/**
 * Las diferencias cuadran con lo que rotula la captura: 7.306 − 6.102 = 1.204
 * («BEHIND 1,204») y 4.908 − 4.488 = 420 («AHEAD 420»), así que la pantalla
 * calcula la ventaja en vez de guardarla repetida.
 */
export const ACTIVE_DUELS: ActiveDuel[] = [
  { opponent: '@sofia_r', yourSteps: 6102, theirSteps: 7306, endsIn: '9H LEFT' },
  { opponent: '@luoji', yourSteps: 4908, theirSteps: 4488, endsIn: '1D 3H LEFT' },
];

export const INCOMING_DUELS: PendingDuel[] = [
  { opponent: '@nadia.k', level: 14, note: 'Challenged you · 3 days' },
];

export const OUTGOING_DUELS: PendingDuel[] = [
  { opponent: '@sofia_r', level: 12, note: 'Invite sent yesterday · 7 days' },
  { opponent: '@alexruiz', level: 17, note: 'Invite sent yesterday · 7 days' },
];

/**
 * Amigos de demostración, de `capturadiseño/Captura9.png`.
 *
 * `inDuel` es lo que decide el botón de la fila: con un duelo en curso el
 * diseño pinta `IN DUEL` en Rival y sin acción, no un `CHALLENGE` que
 * fallaría al pulsarlo.
 */
export type Friend = {
  username: string;
  level: number;
  streakDays: number;
  inDuel: boolean;
};

export type FriendRequest = {
  username: string;
  level: number;
};

export const FRIEND_REQUESTS: FriendRequest[] = [{ username: '@ludsp', level: 6 }];

export const FRIENDS: Friend[] = [
  { username: '@alexruiz', level: 11, streakDays: 12, inDuel: true },
  { username: '@sofia_r', level: 18, streakDays: 21, inDuel: false },
  { username: '@luoji', level: 8, streakDays: 4, inDuel: false },
  { username: '@nadia.k', level: 14, streakDays: 3, inDuel: false },
];

/**
 * Ajustes de demostración, de `capturadiseño/Captura14.png`. Los conmutadores
 * son estado local de la pantalla: todavía no hay dónde guardarlos.
 */
export const SETTINGS_DEMO = {
  joined: 'JOINED MAR 2026',
  stepTracking: 'CONNECTED',
  dailyStepGoal: 10000,
};
