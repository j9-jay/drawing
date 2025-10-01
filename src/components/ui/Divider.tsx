import React from 'react';
import { theme } from '@/styles/theme';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'gradient';

interface DividerProps {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  spacing?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  className?: string;
}

const spacingStyles = {
  horizontal: {
    sm: `${theme.spacing.md} 0`,
    md: `${theme.spacing.xl} 0`,
    lg: `${theme.spacing['2xl']} 0`,
  },
  vertical: {
    sm: `0 ${theme.spacing.md}`,
    md: `0 ${theme.spacing.xl}`,
    lg: `0 ${theme.spacing['2xl']}`,
  },
};

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  spacing = 'md',
  style,
  className,
}) => {
  const isHorizontal = orientation === 'horizontal';

  const baseStyle: React.CSSProperties = {
    margin: spacingStyles[orientation][spacing],
    border: 'none',
    ...(isHorizontal
      ? {
          width: '100%',
          height: '1px',
        }
      : {
          width: '1px',
          height: '100%',
          display: 'inline-block',
        }),
  };

  const variantStyle: React.CSSProperties =
    variant === 'solid'
      ? { backgroundColor: theme.colors.border.primary }
      : variant === 'dashed'
      ? {
          backgroundImage: isHorizontal
            ? `linear-gradient(to right, ${theme.colors.border.primary} 50%, transparent 50%)`
            : `linear-gradient(to bottom, ${theme.colors.border.primary} 50%, transparent 50%)`,
          backgroundSize: isHorizontal ? '8px 1px' : '1px 8px',
          backgroundRepeat: isHorizontal ? 'repeat-x' : 'repeat-y',
        }
      : {
          background: isHorizontal
            ? `linear-gradient(to right, transparent, ${theme.colors.border.primary}, transparent)`
            : `linear-gradient(to bottom, transparent, ${theme.colors.border.primary}, transparent)`,
        };

  return (
    <hr
      style={{
        ...baseStyle,
        ...variantStyle,
        ...style,
      }}
      className={className}
    />
  );
};
