---
created: 2026-04-11
updated: 2026-04-11
tags: [planning, project, pokemon-elo]
---

# PokeRate - Project Plan

A "hot or not" style web app where users compare Pokemon head-to-head, with results feeding into an Elo rating system to build a crowdsourced leaderboard.

**Project name:** `pokerate`

## Why This Project?

**Portfolio value:**
- Full-stack: React/Next.js frontend + Supabase backend
- Algorithm implementation: Elo rating system (non-trivial math, real-world application)
- Data handling: Working with external API/dataset (PokeAPI)
- Real-time updates: Leaderboard reflects live community votes
- Clean UX: Simple, engaging interaction pattern

**Resume talking points:**
- "Built a full-stack voting application using Next.js and Supabase"
- "Implemented Elo rating algorithm to rank 1000+ items based on crowdsourced comparisons"
- "Designed efficient database schema for high-write workloads"
- "Deployed production application serving X votes" (fill in after launch)

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | Next.js 14 (App Router) | React + SSR, Vercel-native |
| Styling | Tailwind CSS | Fast iteration, consistent design |
| Backend | Supabase | Postgres + auth + realtime, generous free tier |
| Hosting | Vercel | Zero-config Next.js deploys |
| Pokemon Data | Static JSON (from PokeAPI) | Faster than runtime API calls, more reliable |

---

## Design Direction: Gen 1 / Game Boy Aesthetic

**Goal:** Retro Pokemon feel, not generic "vibecoded" AI-generated look. Should feel like a love letter to the original games.

### Visual Style

**Color palette (Game Boy inspired):**
- Background greens: `#9bbc0f`, `#8bac0f`, `#306230`, `#0f380f`
- Or Pokemon Red/Blue palette: muted reds, blues, cream/off-white
- Avoid pure white/black - use off-white and dark grays

**Typography:**
- Pixel font for headings (e.g., "Press Start 2P" from Google Fonts, or "Pokemon GB" style font)
- Clean readable font for body text (system font stack is fine, or a simple sans-serif)

**UI Elements:**
- Rounded rectangle containers mimicking Game Boy screen frames
- Subtle pixel-art borders or decorations
- Pokemon-style dialog boxes for notifications/toasts
- Button styles reminiscent of menu selections from the games

### Background

**Concept:** Blurred/faded Pallet Town scene or Gen 1 sprites as ambient background

**Implementation options:**
1. Static image: Pallet Town screenshot or pixel art, heavily blurred and darkened as CSS background
2. Subtle sprite collage: Faded Gen 1 sprites scattered/tiled, low opacity
3. Gradient overlay: Dark green gradient with barely-visible sprites underneath

```css
/* Example background approach */
.background {
  background-image:
    linear-gradient(rgba(15, 56, 15, 0.85), rgba(15, 56, 15, 0.95)),
    url('/images/pallet-town.png');
  background-size: cover;
  background-position: center;
}
```

### Component Styling

**MatchupCard:**
- Game Boy screen frame aesthetic
- Pokemon sprite prominently displayed
- Name in pixel font below
- Subtle shadow/glow effect on hover

**Leaderboard:**
- Styled like Pokemon League rankings
- Rank badges (gold/silver/bronze for top 3)
- Pixel-art table borders

**Buttons/interactions:**
- Sound effects optional but impactful (8-bit click sounds)
- Selection highlight mimicking cursor from games
- Subtle animations - nothing too modern/slick

### Assets Needed

- Pallet Town background image (from game or fan recreation)
- Google Font: "Press Start 2P" or similar pixel font
- Optional: 8-bit sound effects for clicks
- Pokemon sprites: Use official sprites from PokeAPI (already included in data)

### Reference

Look at these for inspiration:
- Original Pokemon Red/Blue/Yellow UI
- Pokemon Stadium menus
- Retro Pokemon fan sites from early 2000s

---

## Database Schema (Supabase/Postgres)

### `pokemon` table
Stores Pokemon data and their current Elo ratings.

```sql
create table pokemon (
  id int primary key,              -- National dex number
  name text not null,
  sprite_url text not null,
  elo int default 1500,            -- Starting Elo
  wins int default 0,
  losses int default 0,
  updated_at timestamptz default now()
);
```

### `votes` table
Records every vote for analytics and potential recalculation.

