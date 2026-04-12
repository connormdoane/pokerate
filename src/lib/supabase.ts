import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
