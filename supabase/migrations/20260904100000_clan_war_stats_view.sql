-- ============================================================================
-- MIGRACIÓN: VISTA DE ESTADÍSTICAS DE GUERRAS DE CLAN
--
-- `clans` solo guarda agregados de `rank_points` y `member_count`; no hay
-- ningún sitio con el conteo de victorias/derrotas ni los pasos totales
-- puestos en guerras. Esa información vive dispersa, una fila por guerra, en
-- `clan_wars`. Esta vista la agrega en tiempo de consulta — sin duplicar
-- estado ni tener que mantenerlo sincronizado en resolve_clan_war — igual
-- que clan_leaderboard agrega clans.rank_points para el ranking.
-- ============================================================================

CREATE VIEW public.clan_war_stats
WITH (security_invoker = on)
AS
  WITH war_sides AS (
    -- Cada guerra FINISHED aporta dos "lados": uno por el retador y otro por
    -- el retado, cada uno con sus propios pasos y si ganó/empató desde su
    -- punto de vista. Así un clan que a veces retó y a veces fue retado se
    -- agrega igual, sin importar de qué lado estuvo en cada guerra.
    SELECT
      challenger_clan_id                                    AS clan_id,
      challenger_steps                                      AS own_steps,
      COALESCE(winner_clan_id = challenger_clan_id, FALSE)  AS won,
      winner_clan_id IS NULL                                AS drew
    FROM public.clan_wars
    WHERE status = 'FINISHED'

    UNION ALL

    SELECT
      opponent_clan_id,
      opponent_steps,
      COALESCE(winner_clan_id = opponent_clan_id, FALSE),
      winner_clan_id IS NULL
    FROM public.clan_wars
    WHERE status = 'FINISHED'
  )
  SELECT
    c.id                                                          AS clan_id,
    c.name,
    c.tag,
    COUNT(ws.clan_id) FILTER (WHERE ws.won)                       AS wars_won,
    COUNT(ws.clan_id) FILTER (WHERE NOT ws.won AND NOT ws.drew)   AS wars_lost,
    COUNT(ws.clan_id) FILTER (WHERE ws.drew)                      AS wars_drawn,
    COUNT(ws.clan_id)                                             AS wars_played,
    COALESCE(SUM(ws.own_steps), 0)                                AS total_war_steps
  FROM public.clans c
  LEFT JOIN war_sides ws ON ws.clan_id = c.id
  GROUP BY c.id, c.name, c.tag;

-- Mismo criterio de visibilidad que clan_leaderboard: son datos públicos del
-- clan (factor viral), no hace falta ser miembro para verlos.
GRANT SELECT ON public.clan_war_stats TO authenticated, anon;
