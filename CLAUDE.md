@AGENTS.md

# ProofIt — Contexto del Proyecto

## Visión General
ProofIt es una app RPG móvil desarrollada con Expo (React Native) donde los pasos reales diarios del usuario suben de nivel a su personaje y le permiten retar a sus amigos en duelos 1v1 basados en su actividad física real.

## Core Loop & Funcionalidades Principales
- **Conteo de Pasos & XP:** Tracking de pasos diarios (mediante Podómetro / sensores del dispositivo) convertidos automáticamente en XP para subir de nivel al personaje.
- **Sistema de Personajes:** Creación y personalización de avatar/clase RPG, barra de progreso de XP y pantalla de subida de nivel.
- **Duelos 1v1 Competitivos:** Comparación de pasos y XP acumulado contra amigos en períodos fijos (ej. semanal) consultados en Supabase.
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
  `duels`; modelo anti-cheat; RPCs de duelos; rachas). Léela antes de tocar
  `supabase/migrations/`.
- `docs/`: Investigación y decisiones de arquitectura pendientes.
  **`docs/conteo-de-pasos.md`** — de dónde salen los pasos: Google Fit está
  muerto, la vía es HealthKit + Health Connect, lo que eso obliga en build, y el
  hueco anti-cheat de `step_logs`.
  **`docs/healthkit-y-health-connect.md`** — cómo funcionan las dos por dentro:
  permisos, límites de histórico y las trampas (en iOS un permiso denegado es
  indistinguible de cero pasos). Léelos antes de escribir código de pasos.
- `.claude/skills/`: Skills de desarrollo y seguridad (anti-leaks, UI, Supabase).

## Notas de implementación (estado actual)
- **XP:** solo se gana al ganar un duelo (`floor(pasos_ganador / 10)`), no por
  pasos diarios. Ver `supabase/SCHEMA.md`.
- **Pasos:** sin implementar y sin librería elegida. La captura de pasos
  necesita módulos nativos, así que **rompe Expo Go** y exige un development
  build. Ver `docs/conteo-de-pasos.md`.
- **Sin clases de personaje.** Se descartaron: el esquema ya eliminó el enum
  `user_class` y la columna `avatar_class`, y los tokens de color de clase se
  quitaron del sistema de diseño.