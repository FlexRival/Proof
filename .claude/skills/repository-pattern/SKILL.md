---
name: repository-pattern
description: >-
  Use when writing or editing any code that reads or writes app data
  (profiles, duels, clanes, pasos, rachas...) — a screen, a hook, a
  component, or a new repository itself. Enforces that the app never calls
  Supabase (or any backend SDK) directly outside src/repositories/, so
  swapping backend/API later touches one folder instead of the whole app.
---

# Patrón repositorio

La app no sabe de dónde vienen los datos. Habla con una **interfaz**
(el contrato); una clase separada implementa esa interfaz contra el backend
real (hoy, Supabase). Cambiar de backend es escribir una clase nueva que
cumpla el mismo contrato, no reescribir pantallas.

## Regla 1 — nada fuera de `src/repositories/` importa el backend

Ninguna pantalla, hook o componente importa `@/lib/supabase`,
`@/lib/database.types`, `@supabase/supabase-js`, `fetch` contra una API
propia, etc. Solo puede hacerlo un archivo dentro de
`src/repositories/supabase/` (o el nombre del backend que toque en el
futuro: `src/repositories/rest/`, `src/repositories/firebase/`...).

Todo lo demás importa de `@/repositories` (el índice), nunca de
`@/repositories/supabase/*` directamente — ver Regla 3.

## Regla 2 — cada entidad tiene un contrato, no una implementación suelta

Un archivo `src/repositories/<entidad>-repository.ts` declara, para cada
entidad de negocio (perfil, duelo, clan...):

1. **El modelo de dominio** — un `type` en camelCase, con solo los campos
   que la app necesita. Nunca el `Row` generado del backend (snake_case,
   nullable exactamente como lo definió el motor de base de datos).
2. **La interfaz** — `interface XRepository { ... }` (sin prefijo `I`, regla
   N6 de `typescript-clean-code`). Cada método:
   - Recibe y devuelve tipos de dominio, nunca tipos del backend.
   - Es `async`/devuelve `Promise`.
   - Lanza `RepositoryError` (de `src/repositories/errors.ts`) en caso de
     fallo — nunca el error nativo del backend (`PostgrestError`, un
     `Response`, lo que sea). Quien capture el error no debe necesitar saber
     qué backend hay detrás para entenderlo.

La implementación real vive en un archivo hermano, en
`src/repositories/supabase/<entidad>-repository.ts`: una clase
`Supabase<Entidad>Repository implements <Entidad>Repository` que sí importa
Supabase, el `Row` del backend, y traduce `Row → dominio` en una función
`toX()` privada al archivo.

## Regla 3 — un único composition root

`src/repositories/index.ts` es el único archivo que construye las
implementaciones reales y las conecta a sus interfaces:

```ts
export const profileRepository: ProfileRepository = new SupabaseProfileRepository(supabase);
```

Todo el resto de la app importa la instancia ya construida desde ahí
(`import { profileRepository } from '@/repositories'`), nunca la clase
`Supabase*Repository` directamente. Cambiar de backend es cambiar esta
línea, en un solo archivo.

## Regla 4 — el estado de un hook que lee de un repositorio usa `AsyncState`

Ningún hook se inventa su propia unión de `loading`/`error`/etc. Usa los
tipos genéricos de `src/hooks/async-state.ts`:

```ts
export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; message: string };

export type AuthedAsyncState<T> = AsyncState<T> | { status: 'signedOut' };
```

Existe porque Supabase (o cualquier backend) puede tardar más de lo
esperado, y la pantalla necesita un estado `loading` explícito que pintar
mientras tanto — no un `undefined` que se confunda con "todavía no
renderizó". Un hook de una entidad con sesión (perfil, amigos, clan propio)
devuelve `AuthedAsyncState<Entidad>`; uno de datos públicos (leaderboard)
devuelve `AsyncState<Entidad>`, sin `signedOut`.

Patrón: el hook guarda `AsyncState<T>` en `useState`, pide el dato al
repositorio en un `try/catch`, y mapea el resultado a
`{status:'ready', data}` o `{status:'error', message}` — ver
`src/hooks/use-profile.ts`.

## Regla 5 — dato que se usa en varias pantallas vive cacheado a nivel de app

Si un dato se pide desde más de una pantalla/sección y no cambia todo el
rato (amigos, el clan propio, un leaderboard...), **no se vuelve a pedir a
Supabase cada vez que se entra a esa sección**. Se envuelve el repositorio
Supabase en un `Cached<Entidad>Repository` que usa
`RepositoryCache<T>` (`src/repositories/cache.ts`):

