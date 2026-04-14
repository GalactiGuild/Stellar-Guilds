'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Shield, Eye, User, Crown } from 'lucide-react'

/* ---------- types ---------- */

type GuildRole = 'owner' | 'admin' | 'moderator' | 'auditor' | 'member'

interface RoleBadgeProps {
  role: GuildRole
  /** Show role text label (hidden on very small screens) */
  showLabel?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/* ---------- role config ---------- */

interface RoleConfig {
  label: string
  colorClass: string
  bgClass: string
  borderClass: string
  icon: typeof Shield
}

const ROLE_CONFIG: Record<GuildRole, RoleConfig> = {
  owner: {
    label: 'Owner',
    colorClass: 'text-amber-300',
    bgClass: 'bg-amber-500/15',
    borderClass: 'border-amber-500/30',
    icon: Crown,
  },
  admin: {
    label: 'Admin',
    colorClass: 'text-yellow-300',
    bgClass: 'bg-yellow-500/15',
    borderClass: 'border-yellow-500/30',
    icon: Shield,
  },
  moderator: {
    label: 'Mod',
    colorClass: 'text-blue-300',
    bgClass: 'bg-blue-500/15',
    borderClass: 'border-blue-500/30',
    icon: Shield,
  },
  auditor: {
    label: 'Auditor',
    colorClass: 'text-cyan-400',
    bgClass: 'bg-cyan-500/15',
    borderClass: 'border-cyan-500/30',
    icon: Eye,
  },
  member: {
    label: 'Member',
    colorClass: 'text-slate-400',
    bgClass: 'bg-slate-500/10',
    borderClass: 'border-slate-500/20',
    icon: User,
  },
}

/* ---------- size map ---------- */

const SIZE_STYLES = {
  sm: { container: 'px-1.5 py-0.5 text-[10px] gap-1', iconSize: 'h-3 w-3' },
  md: { container: 'px-2.5 py-1 text-xs gap-1.5', iconSize: 'h-3.5 w-3.5' },
  lg: { container: 'px-3 py-1.5 text-sm gap-2', iconSize: 'h-4 w-4' },
}

/* ---------- component ---------- */

export function RoleBadge({
  role,
  showLabel = true,
  size = 'md',
  className,
}: RoleBadgeProps) {
  const config = ROLE_CONFIG[role]
  const Icon = config.icon
  const sizeStyle = SIZE_STYLES[size]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium whitespace-nowrap',
        config.bgClass,
        config.borderClass,
        config.colorClass,
        sizeStyle.container,
        className
      )}
      title={config.label}
    >
      <Icon className={sizeStyle.iconSize} aria-hidden="true" />
      {/* Hide text on small screens when showLabel is on */}
      <span className={cn(!showLabel && 'hidden sm:inline')}>
        {config.label}
      </span>
    </span>
  )
}

export type { GuildRole }
export default RoleBadge
