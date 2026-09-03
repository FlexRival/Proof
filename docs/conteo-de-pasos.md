# Conteo de pasos — investigación y decisión pendiente

**Estado: investigado, sin decidir. No hay código de pasos todavía.**
Fecha de la investigación: 2026-09-03.

Este documento existe para que nadie vuelva a empezar de cero, y sobre todo para
que nadie empiece por el camino equivocado: la opción que suena obvia (Google
Fit) ya no se puede usar.

---

## 1. Qué necesita ProofIt exactamente

No basta con «leer los pasos de hoy». El modelo de datos de
[`supabase/SCHEMA.md`](../supabase/SCHEMA.md) impone cuatro requisitos:

| Requisito | De dónde sale |
|---|---|
| Pasos **por día**, no acumulados | `step_logs` tiene `UNIQUE (user_id, date)` |
| **Fecha local** del usuario, no UTC | Si no, el día cambia a medianoche UTC y atribuye mal pasos y rachas |
| Datos **retroactivos** de varios días | `sync_duel_steps` recalcula la ventana entera del duelo, no solo hoy |
| Funcionar **sin la app abierta** | Un duelo de 7 días no puede depender de que abras la app cada día |

El tercero y el cuarto son los que descartan la solución fácil.

---

## 2. Descartado: Google Fit

**No es una opción, ni siquiera para probar.**

- Google cerró las **altas nuevas el 1 de mayo de 2024**. Un proyecto que no
  estuviera ya registrado no puede obtener acceso hoy.
- Las APIs de Google Fit se apagan **a finales de 2026** — es decir, dentro de
  unos meses.
- La ruta oficial de migración apunta a Health Connect.

Si alguien encuentra un tutorial de React Native + Google Fit, está desfasado por
muy reciente que parezca.

---

## 3. Descartado como fuente única: `expo-sensors` / Pedometer

Es lo que ya trae Expo y lo primero que uno prueba. Sirve para un prototipo y
para poco más:

| Método | Limitación real |
|---|---|
| `getStepCountAsync(inicio, fin)` | **Solo iOS.** En Android no existe |
| Histórico en iOS | **Solo 7 días** hacia atrás |
| `watchStepCount()` | **No entrega nada con la app en segundo plano** |

Traducido a ProofIt: en Android no se pueden consultar los pasos de días
anteriores, así que un duelo de 7 días no se puede puntuar. Y en iOS el margen de
7 días deja sin colchón a un duelo de esa misma duración.

**Dónde sí encaja:** como fuente del contador «en vivo» de la pantalla principal
mientras la app está en primer plano. Bonito, pero no es la fuente de verdad.

---

## 4. La opción real: HealthKit + Health Connect

No hay una API única multiplataforma. Son dos integraciones nativas distintas
detrás de una interfaz común nuestra:

| | iOS | Android |
|---|---|---|
| Plataforma | **HealthKit** | **Health Connect** |
| Histórico | Sí, largo | Sí, largo |
| Agrega otras fuentes | Apple Watch, apps de terceros | Fitbit, Samsung Health, Google Fit… |
| Disponibilidad | Integrado en iOS | Nativo en Android 14+; APK de Play Store en versiones anteriores |

Health Connect además **agrega** lo que escriben otras apps y pulseras, así que
un usuario con Samsung Health o Fitbit aporta sus pasos sin que integremos cada
una por separado. Es el argumento de peso para usarla en vez de leer el sensor a
pelo.

### Librerías candidatas (sin decidir)

- **Android:** `react-native-health-connect` — tiene config plugin para Expo.
- **iOS:** `@kingstinct/react-native-healthkit` o `react-native-health` — ambas
  con config plugin.
- **Las dos a la vez:** `react-native-health-link` envuelve ambas detrás de una
  API común. Menos código, menos control.

> No he verificado versiones concretas ni compatibilidad con SDK 57. Antes de
> instalar nada, comprobar cada una contra
> <https://docs.expo.dev/versions/v57.0.0/> como manda `AGENTS.md`.

**Cómo funcionan las dos por dentro** —permisos, límites de histórico, lectura
en segundo plano y las trampas que hunden proyectos— está en
[`healthkit-y-health-connect.md`](./healthkit-y-health-connect.md).

---

## 5. Consecuencia gorda para la planificación

**Ninguna de estas librerías funciona en Expo Go.** Son módulos nativos.

Eso obliga a:

1. `expo-dev-client` y un **development build** propio para desarrollar.
2. `npx expo prebuild`, y reconstruir cada vez que cambien plugins o props.
3. Que `KAN-12` (Setup EAS Build) deje de ser una tarea del final y pase a ser
   **prerrequisito** para tocar pasos.

Hasta ahora se podía desarrollar con Expo Go. En cuanto entren los pasos, se
acabó. Conviene que Luis lo sepa antes de planificar la semana.

---

## 6. El agujero anti-cheat que esto NO cierra

