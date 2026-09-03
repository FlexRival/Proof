/**
 * Cliente de Supabase de la app.
 *
 * Sigue la guía de Expo SDK 57: https://docs.expo.dev/guides/using-supabase/
 * La sesión persiste en el `localStorage` que instala `expo-sqlite`.
 */

import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import type { Database } from '@/lib/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Faltan EXPO_PUBLIC_SUPABASE_URL y/o EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ' +
      'Copia .env.example a .env.local y rellena las dos, luego reinicia el bundler.',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    /** Android e iOS no tienen una URL de la que leer una sesión. */
    detectSessionInUrl: false,
  },
});

/**
 * En móvil `autoRefreshToken` deja su bucle corriendo indefinidamente, también
 * con la app en segundo plano. Se para al salir y se reanuda al volver.
 */
AppState.addEventListener('change', (status) => {
  if (status === 'active') {
    supabase.auth.startAutoRefresh();
    return;
  }

  supabase.auth.stopAutoRefresh();
});
