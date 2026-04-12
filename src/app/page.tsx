import VoteContainer from "@/components/VoteContainer";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-pixel text-xl sm:text-2xl text-gb-lightest mb-2">
          Who&apos;s the Best?
        </h1>
        <p className="font-pixel text-[8px] sm:text-[10px] text-gb-light">
          Choose your favorite Pokemon
        </p>
      </div>

      <VoteContainer />
    </div>
  );
}
