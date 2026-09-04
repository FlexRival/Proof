# Sistema de diseño de ProofIt

Referencia autoritativa del lenguaje visual de la app: paleta, tokens
semánticos y las reglas para usarlos. Es la contraparte legible de
`src/constants/colors.ts`, que es la que de verdad corre.

**Las dos son la misma fuente de verdad en dos formatos.** Si cambias un
valor en uno, cambia el otro en el mismo commit. Después de tocar
`colors.ts`, ejecuta `pnpm check:contrast` — falla la build si un par
texto/fondo no cumple WCAG 2.1, o si añadiste un token y no lo clasificaste
en el script.

## Regla para quien escribe código (humano o IA)

**Ningún componente hardcodea un color.** Ni un hex, ni un `rgba(...)`, ni
literal alguno con backgroundColor/color/borderColor. Siempre a través de:

- `Colors` (tokens semánticos: `theme.text`, `theme.surface`,
  `theme.primary`...) vía `useTheme()`, o los props `type`/`themeColor` de
  `ThemedView`/`ThemedText`.
- `Palette` (valores en bruto) solo para paradas de degradado o config
  nativa que no puede importar TypeScript (`app.json`).
- `Gradients` para cualquier relleno con degradado.

Si una pantalla necesita un color/rol que no existe abajo, **no te lo
inventes**: para y pregunta. Este documento es exhaustivo a propósito —
que falte algo es una señal de que hay que ampliarlo, no de rellenar el
hueco a ojo.

## Decisión: tema único, oscuro

ProofIt no tiene modo claro. `Colors` es un solo objeto (con la clave
`dark` conservada por compatibilidad con `check-contrast.mjs`, que itera
`Object.entries(Colors)`; no implica que vaya a haber una clave `light`).
Si algún día se añade un tema claro, es ampliar esa clave, no rediseñar el
tipo `ThemeColor`.

`app.json` fija `userInterfaceStyle: "dark"` y el `backgroundColor` del
splash screen en `#08090C` (el mismo valor que `Palette.frame`, copiado a
mano porque JSON no puede importar de `colors.ts`) para que el cromo
nativo (teclado, splash) no desentone. Si `Palette.frame` cambia, actualiza
`app.json` en el mismo commit.

## Superficies

Pila de elevación, de más hundida a más elevada.

| Rol (diseño)     | Token (`Colors`)              | Valor                     | Uso |
|-------------------|-------------------------------|---------------------------|-----|
| Void               | *(solo `Palette.void`, sin token de componente)* | `#05060A` | Fondo de ventana/splash a nivel nativo (`app.json`) y `shadowColor` de `Elevation` en `theme.ts`. Sin token semántico propio porque no es un fondo de pantalla. |
| Frame              | `background`                  | `#08090C`                 | Fondo de pantalla. |
| Surface            | `surfaceSunken`                | `#101219`                 | Superficie hundida: search, reglas, stat sutil. |
| Card               | `surface`                      | `#13151C`                 | Card estándar. |
| Raised             | `surfaceRaised`                 | `#1B1E27`                 | Card elevada / seleccionada. |
| Dock               | `dock`                          | `rgba(17, 19, 26, 0.94)`  | Barra de navegación inferior. |
| Locked             | `locked`                        | `#0E1017`                 | Fondo de slot bloqueado (logro/ítem sin desbloquear). |

`backgroundElement` / `backgroundSelected` son tokens heredados del scaffold
de Expo, hoy con uso real: fondo/selección de los botones de la barra de
tabs (`app-tabs.tsx`, `app-tabs.web.tsx`). Mapeados a `surfaceSunken` y
`surfaceRaised` respectivamente. Cuando se rediseñe la barra de tabs con su
propio lenguaje visual (Power como indicador de tab activa, ver más abajo),
es razonable que estos dos tokens cambien o desaparezcan.

## Acentos

| Rol (diseño)       | Token (`Colors`)                  | Valor        | Uso |
|----------------------|------------------------------------|---------------|-----|
| Power                 | `primary`, `xp`                    | `#C6FF4A`     | El jugador, XP, botón primario, tab activa. |
| Power Bright          | *(`Palette.powerBright`)*          | `#E4FF95`     | Extremo claro del degradado. Ver nota de ambigüedad abajo. |
| Power Bright (alt)    | *(`Palette.powerBrightAlt`)*       | `#E2FF8E`     | Segundo valor claro dado en el diseño original; sin contexto de cuándo usar este en vez del anterior. |
| Power Deep            | `primarySolid`                      | `#B4F02E`     | Extremo oscuro del degradado; relleno sólido de botón primario. |
| Power Mid             | `xpSolid`                           | `#8CE03C`     | Inicio de las barras de XP. |
| Power Flash           | *(`Palette.powerFlash`)*           | `#EEFFB8`     | Flash del level up. Sin token semántico: úsalo directo de `Palette` en la animación de subida de nivel. |
| On Power              | `onPrimary`, `onXp`                | `#0A0C05`     | Texto/ícono sobre superficies de Power. |
| Rival                 | `defeat`                            | `#FF5C38`     | Rival, derrotas, badges de aviso. |