- Guarda el último valor y cuándo se pidió. Si han pasado menos de
  `staleMs` (30 segundos por defecto, `DEFAULT_STALE_MS`), devuelve el
  valor guardado sin llamar al backend.
- Si dos sitios lo piden a la vez mientras la petición real está en vuelo,
  comparten esa misma petición — no se disparan dos llamadas paralelas.
- `invalidate()` fuerza que la próxima lectura ignore el caché, aunque no
  haya caducado. Úsalo cuando un evento hace que el dato cacheado deje de
  ser válido con seguridad (ver `CachedProfileRepository`: un cambio de
  sesión invalida el caché al instante, porque el perfil guardado puede ser
  el de otro usuario — no tiene sentido esperar 30 segundos ahí).

El caché va en el decorador (`Cached<Entidad>Repository implements
<Entidad>Repository`), nunca dentro del hook: el hook no tiene que saber si
el dato vino de red o de caché, solo pide al repositorio. Se registra en
`index.ts` envolviendo la implementación Supabase:

```ts
export const profileRepository: ProfileRepository = new CachedProfileRepository(
  new SupabaseProfileRepository(supabase),
);
```

**No todo se cachea.** Un dato que solo se lee en una pantalla, o que tiene
que reflejar el estado exacto del servidor en cada lectura (el resultado de
una mutación que se acaba de hacer, por ejemplo), se deja sin envolver —
llamar directo a `Supabase<Entidad>Repository`.

**Pendiente, no resuelto todavía:** esto cubre la caducidad pasiva (30s) y
la invalidación en cambios de sesión, pero no un refresco manual explícito
(pull-to-refresh) que se salte el caché a propósito. Cuando haga falta eso
en una pantalla real, hay que decidir cómo expone un
`Cached<Entidad>Repository` esa opción — no inventarlo sin pensarlo primero.

## Ejemplo real del proyecto: `profile-repository`

- `src/repositories/profile-repository.ts` — tipo `Profile` + interfaz
  `ProfileRepository` (`getCurrentProfile()`, `onSessionChange()`).
- `src/repositories/supabase/profile-repository.ts` —
  `SupabaseProfileRepository`: llama a `supabase.from('profiles')...`,
  traduce `ProfileRow` (snake_case) a `Profile` (camelCase).
- `src/repositories/cached-profile-repository.ts` —
  `CachedProfileRepository`: envuelve cualquier `ProfileRepository` y le
  añade la caché de 30s de la Regla 5.
- `src/repositories/index.ts` — expone `profileRepository`, ya envuelto en
  caché.
- `src/hooks/use-profile.ts` — antes llamaba a `supabase.from('profiles')`
  directo y devolvía `ProfileRow`; ahora llama a
  `profileRepository.getCurrentProfile()` y no importa Supabase para nada.
  Su estado es `AuthedAsyncState<Profile>` (Regla 4). El hook en sí
  (resuscribirse a cambios de sesión, exponer `reload`) no cambió — el
  patrón repositorio no le tocó su forma de exponer estado a React, solo de
  dónde saca el dato y si pasa por caché.

Usa este archivo como plantilla al añadir `duel-repository.ts`,
`clan-repository.ts`, etc. — con o sin `Cached*` según si esa entidad
cumple la Regla 5.

## Qué NO es un repositorio

Lógica de negocio pura que no habla con ningún backend —
`src/lib/xp.ts` (aritmética de nivel/XP), validaciones, formateo — se queda
en `src/lib/`. El patrón repositorio es solo para la frontera de datos:
leer o escribir algo que vive fuera de la app.

## Mutaciones (RPCs), no solo lecturas

Un método de repositorio no tiene que ser una lectura. `request_clan_war`,
`respond_to_duel`, `join_clan_with_invite`... cada RPC de
`supabase/SCHEMA.md` que la app llame es un método más de la interfaz
correspondiente (`clanRepository.requestWar(clanId)`,
`duelRepository.respond(duelId, accepted)`), implementado en la clase
`Supabase*Repository` como una llamada a `supabase.rpc(...)`.

## Si no existe todavía el repositorio de una entidad

Antes de que una pantalla llame a Supabase "solo por ahora, ya lo
refactorizo después": no. Se crea el contrato primero (aunque tenga un solo
método), su implementación Supabase, y se registra en
`src/repositories/index.ts` — el mismo patrón que `profile-repository`,
aunque sea código nuevo sin nada que migrar.
