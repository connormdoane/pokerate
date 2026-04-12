'use client';

import { useState, useEffect, useCallback } from 'react';
import MatchupCard from './MatchupCard';

type Pokemon = {
  id: number;
  name: string;
  sprite_url: string;
  elo: number;
};

type EloChange = {
  winner: number;
  loser: number;
};

export default function VoteContainer() {
  const [pokemon, setPokemon] = useState<[Pokemon, Pokemon] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voteCount, setVoteCount] = useState(0);
  const [lastResult, setLastResult] = useState<{
    winner: string;
    change: number;
  } | null>(null);

  const fetchMatchup = useCallback(async () => {
    try {
      const response = await fetch('/api/matchup');
      if (!response.ok) throw new Error('Failed to fetch matchup');

      const data = await response.json();
      setPokemon(data.pokemon);
      setError(null);
    } catch (err) {
      setError('Failed to load Pokemon. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatchup();
  }, [fetchMatchup]);

  const handleVote = async (winnerId: number, loserId: number) => {
    if (!pokemon) return;

    const winner = pokemon.find((p) => p.id === winnerId);

    // Optimistically fetch next matchup
    setLoading(true);
    fetchMatchup();

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId, loserId }),
      });

      if (response.ok) {
        const data = await response.json();
        setVoteCount((c) => c + 1);
        setLastResult({
          winner: winner?.name || 'Pokemon',
          change: data.eloChange?.winner || 0,
        });

        // Clear the result after 2 seconds
        setTimeout(() => setLastResult(null), 2000);
      }
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="font-pixel text-sm text-red-400">{error}</p>
        <button onClick={fetchMatchup} className="gb-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Vote counter */}
      <div className="text-center">
        <p className="font-pixel text-[10px] text-gb-light">
          VOTES THIS SESSION: {voteCount}
        </p>
      </div>

      {/* Last result toast */}
      {lastResult && (
        <div className="gb-screen px-4 py-2 animate-pulse">
          <p className="font-pixel text-[8px] text-gb-lightest">
            {lastResult.winner} wins! (+{lastResult.change})
          </p>
        </div>
      )}

      {/* Matchup cards */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 w-full">
        {loading || !pokemon ? (
          <>
            <div className="gb-screen w-full max-w-[280px] h-64 animate-pulse flex items-center justify-center">
              <span className="font-pixel text-xs text-gb-light">Loading...</span>
            </div>
            <div className="font-pixel text-2xl text-gb-lightest hidden sm:block">
              VS
            </div>
            <div className="gb-screen w-full max-w-[280px] h-64 animate-pulse flex items-center justify-center">
              <span className="font-pixel text-xs text-gb-light">Loading...</span>
            </div>
          </>
        ) : (
          <>
            <MatchupCard
              pokemon={pokemon[0]}
              onClick={() => handleVote(pokemon[0].id, pokemon[1].id)}
              disabled={loading}
            />

            <div className="font-pixel text-2xl sm:text-3xl text-gb-lightest">
              VS
            </div>

            <MatchupCard
              pokemon={pokemon[1]}
              onClick={() => handleVote(pokemon[1].id, pokemon[0].id)}
              disabled={loading}
            />
          </>
        )}
      </div>

      {/* Instructions */}
      <p className="font-pixel text-[8px] text-gb-light text-center max-w-md mt-4">
        CLICK YOUR FAVORITE POKEMON TO VOTE. RESULTS UPDATE THE GLOBAL LEADERBOARD.
      </p>
    </div>
  );
}
