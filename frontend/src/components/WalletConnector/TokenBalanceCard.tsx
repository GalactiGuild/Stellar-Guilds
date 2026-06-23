'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type SupportedToken = 'XLM' | 'USDC'
type BalanceValue = number | string

export interface TokenBalanceCardProps {
    balances: Partial<Record<SupportedToken, BalanceValue>>
    loading?: boolean
    className?: string
}

const TOKENS: Array<{
    symbol: SupportedToken
    label: string
    accent: string
    icon: React.ReactNode
}> = [
    {
        symbol: 'XLM',
        label: 'Stellar Lumens',
        accent: 'text-gold-400',
        icon: (
            <svg viewBox="0 0 32 32" aria-hidden="true" className="h-5 w-5">
                <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
                <path
                    d="M9 19.6 23 12.4M9 14.4 23 7.2M9 24.8l14-7.2"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                />
            </svg>
        ),
    },
    {
        symbol: 'USDC',
        label: 'USD Coin',
        accent: 'text-sky-400',
        icon: (
            <svg viewBox="0 0 32 32" aria-hidden="true" className="h-5 w-5">
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
                <path
                    d="M12.5 20.1c.8 1 2 1.5 3.5 1.5 1.8 0 3.2-.9 3.2-2.3 0-1.5-1.4-2-3.2-2.4-1.9-.4-3.2-1-3.2-2.5 0-1.4 1.3-2.4 3.2-2.4 1.3 0 2.4.4 3.1 1.2M16 9.8v2.1M16 21.7v2.1"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                />
            </svg>
        ),
    },
]

const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
})

function parseBalance(value: BalanceValue | undefined): number | null {
    if (value === undefined || value === '') return null
    const normalized = typeof value === 'string' ? value.replace(/,/g, '') : value
    const numeric = Number(normalized)

    return Number.isFinite(numeric) ? numeric : null
}

function formatBalance(value: BalanceValue | undefined): string {
    const numeric = parseBalance(value)

    if (numeric === null) return '0.00'
    return formatter.format(numeric)
}

function BalanceSkeleton() {
    return (
        <div className="space-y-3" aria-hidden="true">
            {TOKENS.map((token) => (
                <div
                    key={token.symbol}
                    className="flex items-center justify-between rounded-lg border border-stellar-lightNavy/70 p-3"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 animate-pulse rounded-full bg-stellar-navy" />
                        <div className="space-y-2">
                            <div className="h-3 w-16 animate-pulse rounded bg-stellar-navy" />
                            <div className="h-2.5 w-24 animate-pulse rounded bg-stellar-navy" />
                        </div>
                    </div>
                    <div className="h-4 w-20 animate-pulse rounded bg-stellar-navy" />
                </div>
            ))}
        </div>
    )
}

export function TokenBalanceCard({
    balances,
    loading = false,
    className,
}: TokenBalanceCardProps) {
    return (
        <section
            className={cn(
                'rounded-xl border border-stellar-lightNavy bg-stellar-darkNavy p-4 shadow-card',
                className
            )}
            aria-busy={loading}
        >
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-stellar-white">Wallet Balances</h3>
                    <p className="text-xs text-stellar-slate">Supported Stellar assets</p>
                </div>
                <span className="rounded-full border border-stellar-lightNavy px-2 py-1 text-xs text-stellar-lightSlate">
                    {TOKENS.length} assets
                </span>
            </div>

            {loading ? (
                <BalanceSkeleton />
            ) : (
                <div className="space-y-3">
                    {TOKENS.map((token) => (
                        <div
                            key={token.symbol}
                            className="flex items-center justify-between gap-4 rounded-lg border border-stellar-lightNavy/70 p-3"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <span
                                    className={cn(
                                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stellar-navy',
                                        token.accent
                                    )}
                                >
                                    {token.icon}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-stellar-white">{token.symbol}</p>
                                    <p className="truncate text-xs text-stellar-slate">{token.label}</p>
                                </div>
                            </div>
                            <p className="shrink-0 text-right font-mono text-sm font-semibold text-stellar-white">
                                {formatBalance(balances[token.symbol])}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
