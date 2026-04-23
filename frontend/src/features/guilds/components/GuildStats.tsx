'use client'

import { Users, TrendingUp, Calendar, Award } from 'lucide-react'

interface GuildStatsProps {
  memberCount: number
  reputation: number
  createdAt: string
  tier: string
}

export function GuildStats({ memberCount, reputation, createdAt, tier }: GuildStatsProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-slate-900/40 rounded-lg p-4 border border-slate-800/50">
        <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 mb-1">
          <Users className="w-4 h-4" />
          <span className="text-sm">Members</span>
        </div>
        <p className="text-2xl font-bold text-white">{memberCount}</p>
      </div>

      <div className="bg-slate-900/40 rounded-lg p-4 border border-slate-800/50">
        <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 mb-1">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">Reputation</span>
        </div>
        <p className="text-2xl font-bold text-white">{reputation}</p>
      </div>

      <div className="bg-slate-900/40 rounded-lg p-4 border border-slate-800/50">
        <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 mb-1">
          <Award className="w-4 h-4" />
          <span className="text-sm">Tier</span>
        </div>
        <p className="text-2xl font-bold text-white capitalize">{tier}</p>
      </div>

      <div className="bg-slate-900/40 rounded-lg p-4 border border-slate-800/50">
        <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 mb-1">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Created</span>
        </div>
        <p className="text-sm font-semibold text-white">{formattedDate}</p>
      </div>
    </div>
  )
}
