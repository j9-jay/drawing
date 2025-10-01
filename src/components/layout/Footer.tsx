import React from 'react';
import { Link, Text } from '@/components/ui';
import { theme } from '@/styles/theme';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  logo?: string;
  description?: string;
  columns?: FooterColumn[];
  socialLinks?: FooterLink[];
  copyright?: string;
}

export const Footer: React.FC<FooterProps> = ({
  logo = 'Logo',
  description = 'Build better products with Linear Dark theme.',
  columns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Changelog', href: '#changelog' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '#careers' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#docs' },
        { label: 'Support', href: '#support' },
        { label: 'API', href: '#api' },
      ],
    },
  ],
  socialLinks = [
    { label: 'Twitter', href: '#twitter' },
    { label: 'GitHub', href: '#github' },
    { label: 'Discord', href: '#discord' },
  ],
  copyright = '© 2025 Your Company. All rights reserved.',
}) => {
  return (
    <footer
      style={{
        backgroundColor: theme.colors.background.primary,
        borderTop: `1px solid ${theme.colors.border.primary}`,
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: `${theme.spacing['4xl']} ${theme.spacing.xl}`,
        }}
      >
        {/* Top Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: theme.spacing['3xl'],
            marginBottom: theme.spacing['3xl'],
          }}
        >
          {/* Brand Column */}
          <div style={{ maxWidth: '300px' }}>
            <Text
              style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.medium,
                marginBottom: theme.spacing.lg,
              }}
            >
              {logo}
            </Text>
            <Text variant="secondary">{description}</Text>
          </div>

          {/* Link Columns */}
          {columns.map((column) => (
            <div key={column.title}>
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.tertiary,
                  marginBottom: theme.spacing.lg,
                }}
              >
                {column.title}
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                {column.links.map((link) => (
                  <Link key={link.label} href={link.href} variant="secondary">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div
          style={{
            paddingTop: theme.spacing.xl,
            borderTop: `1px solid ${theme.colors.border.primary}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: theme.spacing.lg,
          }}
        >
          <Text variant="secondary" style={{ fontSize: theme.typography.fontSize.sm }}>
            {copyright}
          </Text>

          {/* Social Links */}
          <div style={{ display: 'flex', gap: theme.spacing.lg }}>
            {socialLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                variant="secondary"
                style={{ fontSize: theme.typography.fontSize.sm }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
