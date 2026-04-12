import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch Pokemon sorted by Elo
    const { data, error, count } = await supabase
      .from('pokemon')
      .select('id, name, sprite_url, elo, wins, losses', { count: 'exact' })
      .order('elo', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Add rank to each Pokemon
    const rankedPokemon = data.map((pokemon, index) => ({
      rank: offset + index + 1,
      ...pokemon,
    }));

    return NextResponse.json({
      pokemon: rankedPokemon,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
