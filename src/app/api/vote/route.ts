import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { calculateNewRatings } from '@/lib/elo';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { winnerId, loserId } = body;

    if (!winnerId || !loserId) {
      return NextResponse.json(
        { error: 'winnerId and loserId are required' },
        { status: 400 }
      );
    }

    if (winnerId === loserId) {
      return NextResponse.json(
        { error: 'winnerId and loserId must be different' },
        { status: 400 }
      );
    }

    // Fetch current ratings for both Pokemon
    const { data: pokemon, error: fetchError } = await supabase
      .from('pokemon')
      .select('id, elo')
      .in('id', [winnerId, loserId]);

    if (fetchError || !pokemon || pokemon.length !== 2) {
      return NextResponse.json(
        { error: 'Failed to fetch Pokemon' },
        { status: 500 }
      );
    }

    const winner = pokemon.find((p) => p.id === winnerId);
    const loser = pokemon.find((p) => p.id === loserId);

    if (!winner || !loser) {
      return NextResponse.json(
        { error: 'Pokemon not found' },
        { status: 404 }
      );
    }

    // Calculate new ratings
    const { newWinnerRating, newLoserRating } = calculateNewRatings(
      winner.elo,
      loser.elo
    );

    // Update ratings in database
    const [winnerUpdate, loserUpdate] = await Promise.all([
      supabase
        .from('pokemon')
        .update({ elo: newWinnerRating, updated_at: new Date().toISOString() })
        .eq('id', winnerId),
      supabase
        .from('pokemon')
        .update({ elo: newLoserRating, updated_at: new Date().toISOString() })
        .eq('id', loserId),
    ]);

    if (winnerUpdate.error || loserUpdate.error) {
      return NextResponse.json(
        { error: 'Failed to update ratings' },
        { status: 500 }
      );
    }

    // Record the vote (win/loss counts updated by database trigger)
    const sessionId = request.headers.get('x-session-id') || null;
    const { error: voteError } = await supabase.from('votes').insert({
      winner_id: winnerId,
      loser_id: loserId,
      session_id: sessionId,
    });

    if (voteError) {
      console.error('Failed to record vote:', voteError);
      // Don't fail the request, ratings are already updated
    }

    return NextResponse.json({
      success: true,
      newRatings: {
        [winnerId]: newWinnerRating,
        [loserId]: newLoserRating,
      },
      eloChange: {
        winner: newWinnerRating - winner.elo,
        loser: newLoserRating - loser.elo,
      },
    });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