```sql
create table votes (
  id uuid primary key default gen_random_uuid(),
  winner_id int references pokemon(id),
  loser_id int references pokemon(id),
  created_at timestamptz default now(),
  session_id text                  -- Anonymous session tracking (optional)
);

create index idx_votes_created_at on votes(created_at);
```

**Note:** For MVP, votes can be anonymous. Auth can be added later for per-user stats.

---

## Elo Algorithm

The Elo system calculates expected win probability and adjusts ratings based on actual outcomes.

### Formula

```
Expected Score: E_a = 1 / (1 + 10^((R_b - R_a) / 400))

New Rating: R'_a = R_a + K * (S - E_a)

Where:
- R_a, R_b = current ratings of Pokemon A and B
- S = actual score (1 for win, 0 for loss)
- K = adjustment factor (use 32 for standard volatility)
```

### Implementation (TypeScript)

```typescript
const K = 32;

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function updateElo(
  winnerRating: number,
  loserRating: number
): { newWinnerRating: number; newLoserRating: number } {
  const expectedWinner = expectedScore(winnerRating, loserRating);
  const expectedLoser = expectedScore(loserRating, winnerRating);

  return {
    newWinnerRating: Math.round(winnerRating + K * (1 - expectedWinner)),
    newLoserRating: Math.round(loserRating + K * (0 - expectedLoser)),
  };
}
```

---

## API Design

### `GET /api/matchup`
Returns two random Pokemon for comparison.

**Response:**
```json
{
  "pokemon": [
    { "id": 25, "name": "Pikachu", "sprite_url": "...", "elo": 1532 },
    { "id": 94, "name": "Gengar", "sprite_url": "...", "elo": 1487 }
  ]
}
```

**Logic:** Select two random Pokemon. Optionally weight toward similar Elo for more meaningful matchups.

### `POST /api/vote`
Records a vote and updates Elo ratings.

**Request:**
```json
{
  "winnerId": 25,
  "loserId": 94
}
```

**Response:**
```json
{
  "success": true,
  "newRatings": {
    "25": 1547,
    "94": 1472
  }
}
```

**Logic:**
1. Fetch current ratings for both Pokemon
2. Calculate new ratings using Elo formula
3. Update `pokemon` table (ratings, wins/losses)
4. Insert row into `votes` table
5. Return new ratings

### `GET /api/leaderboard`
Returns ranked Pokemon list.

**Query params:** `?limit=50&offset=0&order=desc`

**Response:**
```json
{
  "pokemon": [
    { "rank": 1, "id": 150, "name": "Mewtwo", "elo": 1823, "wins": 412, "losses": 89 },
    ...
  ],
  "total": 1010
}
```

---

## Frontend Pages

### `/` - Vote Page (Home)
The core interaction. Shows two Pokemon side by side, user clicks their favorite.

**Components:**
- `MatchupCard` - Displays a single Pokemon (sprite, name, optionally current Elo)
- `VoteContainer` - Holds two MatchupCards, handles click and fetches next matchup
- `VoteCounter` - Shows "You've voted X times this session" (local state)

