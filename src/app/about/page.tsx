export const metadata = {
  title: "About - PokeRate",
  description: "Learn how PokeRate works and the Elo rating system behind it.",
};

export default function AboutPage() {
  return (
    <div className="flex-1 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <h1 className="font-pixel text-xl sm:text-2xl text-gb-lightest mb-8 text-center">
          About PokeRate
        </h1>

        <div className="space-y-6">
          {/* How it works */}
          <section className="gb-screen p-6">
            <h2 className="font-pixel text-sm text-gb-lightest mb-4">
              How It Works
            </h2>
            <div className="space-y-3 text-sm text-gb-light leading-relaxed">
              <p>
                PokeRate shows you two random Pokemon and asks: which one do you prefer?
                Your vote affects both Pokemon&apos;s Elo rating.
              </p>
              <p>
                The more votes a Pokemon wins, the higher it climbs on the leaderboard.
                But beating a high-ranked Pokemon gives more points than beating a low-ranked one.
              </p>
            </div>
          </section>

          {/* Elo System */}
          <section className="gb-screen p-6">
            <h2 className="font-pixel text-sm text-gb-lightest mb-4">
              The Elo System
            </h2>
            <div className="space-y-3 text-sm text-gb-light leading-relaxed">
              <p>
                The Elo rating system was originally designed for chess rankings.
                Each Pokemon starts with a rating of 1500.
              </p>
              <p>
                When Pokemon A beats Pokemon B, we calculate the &quot;expected&quot; outcome
                based on their ratings. If the underdog wins, they gain more points.
                If the favorite wins, they gain fewer points.
              </p>
              <p className="font-mono text-xs bg-gb-darkest p-3 rounded">
                New Rating = Old Rating + K * (Actual - Expected)
              </p>
            </div>
          </section>

          {/* Credits */}
          <section className="gb-screen p-6">
            <h2 className="font-pixel text-sm text-gb-lightest mb-4">
              Credits
            </h2>
            <div className="space-y-3 text-sm text-gb-light">
              <p>
                Pokemon data and sprites from{" "}
                <a
                  href="https://pokeapi.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gb-lightest underline hover:text-gb-light"
                >
                  PokeAPI
                </a>
              </p>
              <p>
                Pokemon is a trademark of Nintendo, Game Freak, and The Pokemon Company.
                This is a fan project and is not affiliated with or endorsed by them.
              </p>
            </div>
          </section>

          {/* Tech Stack */}
          <section className="gb-screen p-6">
            <h2 className="font-pixel text-sm text-gb-lightest mb-4">
              Built With
            </h2>
            <ul className="text-sm text-gb-light space-y-1">
              <li>Next.js 14</li>
              <li>Tailwind CSS</li>
              <li>Supabase (PostgreSQL)</li>
              <li>Vercel</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
