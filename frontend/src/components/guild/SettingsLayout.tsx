'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Settings,
  Users,
  Wallet,
  Plug,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const settingsNavItems: SettingsNavItem[] = [
  { id: 'general', label: 'General', href: '/guilds/[id]/settings/general', icon: <Settings size={18} /> },
  { id: 'members', label: 'Members', href: '/guilds/[id]/settings/members', icon: <Users size={18} /> },
  { id: 'treasury', label: 'Treasury', href: '/guilds/[id]/settings/treasury', icon: <Wallet size={18} /> },
  { id: 'integrations', label: 'Integrations', href: '/guilds/[id]/settings/integrations', icon: <Plug size={18} /> },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
  /** Optional guild name for the header */
  guildName?: string;
}

/**
 * Guild Settings Layout
 *
 * Dashboard shell for Guild Admin management.
 * Persistent left sidebar with navigation links and a central content area.
 * Sidebar collapses into a hamburger menu on mobile (md breakpoint and below).
 */
export function SettingsLayout({
  children,
  guildName = 'Guild Settings',
}: SettingsLayoutProps): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Simple matching for demo — in production this uses route params
    const segment = href.split('/').pop();
    return pathname?.includes(segment ?? '');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 md:static md:translate-x-0 dark:border-gray-800 dark:bg-gray-900',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {guildName}
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1.5 text-gray-400 hover:text-gray-600 md:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1 p-3" aria-label="Settings navigation">
          {settingsNavItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200',
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-gray-100 p-4 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Guild Admin Panel
          </p>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar (mobile hamburger) */}
        <header className="flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {guildName}
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
