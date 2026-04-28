import React from 'react'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  /** Short label shown above the value, e.g. "Open Bounties" */
  title: string
  /** Primary metric to display, e.g. "14" or "$4,200" */
  value: string
  /** Supporting copy shown below the value */
  description: string
  /** Icon rendered in the accent circle. Use a Lucide React icon element. */
  icon: React.ReactNode
  /** Tailwind colour variant that controls the accent ring and icon background */
  accent?: 'gold' | 'violet' | 'teal' | 'rose'
  className?: string
}

const ACCENT_CLASSES: Record<NonNullable<StatCardProps['accent']>, string> = {
  gold:   'bg-yellow-500/10  text-yellow-400  ring-yellow-500/30',
  violet: 'bg-violet-500/10  text-violet-400  ring-violet-500/30',
  teal:   'bg-teal-500/10    text-teal-400    ring-teal-500/30',
  rose:   'bg-rose-500/10    text-rose-400    ring-rose-500/30',
}

/**
 * Generic statistics mini-card for dashboard overview sections.
 *
 * Stacks vertically on mobile and sits in a horizontal row on md+ via
 * the parent grid (e.g. `grid-cols-1 md:grid-cols-4`).
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  accent = 'gold',
  className,
}) => {
  const accentCls = ACCENT_CLASSES[accent]

  return (
    <article
      className={cn(
        'flex items-start gap-4 rounded-xl border border-stellar-slate/20 bg-stellar-lightNavy/60',
        'px-5 py-4 backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-black/20',
        className,
      )}
    >
      {/* Icon bubble */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1',
          accentCls,
        )}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-stellar-slate/70">
          {title}
        </p>
        <p className="mt-0.5 text-2xl font-bold leading-none text-stellar-white">
          {value}
        </p>
        <p className="mt-1 truncate text-xs text-stellar-slate/60">
          {description}
        </p>
      </div>
    </article>
  )
}

export default StatCard
