import React from 'react';
import NextLink from 'next/link';
import { theme } from '@/styles/theme';

export type LinkVariant = 'default' | 'primary' | 'secondary';

interface LinkProps {
  href: string;
  variant?: LinkVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const variantStyles: Record<LinkVariant, React.CSSProperties> = {
  default: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text.primary,
    textDecoration: 'none',
    padding: `0 ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'transparent',
    transition: theme.transitions.fast,
    display: 'inline-block',
  },
  primary: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.white,
    textDecoration: 'none',
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    borderRadius: theme.borderRadius.none,
    backgroundColor: theme.colors.primary.main,
    transition: theme.transitions.button,
    display: 'inline-block',
  },
  secondary: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    textDecoration: 'none',
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'transparent',
    transition: theme.transitions.fast,
    display: 'inline-block',
  },
};

export const Link: React.FC<LinkProps> = ({
  href,
  variant = 'default',
  children,
  style,
}) => {
  return (
    <NextLink
      href={href}
      style={{ ...variantStyles[variant], ...style }}
    >
      {children}
    </NextLink>
  );
};
