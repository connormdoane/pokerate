import LeaderboardTable from "@/components/LeaderboardTable";

export const metadata = {
  title: "Leaderboard - PokeRate",
  description: "See the top-ranked Pokemon based on community votes.",
};

export default function LeaderboardPage() {
  return (
    <div className="flex-1 flex flex-col items-center px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-pixel text-xl sm:text-2xl text-gb-lightest mb-2">
          Pokemon League
        </h1>
        <p className="font-pixel text-[8px] sm:text-[10px] text-gb-light">
          Rankings based on community votes
        </p>
      </div>

      <div className="w-full max-w-4xl">
        <LeaderboardTable />
      </div>
    </div>
  );
}
