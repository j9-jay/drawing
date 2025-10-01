import React from 'react';
import { theme } from '@/styles/theme';

export type CardVariant = 'default' | 'hover' | 'bordered';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: React.CSSProperties;
  onClick?: () => void;
  className?: string;
}

const baseStyle: React.CSSProperties = {
  backgroundColor: theme.colors.background.secondary,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.xl,
  transition: theme.transitions.medium,
};

const variantStyles: Record<CardVariant, React.CSSProperties> = {
  default: {
    border: `1px solid ${theme.colors.border.primary}`,
  },
  hover: {
    border: `1px solid ${theme.colors.border.primary}`,
    cursor: 'pointer',
  },
  bordered: {
    border: `1px solid ${theme.colors.border.secondary}`,
  },
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  onClick,
  className,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const hoverStyle: React.CSSProperties =
    variant === 'hover' && isHovered
      ? {
          borderColor: theme.colors.border.tertiary,
          transform: 'translateY(-2px)',
        }
      : {};

  return (
    <div
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...hoverStyle,
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      {children}
    </div>
  );
};