`supabase/SCHEMA.md` abre con «el servidor no confía en el cliente», y el modelo
de grants por columna es sólido para XP y nivel. Pero:

```sql
GRANT INSERT (user_id, date, steps_count) ON public.step_logs TO authenticated;
```

**El cliente escribe `steps_count` directamente, y el único `CHECK` es `>= 0`.**
Cualquiera con la clave publicable —que viaja dentro de la app y es pública por
diseño— puede insertar 900.000 pasos con un `curl`. Las RLS solo garantizan que
lo haga en *su* fila. Y el duelo lo decide esa columna.

Dicho de otra forma: el anti-cheat protege el premio (XP, nivel) pero no el
marcador que lo reparte.

**Mitigaciones que existen, por orden de coste:**

1. **Tope de cordura en el servidor.** Un `CHECK` o un trigger con un máximo
   diario plausible. Barato, y para el tramposo casual sobra.
2. **Filtrar por procedencia del dato.** Health Connect expone `recordingMethod`
   (`AUTOMATIC`, `ACTIVELY_RECORDED`, `MANUAL`, `UNKNOWN`) y `dataOrigin` (qué
   app escribió el registro); HealthKit expone `HKWasUserEntered`. Permite
   **descartar los pasos metidos a mano**. Ojo: ninguna de las dos plataformas
   garantiza la clasificación al 100%, es la mejor información disponible.
3. **Detección de saltos.** Marcar deltas imposibles entre sincronizaciones.
4. **Atestación de dispositivo** (App Attest en iOS, Play Integrity en Android)
   para asegurar que quien escribe es la app de verdad y no un script.

**Nada de esto es gratis y ninguna cierra el agujero del todo.** Hasta dónde
llegar es decisión de producto: no es lo mismo un duelo entre amigos que se
conocen que un ranking global con algo en juego.

**Esto hay que hablarlo con Luis**, porque el tope de cordura y el filtro de
procedencia son trabajo de servidor, no de la app.

---

## 7. Trámites de tienda (no son un detalle)

**Google Play.** Usar Health Connect obliga a rellenar el *Health apps
declaration form*, declarando cada tipo de dato que se lee y para qué. Solo se
aprueban casos de uso justificados — y la buena noticia es que **«juegos con
mecánicas basadas en fitness» está en la lista de casos aprobados**, que es
exactamente ProofIt. Pedir más tipos de dato de los que se usan es motivo de
rechazo: hay que pedir solo pasos.

**App Store.** Las reglas de HealthKit no se negocian y su incumplimiento puede
retirar la app. La que más nos afecta: **los datos de HealthKit no pueden usarse
para publicidad segmentada** ni pasarse a redes publicitarias. Con RevenueCat y
suscripción no hay problema; si algún día entran anuncios, sí.

Ambos trámites llevan tiempo de revisión. No dejarlos para la semana de entrega.

---

## 8. Propuesta (a validar, no decidida)

Una capa propia en `src/lib/steps/` que exponga algo así:

```ts
type DailySteps = {
  date: string; // YYYY-MM-DD, fecha LOCAL del usuario
  steps: number;
  source: 'healthkit' | 'health-connect' | 'pedometer';
};

readDailySteps(desde: string, hasta: string): Promise<DailySteps[]>;
```

…con tres implementaciones detrás (iOS, Android, y el pedómetro como respaldo en
primer plano), para que las pantallas no sepan de qué plataforma vienen los
datos. El upsert a `step_logs` se hace desde ahí, con la fecha local, que es lo
que exige el esquema.

---

## 9. Qué falta decidir

- [ ] ¿Librería única (`react-native-health-link`) o una por plataforma?
- [ ] ¿Cuánto anti-cheat? Decisión de producto + trabajo de servidor de Luis.
- [ ] ¿Cuándo se hace el development build? Bloquea todo lo demás de pasos.
- [ ] ¿Qué pasa con quien **no concede** el permiso de salud? ¿Juega con el
      pedómetro en primer plano, o se queda fuera?
- [ ] ¿Y en Android 13 o anterior, si no tiene Health Connect instalado?

---

## Fuentes

- Expo SDK 57, Pedometer: <https://docs.expo.dev/versions/v57.0.0/sdk/pedometer/>
- Google Fit → Health Connect, guía de migración: <https://developer.android.com/health-and-fitness/health-connect/migration/fit>
- Publicar apps de salud en Google Play: <https://developer.android.com/health-and-fitness/health-connect/publish>
- Metadatos de Health Connect (`recordingMethod`): <https://developer.android.com/health-and-fitness/health-connect/metadata>
- Tipos de dato de Health Connect: <https://developer.android.com/health-and-fitness/health-connect/data-types>
- `react-native-health-connect`: <https://matinzd.github.io/react-native-health-connect/docs/get-started/>
- `@kingstinct/react-native-healthkit`: <https://kingstinct.com/react-native-healthkit/>
- `react-native-health` con Expo: <https://github.com/agencyenterprise/react-native-health/blob/master/docs/Expo.md>
