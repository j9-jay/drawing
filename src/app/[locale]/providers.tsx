/**
 * Client Component Providers
 * 서버 컴포넌트(layout)와 클라이언트 컴포넌트의 경계를 명확히 분리
 */

'use client';

import { ReactNode } from 'react';
import { TranslationsProvider } from '@/lib/i18n/TranslationsProvider';
import { ToastProvider } from '@/components/ui';

interface ProvidersProps {
  children: ReactNode;
  initialCache?: Record<string, any>;
}

export function Providers({ children, initialCache }: ProvidersProps) {
  return (
    <TranslationsProvider initialCache={initialCache}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </TranslationsProvider>
  );
}
