'use client'

import { twMerge } from 'tailwind-merge'

export type RankTier = 'novice' | 'expert' | 'master'

interface RankBadgeProps {
  tier: RankTier
  size?: number
  className?: string
  showLabel?: boolean
}

const tierLabels: Record<RankTier, string> = {
  novice: 'Novice',
  expert: 'Expert',
  master: 'Master'
}

/**
 * RankBadge - CSS-animated badge icons for different reputation rank tiers
 * 
 * Features:
 * - Novice: Simple silver/slate border
 * - Expert: Gold border with slow pulsating glow
 * - Master: Iridescent/rainbow border with rotating shimmer effect
 */
export function RankBadge({ 
  tier, 
  size = 24, 
  className = '',
  showLabel = false 
}: RankBadgeProps) {
  const badgeSize = `${size}px`

  return (
    <div className={twMerge('inline-flex items-center gap-2', className)}>
      {/* Badge Container */}
      <div
        className="relative flex-shrink-0"
        style={{ width: badgeSize, height: badgeSize }}
      >
        {/* Novice Tier - Simple silver/slate border */}
        {tier === 'novice' && (
          <div className="absolute inset-0 rounded-full border-2 border-slate-400 bg-gradient-to-br from-slate-100 to-slate-300 shadow-sm">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                width={size * 0.5}
                height={size * 0.5}
                viewBox="0 0 24 24"
                fill="none"
                className="text-slate-600"
              >
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Expert Tier - Gold border with pulsating glow */}
        {tier === 'expert' && (
          <>
            {/* Pulsating glow effect */}
            <div className="absolute inset-0 rounded-full bg-yellow-500/30 animate-pulse-glow" />
            
            {/* Gold border with gradient */}
            <div className="absolute inset-0 rounded-full border-2 border-yellow-500 bg-gradient-to-br from-yellow-100 via-yellow-200 to-amber-300 shadow-md shadow-yellow-500/30">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width={size * 0.5}
                  height={size * 0.5}
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-yellow-700"
                >
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
          </>
        )}

        {/* Master Tier - Iridescent/rainbow border with rotating shimmer */}
        {tier === 'master' && (
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {/* Rotating iridescent border using conic-gradient */}
            <div className="absolute inset-[-2px] rounded-full animate-rotate-shimmer">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)'
                }}
              />
            </div>
            
            {/* Inner badge */}
            <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width={size * 0.5}
                  height={size * 0.5}
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-purple-700"
                >
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>

            {/* Shimmer overlay effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-overlay" />
          </div>
        )}
      </div>

      {/* Optional Label */}
      {showLabel && (
        <span className="text-xs font-medium text-slate-300">
          {tierLabels[tier]}
        </span>
      )}
    </div>
  )
}

/**
 * RankBadgeShowcase - Displays all three badge tiers side-by-side for comparison
 */
export function RankBadgeShowcase() {
  const tiers: RankTier[] = ['novice', 'expert', 'master']

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white text-center">
        Reputation Rank Badges
      </h2>
      
      <div className="flex items-center justify-center gap-8 flex-wrap">
        {tiers.map((tier) => (
          <div key={tier} className="flex flex-col items-center gap-3">
            <RankBadge tier={tier} size={48} />
            <span className="text-sm font-medium text-slate-300 capitalize">
              {tier}
            </span>
          </div>
        ))}
      </div>

      {/* Inline usage example */}
      <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-800/50">
        <h3 className="text-sm font-medium text-slate-400 mb-4">
          Usage Example (next to usernames):
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <RankBadge tier="novice" size={20} />
            <span className="text-white text-sm">@newbie_dev</span>
          </div>
          <div className="flex items-center gap-2">
            <RankBadge tier="expert" size={20} />
            <span className="text-white text-sm">@pro_builder</span>
          </div>
          <div className="flex items-center gap-2">
            <RankBadge tier="master" size={20} />
            <span className="text-white text-sm">@legend_coder</span>
          </div>
        </div>
      </div>
    </div>
  )
}
