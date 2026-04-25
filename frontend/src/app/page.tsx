import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Stellar Guilds",
    description: "User Profile & Reputation Dashboard",
};

// Redirect to the default locale
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}