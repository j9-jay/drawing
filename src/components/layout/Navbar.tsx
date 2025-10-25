'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui';
import { MobileNav } from './MobileNav';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';
import { isValidLocale, type Locale } from '@/lib/i18n/config';

export function Navbar() {
  const pathname = usePathname();

  // Extract locale from pathname (e.g., /ko/about → ko)
  const pathSegments = pathname.split('/').filter(Boolean);
  const maybeLocale = pathSegments[0];
  const locale = isValidLocale(maybeLocale) ? (maybeLocale as Locale) : 'en';

  // Nav items with locale prefix
  const navItems = [
    { href: `/${locale}/about`, label: locale === 'ko' ? '소개' : 'About' },
    {
      href: `/${locale}/pinball`,
      label: locale === 'ko' ? '핀볼게임' : 'Pinball',
    },
    {
      href: `/${locale}/roulette`,
      label: locale === 'ko' ? '룰렛게임' : 'Roulette',
    },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{
        borderBottomColor: 'var(--border)',
        backgroundColor: 'var(--header-bg)',
      }}
    >
      <div className="flex h-16 items-center px-6">
        <Link href={`/${locale}`} className="flex items-center space-x-2">
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

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher currentLocale={locale} />
          <Button variant="secondary" className="transition-colors">
            {locale === 'ko' ? '로그인' : 'Log in'}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden ml-auto flex items-center gap-2">
          <LanguageSwitcher currentLocale={locale} />
          <MobileNav items={navItems} />
        </div>
      </div>
    </header>
  );
}
