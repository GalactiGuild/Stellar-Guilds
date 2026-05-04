import type { ComponentType } from 'react'
import { Crown, Eye, Shield, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export type RoleBadgeRole = 'owner' | 'admin' | 'auditor' | 'member'

interface RoleBadgeProps {
  role: RoleBadgeRole
  className?: string
}

const roleConfig: Record<
  RoleBadgeRole,
  {
    label: string
    icon: ComponentType<{ className?: string }>
    className: string
  }
> = {
  owner: {
    label: 'Owner',
    icon: Crown,
    className:
      'border-violet-400/40 bg-violet-500/15 text-violet-200 shadow-[0_0_18px_rgba(167,139,250,0.20)]',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    className:
      'border-amber-400/50 bg-amber-500/15 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.25)]',
  },
  auditor: {
    label: 'Auditor',
    icon: Eye,
    className:
      'border-cyan-400/45 bg-cyan-500/15 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.18)]',
  },
  member: {
    label: 'Member',
    icon: User,
    className: 'border-slate-500/40 bg-slate-800/70 text-slate-200',
  },
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none transition-colors',
        config.className,
        className
      )}
      title={config.label}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="hidden min-[360px]:inline">{config.label}</span>
    </span>
  )
}

export type { RoleBadgeProps }
