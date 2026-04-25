'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Gem, Shield, Star, Trophy, X } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export type BadgeTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface BadgeAchievement {
  id: string;
  title: string;
  date: string;
}

export interface BadgeDetail {
  tier: BadgeTier;
  title: string;
  description: string; // markdown
  achievements: BadgeAchievement[];
}

const TIER_ICONS: Record<BadgeTier, React.ElementType> = {
  Bronze: Shield,
  Silver: Shield,
  Gold: Star,
  Platinum: Trophy,
  Diamond: Gem,
};

const TIER_COLORS: Record<BadgeTier, string> = {
  Bronze: 'text-stone-400',
  Silver: 'text-slate-300',
  Gold: 'text-yellow-400',
  Platinum: 'text-cyan-400',
  Diamond: 'text-fuchsia-400',
};

const TIER_GLOW: Record<BadgeTier, string> = {
  Bronze: '',
  Silver: '',
  Gold: 'drop-shadow-[0_0_12px_rgba(234,179,8,0.6)]',
  Platinum: 'drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]',
  Diamond: 'drop-shadow-[0_0_16px_rgba(217,70,239,0.7)]',
};

interface BadgeDetailModalProps {
  badge: BadgeDetail | null;
  onClose: () => void;
}

export function BadgeDetailModal({ badge, onClose }: BadgeDetailModalProps) {
  const Icon = badge ? TIER_ICONS[badge.tier] : Shield;
  const colorClass = badge ? TIER_COLORS[badge.tier] : '';
  const glowClass = badge ? TIER_GLOW[badge.tier] : '';

  return (
    <AnimatePresence>
      {badge && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="badge-modal-title"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Close badge detail"
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Animated badge icon */}
              <div className="flex flex-col items-center pt-10 pb-6 px-6 bg-slate-800/40">
                <motion.div
                  initial={{ scale: 0.5, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
                >
                  <Icon className={`w-20 h-20 ${colorClass} ${glowClass}`} />
                </motion.div>
                <h2 id="badge-modal-title" className={`mt-4 text-2xl font-bold ${colorClass}`}>
                  {badge.title}
                </h2>
              </div>

              {/* Description */}
              <div className="px-6 py-4 prose prose-invert prose-sm max-w-none text-slate-300">
                <ReactMarkdown>{badge.description}</ReactMarkdown>
              </div>

              {/* Recent Achievements */}
              {badge.achievements.length > 0 && (
                <div className="px-6 pb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                    Recent Achievements
                  </h3>
                  <ul className="space-y-2">
                    {badge.achievements.map((a) => (
                      <li key={a.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{a.title}</span>
                        <span className="text-slate-500 text-xs">{a.date}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Demo trigger component ────────────────────────────────────────────────────

const MOCK_BADGE: BadgeDetail = {
  tier: 'Gold',
  title: 'Master Contributor',
  description: `**Awarded to top contributors** who have consistently delivered high-quality work across multiple bounties.\n\nThis badge unlocks:\n- Access to **premium bounties** with higher rewards\n- Increased reputation multiplier (+15%)\n- Priority placement in guild searches`,
  achievements: [
    { id: '1', title: 'Completed 10 bounties', date: 'Apr 2026' },
    { id: '2', title: 'Earned 1,000 XP', date: 'Mar 2026' },
    { id: '3', title: 'First guild leadership role', date: 'Feb 2026' },
  ],
};

export function BadgeTriggerDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`${TIER_COLORS['Gold']} hover:opacity-80 transition-opacity`}
        aria-label="View badge details"
      >
        <Star className="w-8 h-8" />
      </button>
      <BadgeDetailModal badge={open ? MOCK_BADGE : null} onClose={() => setOpen(false)} />
    </>
  );
}
