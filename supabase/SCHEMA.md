# ProofIt — Estructura de la base de datos

Referencia de la capa de datos (Supabase / Postgres). Léela antes de tocar
`supabase/migrations/`.

## Archivos de migración

| Archivo | Contenido |
|---|---|
| `migrations/20260903135409_init_migration.sql` | Tablas base (`profiles`, `step_logs`, `duels`), enum `duel_status`, trigger de creación de perfil, RLS, grants a nivel de columna, realtime. |
| `migrations/20260903140914_duel_rpcs.sql` | Ciclo de vida de duelos: RPCs `request_duel` / `respond_to_duel` / `sync_duel_steps` / `resolve_duel`, helpers `level_for_xp` y `duel_step_total`. |
| `migrations/20260903141500_streaks.sql` | Rachas: `daily_step_goal`, `recompute_streak` y el trigger que mantiene `profiles.streak_days`. |

Ninguna migración se ha aplicado todavía (no se ha ejecutado `supabase start`
ni `supabase db push`). Son solo archivos.

---

## 1. Principio central: el servidor no confía en el cliente

Es un RPG donde los pasos reales dan poder, así que es un imán para trampas. El
esquema se construye sobre una regla: **el cliente solo escribe entradas crudas;
todo lo que da ventaja lo calcula el servidor.**

El rol `authenticated` (cualquier usuario logueado desde la app) solo puede:

- editar su propio `username`
- insertar/actualizar su `steps_count` diario
- llamar a las cuatro RPCs de duelos

**No puede** escribir directamente `xp`, `level`, `streak_days`, `is_pro`, los
marcadores de duelos ni el ganador. Eso solo se mueve mediante funciones
`SECURITY DEFINER` o la clave `service_role` (solo servidor).

Se refuerza con **dos capas independientes** que deben pasar ambas:

- **Row Level Security (RLS)** — qué *filas* puedes tocar.
- **Grants a nivel de columna** — qué *columnas* puedes tocar.

---

## 2. Tablas

### `profiles`

Una fila por usuario. PK = `auth.users.id` con `ON DELETE CASCADE` (borrar el
usuario de auth borra el perfil y todo lo que cuelga de él).

| Columna | Notas |
|---|---|
| `username` | único, `CHECK` longitud 3–24 |
| `level` | `CHECK >= 1`, solo servidor |
| `xp` | `CHECK >= 0`, solo servidor |
| `streak_days` | `CHECK >= 0`, solo servidor |
| `is_pro` | flag de RevenueCat, solo servidor |
| `created_at` / `updated_at` | `updated_at` lo mantiene un trigger `moddatetime` en cada UPDATE |

No hay clases de personaje: el enum `user_class` y la columna `avatar_class` se
eliminaron.

### `step_logs`

El registro crudo de pasos diarios.

- `UNIQUE (user_id, date)` → exactamente una fila por usuario por día (la app
  hace upsert).
- `date` tiene default `CURRENT_DATE`, **pero se espera que el cliente envíe su
  fecha local** — si no, el "día" cambiaría a medianoche UTC y atribuiría mal
  pasos y rachas a quien no esté en UTC.
- `CHECK (steps_count >= 0)`.
- índice en `date` para consultas tipo ranking.

No hay columna de XP por día: el XP solo se gana ganando duelos.

### `duels`

- `challenger_id`, `opponent_id`, `winner_id` → todas FK a `profiles`.
- `status` enum `duel_status`: `PENDING → ACTIVE → FINISHED`, o `PENDING → DECLINED`.
- `start_date` / `end_date` — la ventana de competición.
- `challenger_steps` / `opponent_steps` — el marcador, lo rellenan las RPCs.
- `CHECK`s: los jugadores deben ser distintos, `end_date >= start_date`, pasos
  no negativos, y `winner_id` debe ser uno de los dos participantes.
- índices en `challenger_id`, `opponent_id`, `status`.

---

## 3. Creación automática de perfil

`handle_new_user()` es un trigger `SECURITY DEFINER` sobre
`auth.users AFTER INSERT`. Al registrarse un usuario:

1. Toma `username` de la metadata de registro, o genera `Heroe_<8 chars del uuid>`
   si falta o está vacío.
2. Si ese username ya existe, añade `_<4 chars del uuid>` en vez de fallar (una
   colisión antes tumbaba todo el registro con un 500).
3. Inserta el perfil.

Tiene `SET search_path = ''` y todas las referencias van cualificadas por
esquema — esto cierra el hueco de "search_path hijacking" que el linter de
Supabase marca en funciones `SECURITY DEFINER`. Su `EXECUTE` está revocado para
todos (es solo para el trigger).

Como este trigger es la **única** forma de que nazca una fila de `profiles` (no
hay policy de INSERT en `profiles`), cada perfil corresponde con seguridad a un
usuario real de auth.

---

## 4. Políticas RLS (qué filas)

| Tabla | Lectura | Escritura |
|---|---|---|
| `profiles` | cualquier autenticado lee cualquier perfil (para buscar amigos/rivales) | actualizar **solo tu propia fila** (`USING` + `WITH CHECK`, ambos `auth.uid() = id`) |
| `step_logs` | solo tus filas | insertar/actualizar solo tus filas |
| `duels` | solo duelos donde participas | **sin policy de escritura** — todo pasa por RPCs |

