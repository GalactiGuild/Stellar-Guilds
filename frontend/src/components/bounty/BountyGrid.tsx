'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface BountyGridProps {
  children: React.ReactNode
  className?: string
}

/**
 * BountyGrid - Responsive grid layout for bounty cards.
 *
 * Breakpoints:
 *   - < 640px (mobile):  1 column
 *   - ≥ 768px (tablet):  2 columns
 *   - ≥1024px (desktop): 3 columns
 *   - ≥1280px (wide):    4 columns
 */
export default function BountyGrid({ children, className }: BountyGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
        className
      )}
    >
      {children}
    </div>
  )
}
