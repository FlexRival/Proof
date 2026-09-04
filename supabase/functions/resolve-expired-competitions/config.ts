// Qué compite: duelos 1v1 y guerras de clanes comparten el mismo ciclo
// PENDING → ACTIVE → FINISHED, así que se resuelven con la misma lógica
// genérica (ver expired-competitions.ts) parametrizada por esta config.

export const STATUS_ACTIVE = "ACTIVE";

export interface ExpiredCompetitionConfig {
  table: "duels" | "clan_wars";
  resolveRpc: "resolve_duel" | "resolve_clan_war";
  rpcIdParam: "p_duel_id" | "p_war_id";
}

export interface ResolutionSummary {
  resolved: string[];
  failed: { id: string; error: string }[];
}

export const DUELS: ExpiredCompetitionConfig = {
  table: "duels",
  resolveRpc: "resolve_duel",
  rpcIdParam: "p_duel_id",
};

export const CLAN_WARS: ExpiredCompetitionConfig = {
  table: "clan_wars",
  resolveRpc: "resolve_clan_war",
  rpcIdParam: "p_war_id",
};
