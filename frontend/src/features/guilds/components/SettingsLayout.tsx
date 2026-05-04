'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { Menu, Plug, Settings, Users, WalletCards, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

const settingsLinks = [
  { label: 'General', href: '', icon: Settings },
  { label: 'Members', href: '/members', icon: Users },
  { label: 'Treasury', href: '/treasury', icon: WalletCards },
  { label: 'Integrations', href: '/integrations', icon: Plug },
]

export function SettingsLayout({
  children,
  title = 'Guild Settings',
  description = "Manage your guild's configuration, members, treasury, and integrations.",
}: SettingsLayoutProps) {
  const params = useParams()
  const pathname = usePathname()
  const guildId = params.id as string
  const locale = params.locale as string | undefined
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const baseHref = `/guilds/${guildId}/settings`
  const normalizedPathname = locale ? pathname.replace(`/${locale}`, '') : pathname

  const nav = (
    <nav className="space-y-1" aria-label="Guild settings navigation">
      {settingsLinks.map((item) => {
        const href = `${baseHref}${item.href}`
        const Icon = item.icon
        const isActive = item.href === '' ? normalizedPathname === baseHref : normalizedPathname === href

        return (
          <Link
            key={item.label}
            href={href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'border border-indigo-400/40 bg-indigo-500/15 text-white shadow-[0_0_18px_rgba(99,102,241,0.18)]'
                : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="mt-2 max-w-2xl text-slate-400">{description}</p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 md:hidden"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="guild-settings-mobile-nav"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            Menu
          </button>
        </div>

        {isMobileMenuOpen && (
          <div id="guild-settings-mobile-nav" className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 md:hidden">
            {nav}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-3 backdrop-blur md:block">
            {nav}
          </aside>

          <main className="min-w-0" aria-label="Guild settings content">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export type { SettingsLayoutProps }
