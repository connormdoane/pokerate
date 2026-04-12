import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

export type Pokemon = {
  id: number;
  name: string;
  sprite_url: string;
  elo: number;
  wins: number;
  losses: number;
  updated_at: string;
};

export type Vote = {
  id: string;
  winner_id: number;
  loser_id: number;
  created_at: string;
  session_id: string | null;
};
