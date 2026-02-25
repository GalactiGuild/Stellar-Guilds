'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ChevronDown, Languages } from 'lucide-react';
import { locales, type Locale } from '@/i18n';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';

// Map locale codes to readable names
const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  he: 'עברית',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
};

// Flag emojis for each locale
const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  ar: '🇸🇦',
  he: '🇮🇱',
  fr: '🇫🇷',
  es: '🇪🇸',
  de: '🇩🇪',
  zh: '🇨🇳',
  ja: '🇯🇵',
};

export default function LanguageSelector() {
  const currentLocale = useLocale() as Locale;

  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering (to prevent hydration errors)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Render nothing on the server
  }

  const handleChangeLocale = (newLocale: Locale) => {
    // Store the selected locale in localStorage for persistence
    localStorage.setItem('preferred-locale', newLocale);

    // Reload the page with the new locale
    window.location.href = `/${newLocale}${window.location.pathname.substring(3)}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Languages className="w-4 h-4" />
          <span>{localeFlags[currentLocale]}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleChangeLocale(locale)}
            className={`flex items-center gap-2 ${currentLocale === locale ? 'bg-accent' : ''}`}
          >
            <span>{localeFlags[locale]}</span>
            <span>{localeNames[locale]}</span>
            {currentLocale === locale && (
              <span className="ml-auto text-xs text-muted-foreground">• Current</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}