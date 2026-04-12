/**
 * Fetches all Pokemon from PokeAPI and saves them with their earliest available sprites.
 * Run with: npx tsx scripts/fetch-pokemon.ts
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const TOTAL_POKEMON = 1025; // Current total as of Gen 9
const BATCH_SIZE = 50; // Fetch in batches to avoid rate limits
const DELAY_MS = 100; // Delay between requests

// Generation ranges (National Dex numbers)
const GENERATION_RANGES: Record<string, [number, number]> = {
  'generation-i': [1, 151],
  'generation-ii': [152, 251],
  'generation-iii': [252, 386],
  'generation-iv': [387, 493],
  'generation-v': [494, 649],
  'generation-vi': [650, 721],
  'generation-vii': [722, 809],
  'generation-viii': [810, 905],
  'generation-ix': [906, 1025],
};

// Map generation to sprite version keys (in order of preference)
const GENERATION_SPRITE_KEYS: Record<string, string[]> = {
  'generation-i': ['red-blue', 'yellow'],
  'generation-ii': ['gold', 'silver', 'crystal'],
  'generation-iii': ['ruby-sapphire', 'emerald', 'firered-leafgreen'],
  'generation-iv': ['diamond-pearl', 'platinum', 'heartgold-soulsilver'],
  'generation-v': ['black-white'],
  'generation-vi': ['x-y', 'omegaruby-alphasapphire'],
  'generation-vii': ['ultra-sun-ultra-moon', 'icons'],
  'generation-viii': ['icons'],
};

function getGenerationForPokemon(id: number): string {
  for (const [gen, [min, max]] of Object.entries(GENERATION_RANGES)) {
    if (id >= min && id <= max) {
      return gen;
    }
  }
  return 'generation-ix';
}

function getEarliestSprite(sprites: any, generation: string): string | null {
  // Try to get sprite from the Pokemon's introduction generation
  const genSprites = sprites.versions?.[generation];
  if (genSprites) {
    const versionKeys = GENERATION_SPRITE_KEYS[generation] || [];
    for (const versionKey of versionKeys) {
      const sprite = genSprites[versionKey]?.front_default;
      if (sprite) {
        return sprite;
      }
    }
  }

  // Fallback: try each generation in order until we find a sprite
  const generations = Object.keys(GENERATION_RANGES);
  for (const gen of generations) {
    const genSprites = sprites.versions?.[gen];
    if (genSprites) {
      const versionKeys = GENERATION_SPRITE_KEYS[gen] || Object.keys(genSprites);
      for (const versionKey of versionKeys) {
        const sprite = genSprites[versionKey]?.front_default;
        if (sprite) {
          return sprite;
        }
      }
    }
  }

  // Final fallback: use the default sprite
  return sprites.front_default || null;
}

async function fetchPokemon(id: number): Promise<{
  id: number;
  name: string;
  sprite_url: string;
  generation: string;
} | null> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) {
      console.error(`Failed to fetch Pokemon ${id}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const generation = getGenerationForPokemon(id);
    const spriteUrl = getEarliestSprite(data.sprites, generation);

    if (!spriteUrl) {
      console.warn(`No sprite found for Pokemon ${id} (${data.name})`);
      return null;
    }

    return {
      id: data.id,
      name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
      sprite_url: spriteUrl,
      generation,
    };
  } catch (error) {
    console.error(`Error fetching Pokemon ${id}:`, error);
    return null;
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAllPokemon(): Promise<void> {
  console.log(`Fetching ${TOTAL_POKEMON} Pokemon...`);
  const pokemon: any[] = [];

  for (let i = 1; i <= TOTAL_POKEMON; i += BATCH_SIZE) {
    const batchEnd = Math.min(i + BATCH_SIZE - 1, TOTAL_POKEMON);
    console.log(`Fetching batch ${i}-${batchEnd}...`);

    const batchPromises: Promise<any>[] = [];
    for (let j = i; j <= batchEnd; j++) {
      batchPromises.push(
        sleep((j - i) * DELAY_MS).then(() => fetchPokemon(j))
      );
    }

    const batchResults = await Promise.all(batchPromises);
    const validResults = batchResults.filter((p) => p !== null);
    pokemon.push(...validResults);

    console.log(`  Got ${validResults.length} Pokemon (total: ${pokemon.length})`);

    // Small delay between batches
    if (batchEnd < TOTAL_POKEMON) {
      await sleep(500);
    }
  }

  // Sort by ID
  pokemon.sort((a, b) => a.id - b.id);

  // Save to file
  const outputPath = join(process.cwd(), 'data', 'pokemon.json');
  writeFileSync(outputPath, JSON.stringify(pokemon, null, 2));
  console.log(`\nSaved ${pokemon.length} Pokemon to ${outputPath}`);

  // Print some stats
  const byGen: Record<string, number> = {};
  for (const p of pokemon) {
    byGen[p.generation] = (byGen[p.generation] || 0) + 1;
  }
  console.log('\nPokemon per generation:');
  for (const [gen, count] of Object.entries(byGen).sort()) {
    console.log(`  ${gen}: ${count}`);
  }
}

fetchAllPokemon().catch(console.error);
