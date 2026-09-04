// esm.sh en vez de jsr: — jsr:@supabase/supabase-js arrastra dependencias npm
// transitivas (iceberg-js, tslib...) que el bundler local de `supabase
// functions deploy` necesita "aplanar" en un node_modules real, y ese paso
// falla porque el bundler monta supabase/functions en solo lectura. esm.sh
// sirve el paquete ya empaquetado como ESM puro, sin ese paso.
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta Supabase en toda Edge
// Function del proyecto — no hace falta darlos de alta a mano.
export function createServiceRoleClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, serviceRoleKey);
}
