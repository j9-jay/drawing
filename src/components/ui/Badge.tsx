import React from 'react';
import { theme } from '@/styles/theme';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: React.CSSProperties;
  className?: string;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    backgroundColor: theme.colors.background.secondary,
    color: theme.colors.text.secondary,
    border: `1px solid ${theme.colors.border.primary}`,
  },
  primary: {
    backgroundColor: `${theme.colors.primary.main}20`,
    color: theme.colors.primary.light,
    border: `1px solid ${theme.colors.primary.main}40`,
  },
  secondary: {
    backgroundColor: 'transparent',
    color: theme.colors.text.tertiary,
    border: `1px solid ${theme.colors.border.secondary}`,
  },
  success: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: 'rgb(34, 197, 94)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
  warning: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    color: 'rgb(251, 191, 36)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
  },
};

const sizeStyles: Record<BadgeSize, React.CSSProperties> = {
  sm: {
    fontSize: '11px',
    padding: `2px ${theme.spacing.sm}`,
  },
  md: {
    fontSize: theme.typography.fontSize.xs,
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
  },
  lg: {
    fontSize: theme.typography.fontSize.sm,
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  style,
  className,
}) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: theme.borderRadius.full,
        fontWeight: theme.typography.fontWeight.medium,
        transition: theme.transitions.fast,
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      className={className}
    >
      {children}
    </span>
  );
};
