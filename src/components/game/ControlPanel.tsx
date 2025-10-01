import React from 'react';
import { theme } from '@/styles/theme';
import { Button } from '@/components/ui';

interface ControlItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'rounded';
}

interface StatItem {
  label: string;
  value: string | number;
}

interface ControlPanelProps {
  controls?: ControlItem[];
  stats?: StatItem[];
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  controls = [],
  stats = [],
  title,
  position = 'bottom',
}) => {
  const isHorizontal = position === 'top' || position === 'bottom';

  return (
    <div
      style={{
        backgroundColor: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        gap: theme.spacing.lg,
        alignItems: isHorizontal ? 'center' : 'stretch',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
    >
      {/* Title */}
      {title && (
        <h3
          style={{
            margin: 0,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary,
            width: isHorizontal ? 'auto' : '100%',
          }}
        >
          {title}
        </h3>
      )}

      {/* Stats */}
      {stats.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.xl,
            flexWrap: 'wrap',
          }}
        >
          {stats.map((stat, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
              <span
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.text.secondary,
                  textTransform: 'uppercase',
                }}
              >
                {stat.label}
              </span>
              <span
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary,
                }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      {controls.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            flexWrap: 'wrap',
          }}
        >
          {controls.map((control, index) => (
            <Button
              key={index}
              variant={control.variant || 'primary'}
              onClick={control.onClick}
              disabled={control.disabled}
            >
              {control.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
