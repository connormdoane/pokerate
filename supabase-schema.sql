-- PokeRate Database Schema
-- Run this in Supabase SQL Editor (SQL Editor > New Query)

-- Pokemon table: stores Pokemon data and Elo ratings
create table pokemon (
  id int primary key,              -- National dex number
  name text not null,
  sprite_url text not null,
  elo int default 1500,            -- Starting Elo
  wins int default 0,
  losses int default 0,
  updated_at timestamptz default now()
);

-- Votes table: records every vote for analytics
create table votes (
  id uuid primary key default gen_random_uuid(),
  winner_id int references pokemon(id),
  loser_id int references pokemon(id),
  created_at timestamptz default now(),
  session_id text                  -- Anonymous session tracking
);

-- Index for faster leaderboard queries
create index idx_pokemon_elo on pokemon(elo desc);

-- Index for vote analytics
create index idx_votes_created_at on votes(created_at);

-- Enable Row Level Security (RLS)
alter table pokemon enable row level security;
alter table votes enable row level security;

-- Allow public read access to pokemon
create policy "Pokemon are viewable by everyone"
  on pokemon for select
  using (true);

-- Allow public insert on votes (anonymous voting)
create policy "Anyone can vote"
  on votes for insert
  with check (true);

-- Allow public read on votes (for analytics)
create policy "Votes are viewable by everyone"
  on votes for select
  using (true);

-- Allow public updates to pokemon (for Elo rating changes)
create policy "Pokemon elo can be updated"
  on pokemon for update
  using (true)
  with check (true);

-- Function to update pokemon stats after a vote
create or replace function update_pokemon_after_vote()
returns trigger as $$
begin
  -- Update winner
  update pokemon
  set wins = wins + 1, updated_at = now()
  where id = new.winner_id;

  -- Update loser
  update pokemon
  set losses = losses + 1, updated_at = now()
  where id = new.loser_id;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-update win/loss counts
create trigger on_vote_inserted
  after insert on votes
  for each row
  execute function update_pokemon_after_vote();
