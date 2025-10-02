import React from 'react';
import { theme } from '@/styles/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'rounded';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    padding: `0 ${theme.spacing.lg}`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.text.white,
    border: 'none',
    cursor: 'pointer',
    transition: theme.transitions.button,
    height: '36px',
  },
  secondary: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    padding: `0 ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'transparent',
    color: theme.colors.text.secondary,
    border: 'none',
    cursor: 'pointer',
    transition: theme.transitions.button,
    height: '36px',
  },
  rounded: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.normal,
    padding: `0 ${theme.spacing.xl}`,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.secondary,
    color: theme.colors.text.primary,
    border: 'none',
    cursor: 'pointer',
    height: '44px',
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  style,
  ...props
}) => {
  return (
    <button
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
};
