/**
 * Tipos de la base de datos, escritos a mano desde `supabase/migrations/`.
 *
 * Lo normal sería generarlos con `supabase gen types typescript`, pero eso
 * necesita un proyecto vinculado o un Postgres local levantado, y ProofIt
 * todavía no tiene proyecto en la nube. En cuanto exista, este archivo se
 * reemplaza por el generado y se borra esta nota.
 *
 * `Insert` y `Update` codifican los **grants a nivel de columna** del esquema,
 * no solo la forma de la tabla: si el cliente no puede escribir una columna, no
 * aparece aquí, y si no puede insertar en una tabla, su `Insert` es `never`.
 * Así el modelo anti-cheat lo vigila el compilador y no la memoria de quien
 * escriba la pantalla. Ver `supabase/SCHEMA.md`, secciones 4 y 5.
 */

export type DuelStatus = 'PENDING' | 'ACTIVE' | 'FINISHED' | 'DECLINED';

export type ProfileRow = {
  id: string;
  username: string;
  level: number;
  xp: number;
  streak_days: number;
  is_pro: boolean;
  created_at: string;
  updated_at: string;
};

export type StepLogRow = {
  id: string;
  user_id: string;
  /** `DATE` de Postgres, en `YYYY-MM-DD`. Es la fecha **local** del usuario. */
  date: string;
  steps_count: number;
  created_at: string;
};

export type DuelRow = {
  id: string;
  challenger_id: string;
  opponent_id: string;
  status: DuelStatus;
  start_date: string;
  end_date: string;
  challenger_steps: number;
  opponent_steps: number;
  winner_id: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        /**
         * `never`: no hay policy de INSERT en `profiles`. Las filas solo nacen
         * del trigger `handle_new_user()` al registrarse el usuario.
         */
        Insert: never;
        /** El cliente solo tiene `GRANT UPDATE (username)`. */
        Update: { username?: string };
        Relationships: [];
      };
      step_logs: {
        Row: StepLogRow;
        /** `GRANT INSERT (user_id, date, steps_count)`. */
        Insert: { user_id: string; date: string; steps_count: number };
        /** `GRANT UPDATE (steps_count)`. */
        Update: { steps_count?: number };
        Relationships: [];
      };
      duels: {
        Row: DuelRow;
        /**
         * `GRANT INSERT (challenger_id, opponent_id, start_date, end_date)`,
         * pero en la práctica se crea con `request_duel`, que además valida
         * duplicados y duración. Usa la RPC.
         */
        Insert: {
          challenger_id: string;
          opponent_id: string;
          start_date: string;
          end_date: string;
        };
        /** `never`: estado, marcador y ganador solo los escriben las RPCs. */
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      request_duel: {
        Args: { p_opponent_id: string; p_duration_days?: number };
        Returns: DuelRow;
      };
      respond_to_duel: {
        Args: { p_duel_id: string; p_accept: boolean };
        Returns: DuelRow;
      };
      sync_duel_steps: {
        Args: { p_duel_id: string };
        Returns: DuelRow;
      };
      resolve_duel: {
        Args: { p_duel_id: string };
        Returns: DuelRow;
      };
      level_for_xp: {
        Args: { p_xp: number };
        Returns: number;
      };
      daily_step_goal: {
        Args: Record<never, never>;
        Returns: number;
      };
    };
    Enums: {
      duel_status: DuelStatus;
    };
    CompositeTypes: Record<never, never>;
  };
};
