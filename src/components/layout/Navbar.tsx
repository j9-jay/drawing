'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui';
import { MobileNav } from './MobileNav';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/about', label: '소개' },
  { href: '/pinball', label: '핀볼게임' },
  { href: '/roulette', label: '룰렛게임' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ borderBottomColor: 'var(--border)', backgroundColor: 'var(--header-bg)' }}>
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">Easy-Picky</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2 flex-1 justify-center">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname.startsWith(item.href) ? 'primary' : 'secondary'}
              className={cn('transition-colors')}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        {/* Desktop Log in Button */}
        <div className="hidden md:flex items-center">
          <Button variant="secondary" className="transition-colors">
            Log in
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden ml-auto">
          <MobileNav items={navItems} />
        </div>
      </div>
    </header>
  );
}
