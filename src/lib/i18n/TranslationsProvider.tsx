/**
 * Translations Cache Provider
 * 번역 데이터를 전역으로 캐시하여 페이지 이동 시 깜빡임 방지
 */

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type TranslationCache = Record<string, any>;

interface TranslationsContextType {
  cache: TranslationCache;
  setCache: (locale: string, namespace: string, data: any) => void;
  getCache: (locale: string, namespace: string) => any | undefined;
}

const TranslationsContext = createContext<TranslationsContextType | null>(null);

interface TranslationsProviderProps {
  children: ReactNode;
  initialCache?: TranslationCache;
}

export function TranslationsProvider({
  children,
  initialCache = {}
}: TranslationsProviderProps) {
  const [cache, setCacheState] = useState<TranslationCache>(initialCache);

  const setCache = (locale: string, namespace: string, data: any) => {
    const key = `${locale}:${namespace}`;
    setCacheState(prev => ({
      ...prev,
      [key]: data
    }));
  };

  const getCache = (locale: string, namespace: string): any | undefined => {
    const key = `${locale}:${namespace}`;
    return cache[key];
  };

  return (
    <TranslationsContext.Provider value={{ cache, setCache, getCache }}>
      {children}
    </TranslationsContext.Provider>
  );
}

export function useTranslationsCache(): TranslationsContextType {
  const context = useContext(TranslationsContext);
  if (!context) {
    throw new Error('useTranslationsCache must be used within TranslationsProvider');
  }
  return context;
}