**Flow:**
1. Page loads, fetches `/api/matchup`
2. User clicks a Pokemon
3. POST to `/api/vote`
4. Immediately fetch next matchup (optimistic, don't wait for vote response)
5. Optionally show brief "Winner: Pikachu (+15)" toast

### `/leaderboard` - Rankings
Paginated table of all Pokemon sorted by Elo.

**Components:**
- `LeaderboardTable` - Sortable columns (rank, sprite, name, elo, wins, losses, win%)
- `Pagination` - Page controls
- `SearchFilter` - Find specific Pokemon (optional, stretch)

### `/pokemon/[id]` - Pokemon Detail (Stretch)
Stats page for a single Pokemon.

- Current Elo and rank
- Win/loss record
- Recent matchups
- Elo history chart

### `/about` - How It Works
Explains the Elo system, credits PokeAPI, your info.

---

## Component Architecture

```
app/
├── page.tsx                 # Vote page
├── leaderboard/
│   └── page.tsx
├── about/
│   └── page.tsx
├── api/
│   ├── matchup/route.ts
│   ├── vote/route.ts
│   └── leaderboard/route.ts
components/
├── MatchupCard.tsx
├── VoteContainer.tsx
├── LeaderboardTable.tsx
├── Navbar.tsx
└── Footer.tsx
lib/
├── supabase.ts              # Supabase client
├── elo.ts                   # Elo calculation functions
└── pokemon.ts               # Pokemon data helpers
```

---

## Pokemon Data Strategy

**Option A: Static JSON (Recommended for MVP)**
- Download Pokemon data from PokeAPI once
- Store as `data/pokemon.json` in repo
- Seed Supabase from this file
- Pros: Fast, no external dependency at runtime
- Cons: Manual update if new Pokemon release

**Option B: Fetch from PokeAPI at runtime**
- Pros: Always current
- Cons: Rate limits, slower, external dependency

**Recommendation:** Use static JSON. Seed the database during setup. Include all current Pokemon (1000+, all generations).

### Seeding Script

```typescript
// scripts/seed-pokemon.ts
import { createClient } from '@supabase/supabase-js';
import pokemonData from '../data/pokemon.json';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

async function seed() {
  const pokemon = pokemonData.map((p: any) => ({
    id: p.id,
    name: p.name,
    sprite_url: p.sprites.front_default,
    elo: 1500,
    wins: 0,
    losses: 0,
  }));

  const { error } = await supabase.from('pokemon').upsert(pokemon);
  if (error) console.error(error);
  else console.log(`Seeded ${pokemon.length} Pokemon`);
}

seed();
```

---

## MVP Scope

**Must have:**
- [ ] Vote page with two random Pokemon
- [ ] Click to vote, immediately load next matchup
- [ ] Elo ratings update in database
- [ ] Leaderboard page (top 50, pagination)
- [ ] Basic styling (clean, usable)
- [ ] Deployed to Vercel + Supabase

**Nice to have (post-MVP):**
- [ ] Smooth animations on vote
- [ ] "Skip" button for undecided
- [ ] Session vote counter
- [ ] Elo change toast (+15 / -12)
- [ ] Leaderboard search/filter
- [ ] Pokemon detail pages
- [ ] Share functionality ("My top 10")

**Future ideas:**
- [ ] User accounts (track personal rankings)
- [ ] Generation filters (compare only Gen 1, etc.)
- [ ] Type filters
- [ ] Head-to-head lookup (Pikachu vs Charizard stats)
- [ ] Daily/weekly Elo movers
- [ ] Mobile app (React Native)

---

## Implementation Order

### Phase 1: Foundation
1. `npx create-next-app@latest pokerate --typescript --tailwind --app`
2. Create Supabase project
3. Set up environment variables
4. Create database tables
5. Download Pokemon data, create seed script
6. Run seed script

### Phase 2: Core Voting
1. Build `lib/supabase.ts` client
2. Build `lib/elo.ts` with calculation functions
3. Build `GET /api/matchup`
4. Build `POST /api/vote`
5. Build `MatchupCard` component
6. Build `VoteContainer` component
7. Wire up home page

### Phase 3: Leaderboard
1. Build `GET /api/leaderboard`
2. Build `LeaderboardTable` component
3. Build leaderboard page
4. Add navigation

### Phase 4: Polish
1. Loading states
2. Error handling
3. Basic SEO (meta tags, OpenGraph)
4. About page
5. Mobile responsiveness check

### Phase 5: Deploy
1. Push to GitHub
2. Connect Vercel
3. Add environment variables in Vercel
4. Deploy
5. Test production

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx  # Only for seed script, don't expose
```

---

## Potential Interview Questions This Prepares You For

1. **"Walk me through your database schema design"**
   - Normalized tables, indexing strategy, why votes are stored separately

2. **"How does the Elo algorithm work?"**
   - Mathematical explanation, K-factor tradeoffs, handling edge cases

3. **"How would you scale this?"**
   - Read replicas, caching leaderboard, rate limiting votes

4. **"What would you do differently?"**
   - Discuss tradeoffs made for MVP, what you'd add with more time

5. **"How did you handle state management?"**
   - Server state (Supabase), client state (React), optimistic updates

---

## Resources

- [Elo Rating System (Wikipedia)](https://en.wikipedia.org/wiki/Elo_rating_system)
- [PokeAPI](https://pokeapi.co/)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## See Also

- [[projects]] - Project tracker
- [[job-search]] - Why this matters
