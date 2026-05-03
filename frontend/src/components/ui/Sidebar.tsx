'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, PanelLeftClose, PanelLeftOpen, Settings, Shield, UserRound, UsersRound } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'stellar-guilds-sidebar-collapsed'

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Guilds', href: '/guilds', icon: UsersRound },
  { label: 'Profile', href: '/profile/settings', icon: UserRound },
  { label: 'Settings', href: '/profile/security', icon: Settings },
]

export interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const locale = pathname?.split('/').filter(Boolean)[0] || 'en'

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setIsCollapsed(stored === 'true')
    }
  }, [])

  const toggleCollapsed = () => {
    setIsCollapsed((current) => {
      const next = !current
      window.localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  const toLocalizedHref = (href: string) => `/${locale}${href === '/' ? '' : href}`

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 88 : 256 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className={cn(
          'fixed left-4 top-4 z-40 hidden h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/90 p-3 text-white shadow-2xl shadow-black/30 backdrop-blur-xl md:flex',
          className,
        )}
        aria-label="Primary navigation"
      >
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500 text-black">
            <Shield size={20} />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-tight">Stellar Guilds</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-300">Workspace</p>
            </div>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const localizedHref = toLocalizedHref(item.href)
            const isActive = pathname === localizedHref || pathname?.startsWith(`${localizedHref}/`)
            const Icon = item.icon

            return (
              <Link
                key={item.label}
                href={localizedHref}
                className={cn(
                  'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition-all',
                  isActive
                    ? 'bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.12)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                  isCollapsed && 'justify-center',
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={19} className="shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={toggleCollapsed}
          className={cn(
            'mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-black text-slate-300 transition-all hover:bg-white/10 hover:text-white',
            isCollapsed && 'justify-center',
          )}
          aria-pressed={isCollapsed}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </motion.aside>

      <nav
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 gap-1 rounded-[24px] border border-white/10 bg-slate-950/95 p-2 text-white shadow-2xl shadow-black/40 backdrop-blur-xl md:hidden"
        aria-label="Primary navigation"
      >
        {NAV_ITEMS.map((item) => {
          const localizedHref = toLocalizedHref(item.href)
          const isActive = pathname === localizedHref || pathname?.startsWith(`${localizedHref}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.label}
              href={localizedHref}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-black transition-all',
                isActive ? 'bg-violet-500 text-black' : 'text-slate-400 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
