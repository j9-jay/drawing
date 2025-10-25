'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SUPPORTED_LOCALES, LOCALE_NAMES, type Locale } from '@/lib/i18n/config';
import { setLocaleCookie } from '@/lib/i18n/cookies';
import { theme } from '@/styles/theme';

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    // Remove current locale from pathname
    // pathname: /ko/about → pathWithoutLocale: /about
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';

    // Create new path with new locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    // Set cookie
    setLocaleCookie(newLocale);

    // Navigate
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          backgroundColor: 'transparent',
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borderRadius.md,
          color: theme.colors.text.primary,
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          cursor: 'pointer',
          transition: theme.transitions.default,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
          e.currentTarget.style.borderColor = theme.colors.border.secondary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = theme.colors.border.primary;
        }}
      >
        <span>🌐</span>
        <span>{LOCALE_NAMES[currentLocale]}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          <path
            d="M2 4L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '200px',
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: theme.colors.background.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius.md,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 1000,
          }}
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                backgroundColor:
                  locale === currentLocale
                    ? theme.colors.background.secondary
                    : 'transparent',
                border: 'none',
                borderBottom: `1px solid ${theme.colors.border.primary}`,
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.sm,
                fontWeight:
                  locale === currentLocale
                    ? theme.typography.fontWeight.medium
                    : theme.typography.fontWeight.normal,
                textAlign: 'left',
                cursor: 'pointer',
                transition: theme.transitions.fast,
              }}
              onMouseEnter={(e) => {
                if (locale !== currentLocale) {
                  e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
                }
              }}
              onMouseLeave={(e) => {
                if (locale !== currentLocale) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{LOCALE_NAMES[locale]}</span>
              {locale === currentLocale && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M13 4L6 11L3 8"
                    stroke={theme.colors.primary.main}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
