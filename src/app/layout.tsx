import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { GenerationFilterProvider } from "@/contexts/GenerationFilterContext";

export const metadata: Metadata = {
  title: "PokeRate - Rate Your Favorite Pokemon",
  description: "Vote for your favorite Pokemon in head-to-head matchups. Elo-based rankings powered by the community.",
  keywords: ["Pokemon", "ranking", "Elo", "voting", "Game Boy"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-gb-darkest">
        <GenerationFilterProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <footer className="border-t-4 border-gb-dark bg-gb-darkest py-4 px-4">
            <div className="flex flex-col items-center gap-2">
              <p className="font-pixel text-[8px] text-gb-dark text-center">
                Pokemon data from PokeAPI. Not affiliated with Nintendo or The Pokemon Company.
              </p>
              <a
                href="https://github.com/connormdoane/pokerate"
                target="_blank"
                rel="noopener noreferrer"
                className="font-pixel text-[8px] text-gb-dark hover:text-gb-light transition-colors"
              >
                GitHub
              </a>
            </div>
          </footer>
        </GenerationFilterProvider>
      </body>
    </html>
  );
}
