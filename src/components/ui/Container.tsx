import React from 'react';
import { theme } from '@/styles/theme';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ContainerProps {
  children: React.ReactNode;
  size?: ContainerSize;
  style?: React.CSSProperties;
  className?: string;
}

const sizeStyles: Record<ContainerSize, React.CSSProperties> = {
  sm: { maxWidth: '640px' },
  md: { maxWidth: '768px' },
  lg: { maxWidth: '1024px' },
  xl: { maxWidth: '1280px' },
  full: { maxWidth: '100%' },
};

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  style,
  className,
}) => {
  return (
    <div
      style={{
        ...sizeStyles[size],
        margin: '0 auto',
        padding: `0 ${theme.spacing.xl}`,
        width: '100%',
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
};
