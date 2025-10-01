'use client';

import React from 'react';
import { theme } from '@/styles/theme';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (currentPage - half < 1) {
      end = Math.min(totalPages, end + (half - currentPage + 1));
    }
    if (currentPage + half > totalPages) {
      start = Math.max(1, start - (currentPage + half - totalPages));
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.sm,
      }}
    >
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          backgroundColor: 'transparent',
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borderRadius.sm,
          color: currentPage === 1 ? theme.colors.text.secondary : theme.colors.text.primary,
          fontSize: theme.typography.fontSize.sm,
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          transition: theme.transitions.fast,
          opacity: currentPage === 1 ? 0.5 : 1,
        }}
      >
        Previous
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                color: theme.colors.text.secondary,
              }}
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: isActive ? theme.colors.primary.main : 'transparent',
              border: `1px solid ${isActive ? theme.colors.primary.main : theme.colors.border.primary}`,
              borderRadius: theme.borderRadius.sm,
              color: isActive ? theme.colors.text.white : theme.colors.text.primary,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: isActive ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal,
              cursor: 'pointer',
              transition: theme.transitions.fast,
              minWidth: '36px',
            }}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          backgroundColor: 'transparent',
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borderRadius.sm,
          color: currentPage === totalPages ? theme.colors.text.secondary : theme.colors.text.primary,
          fontSize: theme.typography.fontSize.sm,
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          transition: theme.transitions.fast,
          opacity: currentPage === totalPages ? 0.5 : 1,
        }}
      >
        Next
      </button>
    </div>
  );
};
