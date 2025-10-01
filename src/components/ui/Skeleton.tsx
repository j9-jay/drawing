import React from 'react';
import { theme } from '@/styles/theme';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width = '100%',
  height,
  style,
}) => {
  const defaultHeight = variant === 'text' ? '1em' : variant === 'circular' ? '40px' : '200px';

  return (
    <div
      style={{
        width,
        height: height || defaultHeight,
        backgroundColor: theme.colors.background.secondary,
        borderRadius:
          variant === 'circular'
            ? theme.borderRadius.round
            : variant === 'text'
            ? theme.borderRadius.sm
            : theme.borderRadius.md,
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style,
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export const SkeletonGroup: React.FC<{ count?: number; gap?: string }> = ({
  count = 3,
  gap = theme.spacing.md,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} />
      ))}
    </div>
  );
};
