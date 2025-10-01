import React from 'react';
import { Button, Heading, Text } from '@/components/ui';
import { theme } from '@/styles/theme';

interface HeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryCta?: {
    text: string;
    onClick?: () => void;
  };
  secondaryCta?: {
    text: string;
    onClick?: () => void;
  };
  centered?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  description,
  primaryCta = { text: 'Get Started' },
  secondaryCta,
  centered = true,
}) => {
  return (
    <section
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${theme.spacing['4xl']} ${theme.spacing.xl}`,
        backgroundColor: theme.colors.background.primary,
        textAlign: centered ? 'center' : 'left',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.xl,
          alignItems: centered ? 'center' : 'flex-start',
        }}
      >
        {/* Subtitle Badge */}
        {subtitle && (
          <div
            style={{
              display: 'inline-flex',
              padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
              backgroundColor: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borderRadius.full,
            }}
          >
            <Text
              variant="secondary"
              style={{
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.medium,
              }}
            >
              {subtitle}
            </Text>
          </div>
        )}

        {/* Title */}
        <Heading
          level="h1"
          style={{
            maxWidth: '800px',
            background: `linear-gradient(to bottom, ${theme.colors.text.primary}, ${theme.colors.text.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {title}
        </Heading>

        {/* Description */}
        {description && (
          <Text
            variant="secondary"
            style={{
              maxWidth: '600px',
              fontSize: theme.typography.fontSize.md,
            }}
          >
            {description}
          </Text>
        )}

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.lg,
            marginTop: theme.spacing.lg,
            flexWrap: 'wrap',
            justifyContent: centered ? 'center' : 'flex-start',
          }}
        >
          {primaryCta && (
            <Button variant="primary" onClick={primaryCta.onClick}>
              {primaryCta.text}
            </Button>
          )}
          {secondaryCta && (
            <Button variant="secondary" onClick={secondaryCta.onClick}>
              {secondaryCta.text}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
