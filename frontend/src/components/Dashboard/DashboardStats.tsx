"use client";

import React from 'react'
import { Coins, Gift, Users, Vault } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'

/**
 * Dashboard analytics overview — four statistics mini-cards.
 *
 * Currently uses static placeholder values (Wave 4 requirement).
 * Swap the `value` props for live data once the metrics API is wired up.
 *
 * Closes #351
 */
const DashboardStats: React.FC = () => {
  return (
    <section
      aria-label="Dashboard overview statistics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <StatCard
        title="Total Payouts"
        value="$24,800"
        description="XLM distributed to contributors"
        icon={<Coins size={20} />}
        accent="gold"
      />

      <StatCard
        title="Open Bounties"
        value="14"
        description="Awaiting contributors right now"
        icon={<Gift size={20} />}
        accent="violet"
      />

      <StatCard
        title="Guild Treasury"
        value="$61,250"
        description="Current on-chain escrow balance"
        icon={<Vault size={20} />}
        accent="teal"
      />

      <StatCard
        title="Active Contributors"
        value="37"
        description="Members with at least one payout"
        icon={<Users size={20} />}
        accent="rose"
      />
    </section>
  )
}

export default DashboardStats
