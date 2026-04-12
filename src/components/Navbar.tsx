'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Vote' },
    { href: '/leaderboard', label: 'Rankings' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="w-full border-b-4 border-gb-dark bg-gb-darkest">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="font-pixel text-lg sm:text-xl text-gb-lightest hover:text-gb-light transition-colors">
            PokeRate
          </Link>

          {/* Navigation links */}
          <div className="flex gap-2 sm:gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  font-pixel text-[8px] sm:text-[10px] px-3 py-2
                  border-2 transition-all
                  ${
                    pathname === link.href
                      ? 'bg-gb-light text-gb-darkest border-gb-lightest'
                      : 'bg-gb-dark text-gb-lightest border-gb-dark hover:border-gb-light'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
