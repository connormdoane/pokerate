'use client';

import Image from 'next/image';

type Pokemon = {
  id: number;
  name: string;
  sprite_url: string;
  elo: number;
};

type MatchupCardProps = {
  pokemon: Pokemon;
  onClick: () => void;
  disabled?: boolean;
  showElo?: boolean;
};

export default function MatchupCard({
  pokemon,
  onClick,
  disabled = false,
  showElo = false,
}: MatchupCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        gb-screen pokemon-card
        flex flex-col items-center justify-center
        p-6 w-full max-w-[280px]
        cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <div className="relative w-32 h-32 sm:w-40 sm:h-40">
        <Image
          src={pokemon.sprite_url}
          alt={pokemon.name}
          fill
          className="pixel-sprite object-contain"
          unoptimized
        />
      </div>

      <h2 className="font-pixel text-gb-lightest text-xs sm:text-sm mt-4 text-center">
        {pokemon.name}
      </h2>

      {showElo && (
        <p className="text-gb-light text-xs mt-2">
          ELO: {pokemon.elo}
        </p>
      )}

      <div className="font-pixel text-[8px] text-gb-light mt-4 opacity-70">
        CLICK TO VOTE
      </div>
    </button>
  );
}
