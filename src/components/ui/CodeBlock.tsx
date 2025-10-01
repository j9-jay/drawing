'use client';

import React, { useState } from 'react';
import { theme } from '@/styles/theme';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'javascript',
  showLineNumbers = true,
  title,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div
      style={{
        backgroundColor: theme.colors.background.primary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      {(title || language) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            backgroundColor: theme.colors.background.secondary,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            {title && (
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.primary,
                  fontWeight: theme.typography.fontWeight.medium,
                }}
              >
                {title}
              </span>
            )}
            <span
              style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.secondary,
                textTransform: 'uppercase',
              }}
            >
              {language}
            </span>
          </div>
          <button
            onClick={handleCopy}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: copied ? theme.colors.primary.main : theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.xs,
              cursor: 'pointer',
              padding: theme.spacing.xs,
              transition: theme.transitions.fast,
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {/* Code Content */}
      <div style={{ overflowX: 'auto' }}>
        <pre
          style={{
            margin: 0,
            padding: theme.spacing.lg,
            fontSize: theme.typography.fontSize.sm,
            lineHeight: '1.6',
            color: theme.colors.text.primary,
            fontFamily: "'Fira Code', 'Monaco', 'Courier New', monospace",
          }}
        >
          {showLineNumbers ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        color: theme.colors.text.secondary,
                        paddingRight: theme.spacing.lg,
                        textAlign: 'right',
                        userSelect: 'none',
                        minWidth: '2em',
                      }}
                    >
                      {index + 1}
                    </td>
                    <td style={{ paddingLeft: theme.spacing.md }}>
                      <code>{line}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
};
