import React from 'react';
import { theme } from '@/styles/theme';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4';

interface HeadingProps {
  level: HeadingLevel;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const headingStyles: Record<HeadingLevel, React.CSSProperties> = {
  h1: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: '67.84px',
    color: theme.colors.text.primary,
    margin: 0,
  },
  h2: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    lineHeight: '61.6px',
    color: theme.colors.text.primary,
    margin: 0,
  },
  h3: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: theme.typography.lineHeight.relaxed,
    color: theme.colors.text.primary,
    margin: 0,
  },
  h4: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    lineHeight: theme.typography.lineHeight.tight,
    color: theme.colors.text.tertiary,
    margin: 0,
  },
};

export const Heading: React.FC<HeadingProps> = ({ level, children, style }) => {
  const Tag = level;
  return <Tag style={{ ...headingStyles[level], ...style }}>{children}</Tag>;
};

interface TextProps {
  children: React.ReactNode;
  variant?: 'body' | 'secondary';
  style?: React.CSSProperties;
}

export const Text: React.FC<TextProps> = ({ children, variant = 'body', style }) => {
  const variantStyle: React.CSSProperties =
    variant === 'body'
      ? {
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.normal,
          lineHeight: theme.typography.lineHeight.tight,
          color: theme.colors.text.primary,
        }
      : {
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.normal,
          lineHeight: theme.typography.lineHeight.normal,
          color: theme.colors.text.secondary,
        };

  return <p style={{ ...variantStyle, margin: 0, ...style }}>{children}</p>;
};
