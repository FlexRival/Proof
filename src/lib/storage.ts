/**
 * Storage de sesión para Supabase en nativo (iOS/Android): no existe
 * `window.localStorage` ahí, así que `expo-sqlite` lo instala como polyfill
 * global. Metro elige este archivo o `storage.web.ts` según la plataforma
 * (sufijo `.web.ts`) — ver ese archivo para el porqué de la partición.
 */
import 'expo-sqlite/localStorage/install';

export const authStorage = localStorage;
