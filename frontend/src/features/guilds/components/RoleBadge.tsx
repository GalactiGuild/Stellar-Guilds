'use client'

import { RoleBadge as UiRoleBadge } from '@/components/ui/RoleBadge'
import type { GuildRole } from '../types'

interface RoleBadgeProps {
  role: GuildRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return <UiRoleBadge role={role} />
}
