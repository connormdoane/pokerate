import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabase();

    // Get total count of Pokemon
    const { count, error: countError } = await supabase
      .from('pokemon')
      .select('*', { count: 'exact', head: true });

    if (countError || !count) {
      return NextResponse.json(
        { error: 'Failed to fetch Pokemon count' },
        { status: 500 }
      );
    }

    // Generate two different random offsets
    const offset1 = Math.floor(Math.random() * count);
    let offset2 = Math.floor(Math.random() * count);
    while (offset2 === offset1) {
      offset2 = Math.floor(Math.random() * count);
    }

    // Fetch two random Pokemon
    const [result1, result2] = await Promise.all([
      supabase
        .from('pokemon')
        .select('id, name, sprite_url, elo')
        .range(offset1, offset1)
        .single(),
      supabase
        .from('pokemon')
        .select('id, name, sprite_url, elo')
        .range(offset2, offset2)
        .single(),
    ]);

    if (result1.error || result2.error) {
      return NextResponse.json(
        { error: 'Failed to fetch Pokemon' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      pokemon: [result1.data, result2.data],
    });
  } catch (error) {
    console.error('Matchup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
