import React from 'react';
import { Link, Button } from '@/components/ui';
import { theme } from '@/styles/theme';

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  logo?: string;
  navItems?: NavItem[];
  ctaText?: string;
  ctaHref?: string;
  fixed?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  logo = 'Logo',
  navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
    { label: 'Blog', href: '/blog' },
  ],
  ctaText = 'Get Started',
  ctaHref = '#',
  fixed = true,
}) => {
  return (
    <nav
      style={{
        position: fixed ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.background.header,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.colors.border.primary}`,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link href="/" variant="default" style={{ fontWeight: theme.typography.fontWeight.medium }}>
          {logo}
        </Link>

        {/* Nav Items */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
          }}
        >
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} variant="default">
              {item.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Button variant="primary">{ctaText}</Button>
      </div>
    </nav>
  );
};
