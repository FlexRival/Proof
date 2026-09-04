import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { type ExpiredCompetitionConfig, type ResolutionSummary, STATUS_ACTIVE } from "./config.ts";

async function findExpiredActiveIds(
  supabase: SupabaseClient,
  config: ExpiredCompetitionConfig,
  todayIso: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from(config.table)
    .select("id")
    .eq("status", STATUS_ACTIVE)
    .lt("end_date", todayIso)
    .returns<{ id: string }[]>();

  if (error) {
    throw new Error(`No se pudo listar ${config.table} vencidos: ${error.message}`);
  }
  return (data ?? []).map((row) => row.id);
}

// Llama a resolve_duel / resolve_clan_war (según config) sobre cada fila
// vencida. Cada una se resuelve de forma independiente: el fallo de una no
// bloquea las demás, y el resumen dice exactamente cuáles fallaron y por qué.
export async function resolveExpiredCompetitions(
  supabase: SupabaseClient,
  config: ExpiredCompetitionConfig,
  todayIso: string,
): Promise<ResolutionSummary> {
  const expiredIds = await findExpiredActiveIds(supabase, config, todayIso);
  const summary: ResolutionSummary = { resolved: [], failed: [] };

  for (const id of expiredIds) {
    const { error } = await supabase.rpc(config.resolveRpc, { [config.rpcIdParam]: id });
    if (error) {
      summary.failed.push({ id, error: error.message });
    } else {
      summary.resolved.push(id);
    }
  }

  return summary;
}
