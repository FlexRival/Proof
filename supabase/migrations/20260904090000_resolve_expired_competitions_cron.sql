-- ============================================================================
-- MIGRACIÓN: CRON PARA CERRAR DUELOS Y GUERRAS DE CLANES VENCIDOS
--
-- Pendiente conocido (ver SCHEMA.md §6 y §11): nadie llamaba a resolve_duel()
-- ni a resolve_clan_war() cuando su end_date pasaba, así que el XP (que solo
-- se otorga dentro de resolve_duel) y el ajuste de rank_points se quedaban
-- sin calcular hasta que un participante abriera la app y algo disparara esa
-- RPC.
--
-- Esta migración programa un job de pg_cron que, cada hora, hace un POST a
-- la Edge Function `resolve-expired-competitions`
-- (supabase/functions/resolve-expired-competitions/). Esa función usa la
-- service_role key para listar duelos y guerras ACTIVE con end_date vencida
-- y llama a resolve_duel() / resolve_clan_war() en cada una — ambas RPC ya
-- tienen GRANT EXECUTE a service_role (ver *_duel_rpcs.sql y *_clan_wars.sql).
--
-- REQUISITO MANUAL — no se puede versionar en git porque son secretos.
-- Una sola vez por proyecto, desde el SQL editor del dashboard (no desde una
-- migración):
--
--   select vault.create_secret('<url del proyecto>.supabase.co', 'project_url');
--   select vault.create_secret('<service role key del proyecto>', 'service_role_key');
--
-- Sin esos dos secretos el cron corre pero cada llamada HTTP falla al no
-- encontrar los valores; queda registrado en cron.job_run_details para
-- depurar.
--
-- LIMITACIÓN CONOCIDA: pg_cron y pg_net no están disponibles en el Postgres
-- efímero (PGlite) con el que se validaron las migraciones de clanes (ver
-- SCHEMA.md). Esta migración solo se puede validar contra un proyecto
-- Supabase real (`supabase start` o el proyecto vinculado).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net  WITH SCHEMA extensions;

GRANT USAGE ON SCHEMA cron TO postgres;

SELECT cron.schedule(
  'resolve-expired-competitions',
  '0 * * * *', -- cada hora en punto
  $$
  SELECT net.http_post(
    url     := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
               || '/functions/v1/resolve-expired-competitions',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'
      )
    ),
    body    := '{}'::jsonb
  ) AS request_id;
  $$
);
