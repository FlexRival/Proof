@AGENTS.md

# ProofIt — Contexto del Proyecto

## Visión General
ProofIt es una app RPG móvil desarrollada con Expo (React Native) donde los pasos reales diarios del usuario suben de nivel a su personaje y le permiten retar a sus amigos en duelos 1v1 basados en su actividad física real.

## Core Loop & Funcionalidades Principales
- **Conteo de Pasos & XP:** Tracking de pasos diarios (mediante Podómetro / sensores del dispositivo) convertidos automáticamente en XP para subir de nivel al personaje.
- **Sistema de Personajes:** Creación y personalización de avatar/clase RPG, barra de progreso de XP y pantalla de subida de nivel.
- **Duelos 1v1 Competitivos:** Comparación de pasos y XP acumulado contra amigos en períodos fijos (ej. semanal) consultados en Supabase.
- **Clanes & Guerras de Clanes:** Grupos con líder, oficiales y miembros. La gente pide entrar (líder/oficiales aceptan) o entra con un código de invitación compartible; se puede expulsar. El líder inicia guerras de clanes (pasos sumados del roster congelado); ganar sube `rank_points` y el tier del clan. Leaderboard de clanes.
- **Factor Viral / Social:** Generación de imágenes compartibles de duelos y nivel del personaje para redes sociales (`react-native-view-shot`).
- **Monetización (RevenueCat):**
  - *Gratis:* Por definir
  - *Pro:* Por definir.

## Stack Tecnológico
- **Frontend:** React Native con Expo (SDK actual), React Navigation, React Native Reanimated.
- **Backend:** Supabase (Auth, PostgreSQL con Row Level Security, Edge Functions en Deno/TypeScript).
- **Monetización:** SDK de RevenueCat (`react-native-purchases`).
- **NUNCA usar:** Librerías de React Web (`react-dom`, `div`, `span`, `framer-motion`). Usar exclusivamente componentes nativos (`View`, `Text`, `Image`).

## Estructura del Proyecto
- `src/`: Código fuente de la app Expo (pantallas, componentes, hooks, servicios).
- `supabase/`: Migraciones SQL y Edge Functions. **`supabase/SCHEMA.md` es la
  referencia autoritativa de la capa de datos** (tablas `profiles`, `step_logs`,
  `duels`, `clans` / `clan_members` / `clan_join_requests` / `clan_invites` /
  `clan_wars` / `clan_war_participants`; modelo anti-cheat; RPCs de duelos,
  clanes y guerras; rachas; rango de clanes). Léela antes de tocar
  `supabase/migrations/`.
- `docs/`: Investigación y decisiones de arquitectura pendientes.
  **`docs/conteo-de-pasos.md`** — de dónde salen los pasos: Google Fit está
  muerto, la vía es HealthKit + Health Connect, lo que eso obliga en build, y el
  hueco anti-cheat de `step_logs`.
  **`docs/healthkit-y-health-connect.md`** — cómo funcionan las dos por dentro:
  permisos, límites de histórico y las trampas (en iOS un permiso denegado es
  indistinguible de cero pasos). Léelos antes de escribir código de pasos.
  **`docs/design.md`** — referencia autoritativa del sistema de diseño (paleta,
  tokens semánticos, huecos pendientes). Contraparte legible de
  `src/constants/colors.ts`. Léela antes de escribir cualquier color en un
  componente; la skill `design-system` lo hace cumplir.
- `.claude/skills/`: Skills de desarrollo y seguridad (anti-leaks, UI, Supabase,
  sistema de diseño, patrón repositorio).

## Notas de implementación (estado actual)
- **XP:** solo se gana al ganar un duelo (`floor(pasos_ganador / 10)`), no por
  pasos diarios. Ver `supabase/SCHEMA.md`.
- **Pasos:** sin implementar y sin librería elegida. La captura de pasos
  necesita módulos nativos, así que **rompe Expo Go** y exige un development
  build. Ver `docs/conteo-de-pasos.md`.
- **Sin clases de personaje.** Se descartaron: el esquema ya eliminó el enum
  `user_class` y la columna `avatar_class`, y los tokens de color de clase se
  quitaron del sistema de diseño.
- **Diseño: tema único, oscuro.** No hay modo claro (`Colors` en
  `src/constants/colors.ts` no tiene `.light`). Paleta y reglas en
  `docs/design.md`.
- **Tipografía:** dos familias y nada más — **Chakra Petch 700** (cifras,
  niveles, títulos, botones) y **Space Grotesk 400/500** (cuerpo y labels).
  La familia es el peso: no hay Space Grotesk Bold, lo que sería negrita sube
  a Chakra. Se cargan en `src/app/_layout.tsx` desde `src/constants/fonts.ts`.
- **Primitivos de UI:** `Button`, `Card`, `Chip`, `SegmentedControl`, `XpBar` y
  `Notice` en `src/components/`. Monta las pantallas con ellos antes de
  escribir un `borderRadius` a mano.
- **Clanes:** un usuario pertenece como mucho a **un** clan (`UNIQUE` en
  `clan_members.user_id`). Roles `LEADER` / `OFFICER` / `MEMBER`. Toda mutación
  pasa por RPCs `SECURITY DEFINER` (`create_clan`, `request_to_join_clan`,
  `respond_to_join_request`, `join_clan_with_invite`, `leave_clan`,
  `remove_clan_member`, `transfer_clan_leadership`, `set_clan_member_role`,
  `disband_clan`, …). Al salir el líder, el mando pasa al oficial más antiguo.
- **Guerras de clanes:** espejo de los duelos. `request_clan_war` (solo líder) →
  `respond_to_clan_war` congela el roster de ambos clanes en
  `clan_war_participants` → `sync_clan_war_steps` / `resolve_clan_war`. Los pasos
  se cuentan solo del roster congelado.
- **Rango de clanes:** `clans.rank_points` (solo servidor) sube/baja al resolver
  una guerra (placeholder `+25 / -15` con suelo 0, empate `+5`).
  `clan_tier_for_points()` da el tier; vista `clan_leaderboard` da la posición.
- **Estado de migraciones:** las 2 migraciones de clanes
  (`20260903150000_clans.sql`, `20260903150500_clan_wars.sql`) aún no se han
  hecho `supabase db push` al proyecto vinculado.
- **Cierre automático de duelos/guerras:** la Edge Function
  `supabase/functions/resolve-expired-competitions/` + un cron de `pg_cron`
  (migración `20260904090000_resolve_expired_competitions_cron.sql`) llaman a
  `resolve_duel` / `resolve_clan_war` cada hora para todo lo vencido — así el
  XP se calcula solo sin depender de que un jugador abra la app. Ver
  `supabase/SCHEMA.md` §12. Requiere dar de alta a mano dos secretos en
  Supabase Vault (`project_url`, `service_role_key`) antes de que el cron
  funcione; no se puede validar contra el Postgres efímero (PGlite) que se usa
  para las demás migraciones.
