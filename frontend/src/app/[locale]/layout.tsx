import type { Metadata } from "next";
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { locales, defaultLocale, type Locale } from '@/i18n';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { getDirection } from "@/lib/i18n/utils";

export const metadata: Metadata = {
  title: "Stellar Guilds",
  description: "User Profile & Reputation Dashboard",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  let locale = resolvedParams.locale;

  // Validate that the incoming locale is supported
  if (!locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  const messages = await getMessages();
  const direction = getDirection(locale as Locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ErrorBoundary>
        <div
          dir={direction}
          className="min-h-screen flex flex-col bg-white dark:bg-stellar-navy text-gray-900 dark:text-stellar-white font-sans transition-colors duration-300"
        >
          {children}
        </div>
      </ErrorBoundary>
    </NextIntlClientProvider>
  );
}

// Generate static params for all supported locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
