'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDownUp, Award, Medal, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

type LeaderboardUser = {
  id: string
  displayName: string
  avatarColor: string
  reputationScore: number
  totalBountiesCompleted: number
}

type SortKey = 'reputationScore' | 'totalBountiesCompleted'

const leaderboardUsers: LeaderboardUser[] = [
  { id: 'user-01', displayName: 'Nova Patel', avatarColor: 'from-amber-400 to-orange-500', reputationScore: 9875, totalBountiesCompleted: 42 },
  { id: 'user-02', displayName: 'Orion Vega', avatarColor: 'from-slate-300 to-slate-500', reputationScore: 9340, totalBountiesCompleted: 38 },
  { id: 'user-03', displayName: 'Lyra Chen', avatarColor: 'from-yellow-700 to-orange-900', reputationScore: 8990, totalBountiesCompleted: 35 },
  { id: 'user-04', displayName: 'Mira Sol', avatarColor: 'from-indigo-500 to-purple-600', reputationScore: 8420, totalBountiesCompleted: 34 },
  { id: 'user-05', displayName: 'Kai Morgan', avatarColor: 'from-cyan-500 to-blue-600', reputationScore: 8015, totalBountiesCompleted: 31 },
  { id: 'user-06', displayName: 'Astra Quinn', avatarColor: 'from-pink-500 to-rose-600', reputationScore: 7880, totalBountiesCompleted: 29 },
  { id: 'user-07', displayName: 'Juno Vale', avatarColor: 'from-emerald-500 to-teal-600', reputationScore: 7425, totalBountiesCompleted: 27 },
  { id: 'user-08', displayName: 'Riven Atlas', avatarColor: 'from-violet-500 to-fuchsia-600', reputationScore: 7190, totalBountiesCompleted: 25 },
  { id: 'user-09', displayName: 'Sage Rivera', avatarColor: 'from-blue-500 to-sky-600', reputationScore: 6950, totalBountiesCompleted: 24 },
  { id: 'user-10', displayName: 'Echo Stone', avatarColor: 'from-lime-500 to-green-600', reputationScore: 6725, totalBountiesCompleted: 22 },
  { id: 'user-11', displayName: 'Talia Brooks', avatarColor: 'from-red-500 to-pink-600', reputationScore: 6490, totalBountiesCompleted: 21 },
  { id: 'user-12', displayName: 'Niko Frost', avatarColor: 'from-sky-400 to-cyan-600', reputationScore: 6215, totalBountiesCompleted: 20 },
  { id: 'user-13', displayName: 'Vesper Moon', avatarColor: 'from-purple-400 to-indigo-700', reputationScore: 6040, totalBountiesCompleted: 19 },
  { id: 'user-14', displayName: 'Rune Carter', avatarColor: 'from-stone-500 to-zinc-700', reputationScore: 5890, totalBountiesCompleted: 18 },
  { id: 'user-15', displayName: 'Iris Hale', avatarColor: 'from-teal-400 to-emerald-700', reputationScore: 5710, totalBountiesCompleted: 18 },
  { id: 'user-16', displayName: 'Cassian Reed', avatarColor: 'from-orange-400 to-red-600', reputationScore: 5565, totalBountiesCompleted: 17 },
  { id: 'user-17', displayName: 'Zara Knox', avatarColor: 'from-fuchsia-400 to-purple-700', reputationScore: 5390, totalBountiesCompleted: 16 },
  { id: 'user-18', displayName: 'Atlas Noor', avatarColor: 'from-blue-600 to-indigo-800', reputationScore: 5215, totalBountiesCompleted: 16 },
  { id: 'user-19', displayName: 'Pax Wilder', avatarColor: 'from-lime-400 to-emerald-600', reputationScore: 5080, totalBountiesCompleted: 15 },
  { id: 'user-20', displayName: 'Elio Park', avatarColor: 'from-amber-500 to-yellow-700', reputationScore: 4925, totalBountiesCompleted: 15 },
  { id: 'user-21', displayName: 'Rhea Kim', avatarColor: 'from-rose-400 to-red-700', reputationScore: 4760, totalBountiesCompleted: 14 },
  { id: 'user-22', displayName: 'Dax Mercer', avatarColor: 'from-cyan-600 to-teal-800', reputationScore: 4635, totalBountiesCompleted: 14 },
  { id: 'user-23', displayName: 'Mina Fox', avatarColor: 'from-indigo-400 to-blue-700', reputationScore: 4510, totalBountiesCompleted: 13 },
  { id: 'user-24', displayName: 'Theo Vale', avatarColor: 'from-violet-600 to-purple-800', reputationScore: 4385, totalBountiesCompleted: 13 },
  { id: 'user-25', displayName: 'Luca Reyes', avatarColor: 'from-green-400 to-lime-700', reputationScore: 4260, totalBountiesCompleted: 12 },
  { id: 'user-26', displayName: 'Nyx Arden', avatarColor: 'from-slate-500 to-slate-800', reputationScore: 4115, totalBountiesCompleted: 12 },
  { id: 'user-27', displayName: 'Aria Wells', avatarColor: 'from-pink-400 to-fuchsia-700', reputationScore: 3980, totalBountiesCompleted: 11 },
  { id: 'user-28', displayName: 'Kian Cross', avatarColor: 'from-yellow-500 to-amber-800', reputationScore: 3845, totalBountiesCompleted: 11 },
  { id: 'user-29', displayName: 'Nia Blake', avatarColor: 'from-sky-500 to-blue-800', reputationScore: 3720, totalBountiesCompleted: 10 },
  { id: 'user-30', displayName: 'Milo Hart', avatarColor: 'from-emerald-400 to-teal-700', reputationScore: 3595, totalBountiesCompleted: 10 },
  { id: 'user-31', displayName: 'Sora Finch', avatarColor: 'from-purple-500 to-pink-700', reputationScore: 3470, totalBountiesCompleted: 9 },
  { id: 'user-32', displayName: 'Leah Storm', avatarColor: 'from-red-400 to-orange-700', reputationScore: 3355, totalBountiesCompleted: 9 },
  { id: 'user-33', displayName: 'Owen Ash', avatarColor: 'from-zinc-500 to-stone-800', reputationScore: 3240, totalBountiesCompleted: 8 },
  { id: 'user-34', displayName: 'Vera Holt', avatarColor: 'from-blue-400 to-cyan-700', reputationScore: 3125, totalBountiesCompleted: 8 },
  { id: 'user-35', displayName: 'Remy Cole', avatarColor: 'from-lime-500 to-green-800', reputationScore: 3010, totalBountiesCompleted: 8 },
  { id: 'user-36', displayName: 'Ayla West', avatarColor: 'from-rose-500 to-pink-800', reputationScore: 2895, totalBountiesCompleted: 7 },
  { id: 'user-37', displayName: 'Idris Lane', avatarColor: 'from-indigo-500 to-violet-800', reputationScore: 2780, totalBountiesCompleted: 7 },
  { id: 'user-38', displayName: 'Lena Quinn', avatarColor: 'from-teal-500 to-cyan-800', reputationScore: 2665, totalBountiesCompleted: 7 },
  { id: 'user-39', displayName: 'Cleo North', avatarColor: 'from-orange-500 to-amber-800', reputationScore: 2550, totalBountiesCompleted: 6 },
  { id: 'user-40', displayName: 'Bryn Ellis', avatarColor: 'from-fuchsia-500 to-rose-800', reputationScore: 2435, totalBountiesCompleted: 6 },
  { id: 'user-41', displayName: 'Ezra Pike', avatarColor: 'from-sky-600 to-indigo-800', reputationScore: 2320, totalBountiesCompleted: 6 },
  { id: 'user-42', displayName: 'Tess Vale', avatarColor: 'from-green-500 to-emerald-800', reputationScore: 2205, totalBountiesCompleted: 5 },
  { id: 'user-43', displayName: 'Finn Ro', avatarColor: 'from-yellow-600 to-orange-800', reputationScore: 2090, totalBountiesCompleted: 5 },
  { id: 'user-44', displayName: 'Mae Orion', avatarColor: 'from-purple-600 to-indigo-900', reputationScore: 1975, totalBountiesCompleted: 5 },
  { id: 'user-45', displayName: 'Hugo Ray', avatarColor: 'from-red-600 to-rose-900', reputationScore: 1860, totalBountiesCompleted: 4 },
  { id: 'user-46', displayName: 'Gia Star', avatarColor: 'from-cyan-500 to-blue-900', reputationScore: 1745, totalBountiesCompleted: 4 },
  { id: 'user-47', displayName: 'Noah Drift', avatarColor: 'from-stone-400 to-slate-700', reputationScore: 1630, totalBountiesCompleted: 4 },
  { id: 'user-48', displayName: 'Skye Moss', avatarColor: 'from-lime-400 to-teal-700', reputationScore: 1515, totalBountiesCompleted: 3 },
  { id: 'user-49', displayName: 'Rosa Beam', avatarColor: 'from-pink-500 to-purple-800', reputationScore: 1400, totalBountiesCompleted: 3 },
  { id: 'user-50', displayName: 'Jett Rowan', avatarColor: 'from-slate-600 to-indigo-900', reputationScore: 1285, totalBountiesCompleted: 3 },
]

