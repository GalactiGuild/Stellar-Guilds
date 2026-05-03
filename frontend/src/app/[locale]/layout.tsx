import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { locales, defaultLocale, type Locale } from '@/i18n';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from "next-themes";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

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

  // Get the messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ErrorBoundary>
              <div className="min-h-screen flex flex-col bg-white dark:bg-stellar-navy text-gray-900 dark:text-stellar-white font-sans transition-colors duration-300">
                {children}
              </div>
              <Toaster
                theme="dark"
                position="bottom-right"
                duration={4000}
                richColors
                closeButton
                toastOptions={{
                  classNames: {
                    toast: 'border border-violet-500/20 bg-slate-950 text-white shadow-2xl',
                    title: 'font-black tracking-tight',
                    description: 'text-slate-300',
                  },
                }}
              />
            </ErrorBoundary>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

// Generate static params for all supported locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
