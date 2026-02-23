import { useLocale as useNextLocale } from 'next-intl';
import { Locale, isRtlLocale } from '@/i18n';

export function useLocale() {
  const locale = useNextLocale();
  const isRTL = isRtlLocale(locale as Locale);

  return {
    locale,
    isRTL,
    direction: isRTL ? 'rtl' : 'ltr' as 'ltr' | 'rtl',
  };
}