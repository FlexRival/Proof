// ============================================================================
// EDGE FUNCTION: resolve-expired-competitions
//
// Cierra los duelos y guerras de clanes cuya ventana (end_date) ya pasó,
// llamando a las RPC `resolve_duel` / `resolve_clan_war` (ya existen en
// supabase/migrations/*_duel_rpcs.sql y *_clan_wars.sql). Ese es el único
// sitio donde se otorga XP, así que esta función es lo que hace que el XP se
// calcule solo en vez de depender de que un jugador abra la app justo cuando
// su duelo termina.
//
// La invoca un cron de pg_cron (ver la migración *_resolve_expired_
// competitions_cron.sql) con la service_role key como Bearer token — por eso
// solo acepta llamadas con ese rol (auth.ts) y no es una ruta pensada para
// clientes de la app.
// ============================================================================

import { callerRole, SERVICE_ROLE } from "./auth.ts";
import { CLAN_WARS, DUELS } from "./config.ts";
import { resolveExpiredCompetitions } from "./expired-competitions.ts";
import { jsonResponse } from "./http.ts";
import { createServiceRoleClient } from "./supabase-client.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }
  if (callerRole(req) !== SERVICE_ROLE) {
    return jsonResponse(
      { error: "Esta función solo la puede invocar el cron interno (service_role)." },
      401,
    );
  }

  const supabase = createServiceRoleClient();
  const todayIso = new Date().toISOString().slice(0, 10);

  try {
    const [duels, clanWars] = await Promise.all([
      resolveExpiredCompetitions(supabase, DUELS, todayIso),
      resolveExpiredCompetitions(supabase, CLAN_WARS, todayIso),
    ]);
    return jsonResponse({ duels, clan_wars: clanWars }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return jsonResponse({ error: message }, 500);
  }
});
