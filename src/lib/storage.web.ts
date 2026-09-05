/**
 * En el navegador ya existe `window.localStorage` nativo: no hace falta el
 * polyfill de `expo-sqlite`. Importarlo aquí rompería el bundle web — su
 * soporte de web necesita un worker WASM con cabeceras COEP/COOP que este
 * proyecto no configura, y sin ellas Metro falla con "Worker chunk not
 * found" en cuanto algo lo importa (ver `src/lib/storage.ts` para la
 * variante nativa, seleccionada automáticamente fuera de web).
 *
 * `window` no existe durante el renderizado a servidor de Expo Router web
 * (corre en Node): el acceso queda detrás de un guard para no reventar ese
 * render. El cliente rehidrata en el navegador de verdad, donde sí hay
 * `window`, así que la sesión real nunca pasa por el fallback en memoria.
 */
const memoryFallback = new Map<string, string>();

const serverRenderFallback = {
  getItem: (key: string) => memoryFallback.get(key) ?? null,
  setItem: (key: string, value: string) => void memoryFallback.set(key, value),
  removeItem: (key: string) => void memoryFallback.delete(key),
};

export const authStorage = typeof window !== 'undefined' ? window.localStorage : serverRenderFallback;
