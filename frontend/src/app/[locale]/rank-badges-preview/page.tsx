'use client'

import { RankBadge, RankBadgeShowcase } from '@/components/ui/RankBadge'

export default function RankBadgesPreviewPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Reputation Rank Badges
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            CSS-animated badge icons for different reputation rank tiers. 
            These small badges (24x24px) fit perfectly next to usernames as social proof.
          </p>
        </div>

        {/* Main Showcase */}
        <RankBadgeShowcase />

        {/* Detailed Breakdown */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white text-center">
            Tier Details
          </h2>

          {/* Novice Tier */}
          <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800/50">
            <div className="flex items-start gap-6">
              <RankBadge tier="novice" size={64} />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Novice
                </h3>
                <p className="text-slate-400 mb-4">
                  Simple silver/slate border design. Perfect for new users starting their journey.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Border:</span>
                    <span className="text-slate-300">2px solid slate-400</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Background:</span>
                    <span className="text-slate-300">Gradient from slate-100 to slate-300</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Animation:</span>
                    <span className="text-slate-300">None (static)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expert Tier */}
          <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800/50">
            <div className="flex items-start gap-6">
              <RankBadge tier="expert" size={64} />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Expert
                </h3>
                <p className="text-slate-400 mb-4">
                  Gold border with a slow pulsating glow effect. Recognizes experienced contributors.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Border:</span>
                    <span className="text-slate-300">2px solid yellow-500</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Background:</span>
                    <span className="text-slate-300">Gradient from yellow-100 to amber-300</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Animation:</span>
                    <span className="text-slate-300">Pulsating glow (2s ease-in-out infinite)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Master Tier */}
          <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800/50">
            <div className="flex items-start gap-6">
              <RankBadge tier="master" size={64} />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Master
                </h3>
                <p className="text-slate-400 mb-4">
                  Iridescent/rainbow border with rotating shimmer effect. The ultimate status symbol.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Border:</span>
                    <span className="text-slate-300">Conic-gradient (rainbow spectrum)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Background:</span>
                    <span className="text-slate-300">Gradient from purple-100 to indigo-200</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Animation:</span>
                    <span className="text-slate-300">Rotating border (3s linear) + Shimmer overlay (2s ease-in-out)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Size Variants */}
        <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800/50">
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            Size Variants
          </h3>
          <div className="flex items-end justify-center gap-8 flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <RankBadge tier="expert" size={16} />
              <span className="text-xs text-slate-500">16px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RankBadge tier="expert" size={20} />
              <span className="text-xs text-slate-500">20px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RankBadge tier="expert" size={24} />
              <span className="text-xs text-slate-500">24px (Default)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RankBadge tier="expert" size={32} />
              <span className="text-xs text-slate-500">32px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RankBadge tier="expert" size={48} />
              <span className="text-xs text-slate-500">48px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RankBadge tier="expert" size={64} />
              <span className="text-xs text-slate-500">64px</span>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800/50">
          <h3 className="text-xl font-bold text-white mb-6">
            Usage Examples
          </h3>
          
          <div className="space-y-6">
            {/* Example 1: Next to username */}
            <div>
              <p className="text-sm text-slate-400 mb-3">In user profiles and comments:</p>
              <div className="space-y-2 bg-slate-800/30 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <RankBadge tier="novice" size={20} />
                  <span className="text-white font-medium">@newbie_dev</span>
                  <span className="text-slate-500 text-sm">• 2 hours ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <RankBadge tier="expert" size={20} />
                  <span className="text-white font-medium">@pro_builder</span>
                  <span className="text-slate-500 text-sm">• 5 hours ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <RankBadge tier="master" size={20} />
                  <span className="text-white font-medium">@legend_coder</span>
                  <span className="text-slate-500 text-sm">• 1 day ago</span>
                </div>
              </div>
            </div>

            {/* Example 2: In member list */}
            <div>
              <p className="text-sm text-slate-400 mb-3">In guild member lists:</p>
              <div className="space-y-2 bg-slate-800/30 p-4 rounded-lg">
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      S
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">stellar_dev</span>
                        <RankBadge tier="master" size={16} />
                      </div>
                      <p className="text-sm text-slate-500">92 REP</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      C
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">cosmic_builder</span>
                        <RankBadge tier="expert" size={16} />
                      </div>
                      <p className="text-sm text-slate-500">88 REP</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800/50">
          <h3 className="text-xl font-bold text-white mb-4">
            Quick Start
          </h3>
          <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-sm">
            <code className="text-slate-300">{`import { RankBadge } from '@/components/ui/RankBadge'

// Basic usage (24px default size)
<RankBadge tier="novice" />
<RankBadge tier="expert" />
<RankBadge tier="master" />

// Custom size
<RankBadge tier="master" size={32} />

// With label
<RankBadge tier="expert" size={24} showLabel />

// Next to username
<div className="flex items-center gap-2">
  <RankBadge tier="expert" size={20} />
  <span>@username</span>
</div>`}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
