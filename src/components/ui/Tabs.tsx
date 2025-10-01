'use client';

import React, { useState } from 'react';
import { theme } from '@/styles/theme';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, onChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div style={{ width: '100%' }}>
      {/* Tab Headers */}
      <div
        style={{
          display: 'flex',
          gap: theme.spacing.sm,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? `2px solid ${theme.colors.primary.main}` : '2px solid transparent',
                color: isActive ? theme.colors.text.primary : theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: theme.transitions.fast,
                marginBottom: '-1px',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ padding: `${theme.spacing.xl} 0` }}>{activeContent}</div>
    </div>
  );
};
