/**
 * Comprueba que `XP_PER_LEVEL` en TypeScript sigue coincidiendo con el divisor
 * de `level_for_xp()` en el SQL. Se ejecuta con `pnpm check:xp`.
 *
 * `src/lib/xp.ts` duplica la fórmula a propósito, porque la barra de XP no
 * puede llamar a una RPC por fotograma. El precio de esa decisión es que las dos
 * copias pueden separarse en silencio: el ratio pasos → nivel está marcado como
 * placeholder en `supabase/SCHEMA.md`, así que es probable que alguien lo
 * cambie. Si eso pasa y nadie toca el TypeScript, la barra de XP miente sin dar
 * ningún error.
 *
 * Carga `src/lib/xp.ts` directamente con Node, y por eso ese archivo no puede
 * tener imports.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { XP_PER_LEVEL } from '../src/lib/xp.ts';

const MIGRATION = fileURLToPath(
  new URL('../supabase/migrations/20260903140914_duel_rpcs.sql', import.meta.url),
);

const sql = readFileSync(MIGRATION, 'utf8');

const functionBody = sql.match(
  /CREATE OR REPLACE FUNCTION public\.level_for_xp[\s\S]*?AS \$\$([\s\S]*?)\$\$/,
);

if (!functionBody) {
  console.error(
    `No se encontró level_for_xp() en ${MIGRATION}.\n` +
      'Si la función se movió a otra migración, actualiza la ruta de este script.',
  );
  process.exit(1);
}

const divisor = functionBody[1].match(/\/\s*(\d+)/);

if (!divisor) {
  console.error(
    'level_for_xp() ya no divide por una constante literal.\n' +
      `Cuerpo encontrado:${functionBody[1]}\n` +
      'Revisa a mano si src/lib/xp.ts sigue reflejando la fórmula.',
  );
  process.exit(1);
}

const sqlXpPerLevel = Number(divisor[1]);

if (sqlXpPerLevel !== XP_PER_LEVEL) {
  console.error(
    `Desajuste en la fórmula de XP.\n` +
      `  SQL  level_for_xp() divide por ${sqlXpPerLevel}\n` +
      `  TS   XP_PER_LEVEL vale ${XP_PER_LEVEL}\n` +
      'La barra de XP mostraría un progreso distinto al que calcula el servidor.\n' +
      'Pon src/lib/xp.ts al día con la migración.',
  );
  process.exit(1);
}

console.log(`Fórmula de XP alineada: SQL y TypeScript usan ${XP_PER_LEVEL} XP por nivel.`);
