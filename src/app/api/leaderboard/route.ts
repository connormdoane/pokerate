import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const order = searchParams.get('order') || 'desc';
    const ascending = order === 'asc';

    // Fetch Pokemon sorted by Elo
    const { data, error, count } = await supabase
      .from('pokemon')
      .select('id, name, sprite_url, elo, wins, losses', { count: 'exact' })
      .order('elo', { ascending })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Add rank to each Pokemon
    const total = count || 0;
    const rankedPokemon = data.map((pokemon, index) => ({
      rank: ascending ? total - offset - index : offset + index + 1,
      ...pokemon,
    }));

    return NextResponse.json({
      pokemon: rankedPokemon,
      total,
      limit,
      offset,
      order,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
