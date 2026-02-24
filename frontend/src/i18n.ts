import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Define the supported locales
export const locales = ['en', 'ar', 'he', 'fr', 'es', 'de', 'zh', 'ja'] as const;

// Define the default locale
export const defaultLocale = 'en';

// Type for locale
export type Locale = typeof locales[number];

// Check if a locale is RTL
export const isRtlLocale = (locale: Locale): boolean => {
  return ['ar', 'he'].includes(locale);
};

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is supported
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});