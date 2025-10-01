import React from 'react';
import { theme } from '@/styles/theme';
import { Container, ContainerSize } from './Container';

interface SectionProps {
  children: React.ReactNode;
  containerSize?: ContainerSize;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  background?: 'primary' | 'secondary' | 'transparent';
  style?: React.CSSProperties;
  className?: string;
}

const spacingStyles = {
  sm: `${theme.spacing.xl} 0`,
  md: `${theme.spacing['2xl']} 0`,
  lg: `${theme.spacing['3xl']} 0`,
  xl: `${theme.spacing['4xl']} 0`,
};

const backgroundStyles = {
  primary: theme.colors.background.primary,
  secondary: theme.colors.background.secondary,
  transparent: 'transparent',
};

export const Section: React.FC<SectionProps> = ({
  children,
  containerSize = 'lg',
  spacing = 'lg',
  background = 'transparent',
  style,
  className,
}) => {
  return (
    <section
      style={{
        padding: spacingStyles[spacing],
        backgroundColor: backgroundStyles[background],
        ...style,
      }}
      className={className}
    >
      <Container size={containerSize}>{children}</Container>
    </section>
  );
};