### Degradados (`Gradients`)

No son un token de `Colors` (un color de fondo/texto es un string; un
degradado es un array de paradas). Viven en `Gradients`, en `colors.ts`:

- `Gradients.power = [powerDeep, powerBright]` — botón primario y elementos
  de marca.
- `Gradients.xp = [powerMid, powerBright]` — relleno de la barra de XP.

Ambos son mi interpretación de "extremo claro / extremo oscuro del
degradado" + "inicio de las barras de XP"; el diseño original no dice
explícitamente en qué dirección va cada uno ni dónde termina el de XP.
Corrige `colors.ts` si no es así.

## Texto

| Rol (diseño) | Token (`Colors`) | Valor     | Uso |
|---------------|--------------------|------------|-----|
| Text            | `text`              | `#F1F2F6`  | Primario. |
| Text Soft       | `textSecondary`     | `#B7BCC8`  | Nombres secundarios. |
| Text Muted      | `textMuted`, `info` | `#767C8C`  | Labels, metadatos. También cubre "info / duelo pendiente" — ver huecos. |
| Text Dim        | `textDim`           | `#4E545F`  | Labels de sección, contenido bloqueado. Contraste bajo a propósito. |
| Nav Idle        | `navIdle`           | `#8A90A0`  | Pestaña inactiva de la barra de navegación. |

## Bordes

Todos translúcidos: el contraste depende de lo que haya debajo, así que
`check-contrast.mjs` los exime (mismo criterio que ya aplicaba a `overlay`).

| Rol (diseño)        | Token (`Colors`)     | Valor                        | Uso |
|-----------------------|------------------------|--------------------------------|-----|
| Hairline                | `border`                | `rgba(255, 255, 255, 0.07)`   | Borde de card. |
| Hairline Strong         | `borderStrong`          | `rgba(255, 255, 255, 0.14)`   | Botón secundario. |
| Power Edge              | `primaryEdge`           | `rgba(198, 255, 74, 0.24)`    | Card destacada. |
| Power Edge (seleccionada)| `primaryEdgeStrong`    | `rgba(198, 255, 74, 0.40)`    | Card destacada + seleccionada. |
| Rival Edge              | `rivalEdge`             | `rgba(255, 92, 56, 0.24)`     | Card de rival. |

**Consecuencia de que los bordes ahora lleven alfa:** ya no hay un borde
opaco que garantice 3:1 (WCAG 1.4.11) para transmitir "esto es
interactivo". La afordancia de un botón tiene que venir del relleno o del
label, no del borde. El check de "borde interactivo" que existía en
`check-contrast.mjs` se quitó por esto — ver el propio script.

## Huecos y decisiones que tomé sin dato explícito

El diseño original no cubre estos casos. Elegí lo siguiente; corrígeme si
está mal:

- **`streak` (racha)** y **`victory` (duelo ganado)** → reusan `Power`. No
  había color dedicado; ambos son "cosas buenas que le pasan al jugador",
  igual que Power ya representa "tú, XP".
- **`info` (duelo pendiente / informativo)** → reusa `Text Muted`, un gris
  neutro, en vez de inventar un color de marca nuevo.
- **`overlay` (velo de modal)** → `rgba(5, 6, 10, 0.72)`, derivado de
  `Void`. No estaba en la paleta que diste; sigue el mismo patrón (negro
  casi puro + alfa) que ya usaba la app.
- **`primarySurface`** (superficie teñida de marca, p. ej. fondo de un chip)
  no existe todavía. La versión anterior del sistema sí lo tenía; esta no
  trae un tinte opaco equivalente, así que lo quité en vez de inventar uno.
  Si en algún momento hace falta un fondo tintado de Power, dame el valor y
  lo añado.
- **Power Bright vs Power Bright (alt)** — ver tabla de Acentos.

## Ejemplo de uso en un componente

```tsx
import { useTheme } from '@/hooks/use-theme';
import { ThemedView, ThemedText } from '@/components/themed-view';

function DuelCard() {
  const theme = useTheme();
  return (
    <ThemedView type="surface" style={{ borderColor: theme.primaryEdge, borderWidth: 1 }}>
      <ThemedText themeColor="primary">+120 XP</ThemedText>
    </ThemedView>
  );
}
```