const podiumStyles = [
  {
    label: 'Gold',
    icon: Trophy,
    className: 'border-amber-400/60 bg-amber-500/10 shadow-[0_0_24px_rgba(251,191,36,0.18)]',
    badgeClassName: 'bg-amber-400 text-slate-950',
  },
  {
    label: 'Silver',
    icon: Medal,
    className: 'border-slate-300/60 bg-slate-300/10 shadow-[0_0_24px_rgba(203,213,225,0.14)]',
    badgeClassName: 'bg-slate-300 text-slate-950',
  },
  {
    label: 'Bronze',
    icon: Award,
    className: 'border-orange-700/70 bg-orange-700/10 shadow-[0_0_24px_rgba(194,65,12,0.16)]',
    badgeClassName: 'bg-orange-700 text-white',
  },
]

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'reputationScore', label: 'Reputation Score' },
  { key: 'totalBountiesCompleted', label: 'Total Bounties Completed' },
]

const formatNumber = new Intl.NumberFormat('en-US').format

export function Leaderboard() {
  const [sortKey, setSortKey] = useState<SortKey>('reputationScore')

  const sortedUsers = useMemo(() => {
    return [...leaderboardUsers]
      .sort((a, b) => {
        const primary = b[sortKey] - a[sortKey]
        return primary !== 0 ? primary : b.reputationScore - a.reputationScore
      })
      .map((user, index) => ({ ...user, rank: index + 1 }))
  }, [sortKey])

  const visibleUsers = sortedUsers.slice(0, 10)

  return (
    <section className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-6 shadow-xl" aria-labelledby="guild-leaderboard-heading">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">
            Monthly reputation
          </p>
          <h2 id="guild-leaderboard-heading" className="mt-2 text-2xl font-bold text-white">
            Guild Leaderboard
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Top contributors ranked from a 50-user mocked dataset. The top three receive distinct podium styling while ranks 4-10 use compact rows.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Leaderboard sorting options">
          {sortOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSortKey(option.key)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors',
                sortKey === option.key
                  ? 'border-indigo-400 bg-indigo-500/20 text-indigo-100'
                  : 'border-slate-700 bg-slate-950/40 text-slate-300 hover:border-indigo-500 hover:text-white'
              )}
              aria-pressed={sortKey === option.key}
            >
              <ArrowDownUp className="h-4 w-4" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3" role="list" aria-label="Top 10 monthly reputation leaders">
        {visibleUsers.map((user) => {
          const podiumStyle = podiumStyles[user.rank - 1]
          const PodiumIcon = podiumStyle?.icon

          return (
            <motion.article
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              key={user.id}
              role="listitem"
              className={cn(
                'flex items-center gap-4 rounded-xl border border-slate-800/70 bg-slate-950/40 p-4 transition-colors',
                user.rank <= 3 ? podiumStyle?.className : 'hover:border-slate-700'
              )}
            >
              <div className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                user.rank <= 3 ? podiumStyle?.badgeClassName : 'bg-slate-800 text-slate-200'
              )}>
                #{user.rank}
              </div>

              <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base font-bold text-white', user.avatarColor)} aria-hidden="true">
                {user.displayName.split(' ').map((name) => name[0]).join('')}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-semibold text-white">
                    {user.displayName}
                  </h3>
                  {PodiumIcon && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/50 px-2 py-1 text-xs font-medium text-slate-200">
                      <PodiumIcon className="h-3.5 w-3.5" />
                      {podiumStyle.label}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {formatNumber(user.reputationScore)} reputation points
                </p>
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-white">
                  {formatNumber(user.totalBountiesCompleted)}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Bounties
                </p>
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
