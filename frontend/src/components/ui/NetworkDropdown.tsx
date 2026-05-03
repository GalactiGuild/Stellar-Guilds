'use client'

import React, { useMemo, useState } from 'react'
import { AlertTriangle, ChevronDown, Globe2 } from 'lucide-react'
import { StellarNetwork } from '@/lib/wallet/types'
import { getNetworkConfig } from '@/lib/wallet/network'
import { useWalletStore } from '@/store/walletStore'
import { cn } from '@/lib/utils'

const NETWORK_OPTIONS: Array<{ value: StellarNetwork.MAINNET | StellarNetwork.TESTNET; label: string }> = [
  { value: StellarNetwork.TESTNET, label: 'Testnet' },
  { value: StellarNetwork.MAINNET, label: 'Mainnet' },
]

export interface NetworkDropdownProps {
  isActionInProgress?: boolean
  className?: string
}

export function NetworkDropdown({ isActionInProgress = false, className }: NetworkDropdownProps) {
  const network = useWalletStore((state) => state.network)
  const status = useWalletStore((state) => state.status)
  const switchNetwork = useWalletStore((state) => state.switchNetwork)
  const [pendingNetwork, setPendingNetwork] = useState<StellarNetwork.MAINNET | StellarNetwork.TESTNET | null>(null)

  const currentNetwork = network === StellarNetwork.MAINNET ? StellarNetwork.MAINNET : StellarNetwork.TESTNET
  const config = useMemo(() => getNetworkConfig(currentNetwork), [currentNetwork])
  const showConfirmation = Boolean(pendingNetwork)
  const shouldWarnBeforeSwitch = isActionInProgress || status === 'connected'

  const requestSwitch = (nextNetwork: StellarNetwork.MAINNET | StellarNetwork.TESTNET) => {
    if (nextNetwork === currentNetwork) return

    if (shouldWarnBeforeSwitch) {
      setPendingNetwork(nextNetwork)
      return
    }

    switchNetwork(nextNetwork)
  }

  const confirmSwitch = () => {
    if (!pendingNetwork) return
    switchNetwork(pendingNetwork)
    setPendingNetwork(null)
  }

  return (
    <>
      <div className={cn('relative inline-flex flex-col items-end gap-2', className)}>
        {currentNetwork === StellarNetwork.TESTNET && (
          <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.12)]">
            <AlertTriangle size={12} />
            Testnet Active
          </div>
        )}

        <label className="group flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/90 px-3 py-2 text-xs font-bold text-white shadow-xl backdrop-blur">
          <Globe2 size={14} className={currentNetwork === StellarNetwork.TESTNET ? 'text-amber-300' : 'text-emerald-300'} />
          <span className="sr-only">Stellar network</span>
          <select
            value={currentNetwork}
            onChange={(event) => requestSwitch(event.target.value as StellarNetwork.MAINNET | StellarNetwork.TESTNET)}
            className="appearance-none bg-transparent pr-6 text-xs font-black uppercase tracking-widest outline-none"
            aria-label="Select Stellar network"
          >
            {NETWORK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-950 text-white">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none -ml-6 text-slate-400" />
        </label>

        <p className="max-w-[260px] rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-right text-[10px] text-slate-400 shadow-xl backdrop-blur">
          RPC: <span className="text-slate-200">{config.sorobanRpcUrl}</span>
        </p>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-slate-950 p-6 text-white shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-300">
              <AlertTriangle size={22} />
            </div>
            <h2 className="text-xl font-black tracking-tight">Switch Stellar network?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              You may be connected or in the middle of an action. Switching to{' '}
              <span className="font-bold text-white">
                {pendingNetwork === StellarNetwork.MAINNET ? 'Mainnet' : 'Testnet'}
              </span>{' '}
              changes the global Horizon/Soroban endpoints used by wallet flows.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingNetwork(null)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-200 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSwitch}
                className="flex-1 rounded-2xl bg-amber-400 px-4 py-3 text-xs font-black uppercase tracking-widest text-black hover:bg-amber-300"
              >
                Switch to {pendingNetwork === StellarNetwork.MAINNET ? 'Mainnet' : 'Testnet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
