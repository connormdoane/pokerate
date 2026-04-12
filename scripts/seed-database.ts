/**
 * Seeds the Supabase database with Pokemon data.
 * Run with: npx tsx scripts/seed-database.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed(): Promise<void> {
  // Read Pokemon data
  const dataPath = join(process.cwd(), 'data', 'pokemon.json');
  let pokemonData: any[];

  try {
    const raw = readFileSync(dataPath, 'utf-8');
    pokemonData = JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to read ${dataPath}`);
    console.error('Run "npx tsx scripts/fetch-pokemon.ts" first to fetch Pokemon data.');
    process.exit(1);
  }

  console.log(`Seeding ${pokemonData.length} Pokemon...`);

  // Transform data for database
  const pokemon = pokemonData.map((p) => ({
    id: p.id,
    name: p.name,
    sprite_url: p.sprite_url,
    elo: 1500,
    wins: 0,
    losses: 0,
  }));

  // Insert in batches of 100
  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < pokemon.length; i += BATCH_SIZE) {
    const batch = pokemon.slice(i, i + BATCH_SIZE);

    const { error } = await supabase.from('pokemon').upsert(batch, {
      onConflict: 'id',
    });

    if (error) {
      console.error(`Error inserting batch ${i}-${i + batch.length}:`, error);
      process.exit(1);
    }

    inserted += batch.length;
    console.log(`  Inserted ${inserted}/${pokemon.length}`);
  }

  console.log(`\nSuccessfully seeded ${inserted} Pokemon!`);
}

seed().catch(console.error);
