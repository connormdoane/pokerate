'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type RankedPokemon = {
  rank: number;
  id: number;
  name: string;
  sprite_url: string;
  elo: number;
  wins: number;
  losses: number;
};

type LeaderboardData = {
  pokemon: RankedPokemon[];
  total: number;
  limit: number;
  offset: number;
  order: 'asc' | 'desc';
};

const ITEMS_PER_PAGE = 25;

export default function LeaderboardTable() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const offset = page * ITEMS_PER_PAGE;
        const response = await fetch(
          `/api/leaderboard?limit=${ITEMS_PER_PAGE}&offset=${offset}&order=${order}`
        );
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [page, order]);

  const handleOrderChange = (newOrder: 'desc' | 'asc') => {
    if (newOrder !== order) {
      setOrder(newOrder);
      setPage(0);
    }
  };

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return 'text-gb-lightest';
  };

  const getWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return '0%';
    return `${Math.round((wins / total) * 100)}%`;
  };

  if (loading && !data) {
    return (
      <div className="gb-screen p-8 text-center">
        <p className="font-pixel text-sm text-gb-light animate-pulse">
          Loading rankings...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Sort Toggle */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => handleOrderChange('desc')}
          className={`font-pixel text-[8px] sm:text-[10px] px-3 py-2 border-2 transition-all ${
            order === 'desc'
              ? 'bg-gb-light text-gb-darkest border-gb-lightest'
              : 'bg-gb-dark text-gb-lightest border-gb-dark hover:border-gb-light'
          }`}
        >
          Top Rated
        </button>
        <button
          onClick={() => handleOrderChange('asc')}
          className={`font-pixel text-[8px] sm:text-[10px] px-3 py-2 border-2 transition-all ${
            order === 'asc'
              ? 'bg-gb-light text-gb-darkest border-gb-lightest'
              : 'bg-gb-dark text-gb-lightest border-gb-dark hover:border-gb-light'
          }`}
        >
          Bottom Rated
        </button>
      </div>

      {/* Table */}
      <div className="gb-screen overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gb-dark bg-gb-darkest">
              <th className="font-pixel text-[8px] sm:text-[10px] text-gb-light p-2 sm:p-3 text-left">
                #
              </th>
              <th className="font-pixel text-[8px] sm:text-[10px] text-gb-light p-2 sm:p-3 text-left">
                Pokemon
              </th>
              <th className="font-pixel text-[8px] sm:text-[10px] text-gb-light p-2 sm:p-3 text-right">
                ELO
              </th>
              <th className="font-pixel text-[8px] sm:text-[10px] text-gb-light p-2 sm:p-3 text-right hidden sm:table-cell">
                W/L
              </th>
              <th className="font-pixel text-[8px] sm:text-[10px] text-gb-light p-2 sm:p-3 text-right hidden sm:table-cell">
                Win%
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.pokemon.map((pokemon) => (
              <tr
                key={pokemon.id}
                className="border-b border-gb-dark hover:bg-gb-dark/50 transition-colors"
              >
                <td
                  className={`font-pixel text-xs sm:text-sm p-2 sm:p-3 ${getRankClass(
                    pokemon.rank
                  )}`}
                >
                  {pokemon.rank}
                </td>
                <td className="p-2 sm:p-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                      <Image
                        src={pokemon.sprite_url}
                        alt={pokemon.name}
                        fill
                        className="pixel-sprite object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="font-pixel text-[8px] sm:text-[10px] text-gb-lightest">
                      {pokemon.name}
                    </span>
                  </div>
                </td>
                <td className="font-pixel text-[10px] sm:text-xs text-gb-light p-2 sm:p-3 text-right">
                  {pokemon.elo}
                </td>
                <td className="font-pixel text-[8px] sm:text-[10px] text-gb-light p-2 sm:p-3 text-right hidden sm:table-cell">
                  {pokemon.wins}/{pokemon.losses}
                </td>
                <td className="font-pixel text-[8px] sm:text-[10px] text-gb-light p-2 sm:p-3 text-right hidden sm:table-cell">
                  {getWinRate(pokemon.wins, pokemon.losses)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="gb-button disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        <span className="font-pixel text-[10px] text-gb-light">
          Page {page + 1} / {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          className="gb-button disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
