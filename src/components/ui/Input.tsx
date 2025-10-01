import React from 'react';
import { theme } from '@/styles/theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const inputStyle: React.CSSProperties = {
  fontSize: theme.typography.fontSize.base,
  fontWeight: theme.typography.fontWeight.normal,
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  borderRadius: theme.borderRadius.sm,
  backgroundColor: 'transparent',
  border: `1px solid ${theme.colors.border.primary}`,
  color: theme.colors.text.primary,
  outline: 'none',
  transition: theme.transitions.fast,
  width: '100%',
};

export const Input: React.FC<InputProps> = ({
  label,
  style,
  ...props
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
      {label && (
        <label
          style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.tertiary,
          }}
        >
          {label}
        </label>
      )}
      <input
        style={{ ...inputStyle, ...style }}
        {...props}
      />
    </div>
  );
};
