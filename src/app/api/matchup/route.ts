import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getIdRangesForGenerations, getDefaultEnabledGenerations } from '@/lib/generations';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();

    // Parse generations from query params (e.g., ?gens=1,2,3)
    const gensParam = request.nextUrl.searchParams.get('gens');
    const genIds = gensParam
      ? gensParam.split(',').map(Number).filter((n) => !isNaN(n) && n >= 1 && n <= 9)
      : getDefaultEnabledGenerations();

    // Get ID ranges for the enabled generations
    const ranges = getIdRangesForGenerations(genIds);

    if (ranges.length === 0) {
      return NextResponse.json(
        { error: 'No valid generations specified' },
        { status: 400 }
      );
    }

    // Build the OR filter for ID ranges
    const orConditions = ranges
      .map((range) => `and(id.gte.${range.start},id.lte.${range.end})`)
      .join(',');

    // Get total count of Pokemon matching the filter
    const { count, error: countError } = await supabase
      .from('pokemon')
      .select('*', { count: 'exact', head: true })
      .or(orConditions);

    if (countError || !count || count < 2) {
      return NextResponse.json(
        { error: 'Not enough Pokemon in selected generations' },
        { status: 500 }
      );
    }

    // Generate two different random offsets
    const offset1 = Math.floor(Math.random() * count);
    let offset2 = Math.floor(Math.random() * count);
    while (offset2 === offset1) {
      offset2 = Math.floor(Math.random() * count);
    }

    // Fetch two random Pokemon from filtered set
    const [result1, result2] = await Promise.all([
      supabase
        .from('pokemon')
        .select('id, name, sprite_url, elo')
        .or(orConditions)
        .range(offset1, offset1)
        .single(),
      supabase
        .from('pokemon')
        .select('id, name, sprite_url, elo')
        .or(orConditions)
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