`auth.uid()` va envuelto como `(SELECT auth.uid())` en cada policy para que
Postgres lo evalúe una vez por consulta y no una vez por fila.

---

## 5. Grants a nivel de columna (qué columnas) — los dientes del anti-cheat

Para cada tabla la migración hace `REVOKE ALL ... FROM authenticated` y luego
concede de vuelta solo lo seguro:

- **`profiles`**: `SELECT` + `UPDATE (username)`. Nada más. `xp`, `level`,
  `streak_days`, `is_pro` son físicamente no escribibles por la app aunque la
  fila sea del usuario.
- **`step_logs`**: `SELECT` + `INSERT (user_id, date, steps_count)` +
  `UPDATE (steps_count)`.
- **`duels`**: solo `SELECT` (el INSERT se concedió en la migración inicial y
  luego se **revocó** en la migración de RPCs, una vez existió `request_duel`).

A `service_role` nunca lo tocan estos revokes, así que el servidor conserva
acceso completo.

---

## 6. Ciclo de vida del duelo — las cuatro RPCs

Todas son `SECURITY DEFINER`, `search_path = ''`, y bloquean la fila del duelo
con `FOR UPDATE` para evitar carreras.

### `request_duel(opponent_id, duration_days = 7)`

El retador crea un duelo `PENDING`. Rechaza: duelos contra uno mismo, duraciones
fuera de 1–30, oponentes inexistentes, y un segundo duelo cuando ya hay uno
`PENDING`/`ACTIVE` entre esas dos personas (en cualquier dirección). La ventana
en este punto es provisional.

### `respond_to_duel(duel_id, accept)`

Solo el oponente, solo mientras está `PENDING`.

- `accept = true` → estado `ACTIVE`, y la ventana se **re-ancla a hoy**
  conservando la duración pedida (para que un duelo aceptado 3 días tarde no
  arranque con el retador ya por delante).
- `accept = false` → estado `DECLINED`.

### `sync_duel_steps(duel_id)`

Cualquier participante, mientras está `ACTIVE`. Recalcula los totales de pasos de
ambos jugadores desde `step_logs` sobre `start_date … min(hoy, end_date)` y los
escribe en `challenger_steps` / `opponent_steps`.

Este es el mecanismo que te deja **ver el progreso del rival sin poder leer sus
`step_logs`** — la función corre como owner y salta RLS, devolviendo solo el
agregado.

### `resolve_duel(duel_id)`

Cualquier participante, o un job de `service_role`. Solo después de `end_date`.
Idempotente (si ya está `FINISHED` devuelve sin cambios).

1. Totales finales de pasos sobre toda la ventana.
2. Más pasos gana; empate exacto → sin ganador.
3. Estado → `FINISHED`, marcador y `winner_id` escritos.
4. **El ganador** recibe `xp += floor(pasos_ganador / 10)` y se recalcula
   `level`. El perdedor no recibe nada.

El helper interno `duel_step_total(user, start, end)` hace el `SUM` — es
`SECURITY DEFINER` y su execute está revocado para todos, así que solo las RPCs
lo usan.

---

## 7. XP y nivel

- **El XP solo se gana ganando un duelo.** No hay ruta de pasos → XP. Los pasos
  solo importan como marcador del duelo.
- Fórmula: `floor(pasos del ganador durante el duelo / 10)`.
- `level_for_xp(xp)` → `1 + xp/1000`, marcada `IMMUTABLE`. El cliente también
  puede llamarla para previsualizar "XP para el siguiente nivel" sin duplicar la
  fórmula.
- `profiles.xp` y `profiles.level` se escriben en un único sitio: `resolve_duel`.

Tanto `/10` como `/1000` son placeholders deliberados.

---

## 8. Rachas (`20260903141500_streaks.sql`)

`streak_days` = días consecutivos en que el usuario alcanzó la meta diaria de
pasos.

- `daily_step_goal()` → `6000` (placeholder).
- `recompute_streak(user_id)`: cuenta hacia atrás desde hoy los días que cumplen
  la meta. Hoy cuenta en cuanto se cumple; si hoy aún no se cumple, la cuenta
  empieza desde ayer — un **día de gracia** para que un día en curso no rompa la
  racha. Escribe el resultado en `profiles.streak_days` (omite la escritura si no
  cambia).
- El trigger `step_logs_streak` corre `AFTER INSERT OR UPDATE OF steps_count` y
  recalcula para ese usuario. Así la racha se mantiene correcta automáticamente
  según la app hace upsert de los pasos — sin intervención del cliente.

---

## 9. Realtime

`duels` está añadida a la publicación `supabase_realtime`, así la app puede
suscribirse y ver cambios de estado/marcador en vivo. Realtime también respeta
RLS, así que un usuario solo recibe eventos de duelos en los que participa.

---

## Placeholders a revisar

- Ratio pasos → XP (`/10`).
- Ratio XP → nivel (`/1000`).
- Meta diaria de pasos para la racha (`6000`).
