import React from 'react';
import NextLink from 'next/link';
import { theme } from '@/styles/theme';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, separator = '/' }) => {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.sm,
        fontSize: theme.typography.fontSize.sm,
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <NextLink
                href={item.href}
                style={{
                  color: theme.colors.text.secondary,
                  textDecoration: 'none',
                  transition: theme.transitions.fast,
                }}
              >
                {item.label}
              </NextLink>
            ) : (
              <span
                style={{
                  color: isLast ? theme.colors.text.primary : theme.colors.text.secondary,
                  fontWeight: isLast ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal,
                }}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <span style={{ color: theme.colors.text.secondary, userSelect: 'none' }}>{separator}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
