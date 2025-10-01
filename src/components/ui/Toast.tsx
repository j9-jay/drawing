'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { theme } from '@/styles/theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const toastColors: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: {
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.3)',
    text: 'rgb(34, 197, 94)',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.3)',
    text: 'rgb(239, 68, 68)',
  },
  warning: {
    bg: 'rgba(251, 191, 36, 0.15)',
    border: 'rgba(251, 191, 36, 0.3)',
    text: 'rgb(251, 191, 36)',
  },
  info: {
    bg: `${theme.colors.primary.main}20`,
    border: `${theme.colors.primary.main}40`,
    text: theme.colors.primary.light,
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: theme.spacing.xl,
          right: theme.spacing.xl,
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.md,
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              backgroundColor: toastColors[toast.type].bg,
              border: `1px solid ${toastColors[toast.type].border}`,
              borderRadius: theme.borderRadius.md,
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              color: toastColors[toast.type].text,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              minWidth: '300px',
              maxWidth: '500px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              animation: 'slideIn 0.2s ease-out',
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
