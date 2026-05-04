'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Coins, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { RelativeTime } from '@/components/ui'

export type BountyStatus = 'open' | 'in-progress' | 'completed' | 'expired'

interface BountyCardProps {
  title: string
  reward: {
    amount: number
    currency: string
  }
  deadline: string
  status: BountyStatus
  isLoading?: boolean
  onClick?: () => void
}

const statusConfig: Record<BountyStatus, { label: string; colorClass: string }> = {
  open: { label: 'Open', colorClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'in-progress': { label: 'In Progress', colorClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  completed: { label: 'Completed', colorClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  expired: { label: 'Expired', colorClass: 'bg-slate-950 text-white0/20 text-slate-400 border-slate-500/30' },
}

function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  
  // Handle unknown currencies
  try {
    return formatter.format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`
  }
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-slate-700/50 rounded w-3/4 mb-3" />
      <div className="flex items-center gap-4 mb-4">
        <div className="h-5 bg-slate-700/50 rounded w-24" />
        <div className="h-5 bg-slate-700/50 rounded w-20" />
      </div>
      <div className="h-5 bg-slate-700/50 rounded w-16" />
    </div>
  )
}

export default function BountyCard({
  title,
  reward,
  deadline,
  status,
  isLoading = false,
  onClick,
}: BountyCardProps) {
  const statusInfo = statusConfig[status]
  const isExpired = status === 'expired'
  const isClickable = onClick && !isExpired

  if (isLoading) {
    return (
      <div className="relative p-5 rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <Skeleton />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={isClickable ? { y: -4 } : undefined}
      transition={{ duration: 0.3 }}
      className={clsx(
        'relative p-5 rounded-xl border backdrop-blur-sm transition-all duration-300',
        isExpired
          ? 'border-slate-700/30 bg-slate-800/20 opacity-60'
          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50 hover:bg-slate-800/50',
        isClickable && 'cursor-pointer hover:shadow-lg hover:shadow-violet-500/10'
      )}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Status badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={twMerge(
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
            statusInfo.colorClass
          )}
        >
          {statusInfo.label}
        </span>
        {isClickable && (
          <ChevronRight className="w-4 h-4 text-slate-500" />
        )}
      </div>

      {/* Title */}
      <h3 className={clsx(
        'text-lg font-semibold mb-4 line-clamp-2',
        isExpired ? 'text-slate-400' : 'text-white'
      )}>
        {title}
      </h3>

      {/* Reward and Deadline */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Coins className={clsx('w-4 h-4', isExpired ? 'text-slate-500' : 'text-violet-400')} />
          <span className={clsx('font-medium', isExpired ? 'text-slate-500' : 'text-violet-400')}>
            {formatCurrency(reward.amount, reward.currency)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className={clsx('w-4 h-4', isExpired ? 'text-slate-500' : 'text-slate-400')} />
          <RelativeTime date={deadline} className="text-slate-400" />
        </div>
      </div>

      {/* Gradient overlay on hover */}
      {isClickable && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
    </motion.div>
  )
}