'use client';

import React from 'react';
import { Check, ChevronDown, CircleDollarSign, Coins, Landmark, Plus, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { stellarIssuerSchema } from '@/lib/schemas/stellarAssetSchema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
export { stellarAssetValueSchema, stellarIssuerSchema } from '@/lib/schemas/stellarAssetSchema';

export const STELLAR_ASSETS = [
  {
    code: 'XLM',
    label: 'Native XLM',
    description: 'Network asset',
    icon: Coins,
  },
  {
    code: 'USDC',
    label: 'Stellar USDC',
    description: 'Circle-issued dollar asset',
    icon: CircleDollarSign,
  },
  {
    code: 'EURC',
    label: 'EURC',
    description: 'Euro stablecoin asset',
    icon: Landmark,
  },
] as const;

export type StellarAssetCode = (typeof STELLAR_ASSETS)[number]['code'];

interface AssetSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  id?: string;
  name?: string;
}

export default function AssetSelector({
  value,
  onChange,
  error,
  id = 'asset-selector',
  name = 'asset',
}: AssetSelectorProps) {
  const isKnownAsset = STELLAR_ASSETS.some((asset) => asset.code === value);
  const selectedAsset = STELLAR_ASSETS.find((asset) => asset.code === value);
  const [showCustomAsset, setShowCustomAsset] = React.useState(!isKnownAsset && value.length > 0);
  const [customIssuer, setCustomIssuer] = React.useState(isKnownAsset ? '' : value);

  const customValidation = showCustomAsset ? stellarIssuerSchema.safeParse(customIssuer) : null;

  const customError =
    customValidation && customIssuer.length > 0 && !customValidation.success
      ? customValidation.error.issues[0]?.message
      : undefined;

  const selectAsset = (assetCode: StellarAssetCode) => {
    setShowCustomAsset(false);
    setCustomIssuer('');
    onChange(assetCode);
  };

  const handleCustomIssuerChange = (nextIssuer: string) => {
    const normalizedIssuer = nextIssuer.toUpperCase();
    setCustomIssuer(normalizedIssuer);
    onChange(normalizedIssuer);
  };

  const beginCustomAsset = () => {
    setShowCustomAsset(true);
    setCustomIssuer('');
    onChange('');
  };

  const SelectedIcon = selectedAsset?.icon ?? Plus;

  return (
    <div className="space-y-3">
      <input id={id} name={name} type="hidden" value={value} readOnly />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
              error
                ? 'border-red-500/60 bg-red-500/10'
                : 'border-slate-800/40 bg-white/5 hover:border-slate-700 hover:bg-white/[0.08]'
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400">
              <SelectedIcon size={18} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-white">
                {selectedAsset?.label ?? 'Custom Stellar Asset'}
              </span>
              <span className="block truncate text-xs text-slate-500">
                {selectedAsset?.description ?? (customIssuer || 'Issuer address required')}
              </span>
            </span>
            <ChevronDown size={16} className="text-slate-500" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[var(--radix-dropdown-menu-trigger-width)] border-slate-800 bg-slate-950 p-2 text-slate-200 shadow-xl"
        >
          {STELLAR_ASSETS.map((asset) => {
            const Icon = asset.icon;
            const selected = value === asset.code && !showCustomAsset;

            return (
              <DropdownMenuItem
                key={asset.code}
                onSelect={() => selectAsset(asset.code)}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 focus:bg-violet-500/10 focus:text-white"
              >
                <Icon size={17} className="text-slate-400" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{asset.label}</span>
                  <span className="block text-xs text-slate-500">{asset.description}</span>
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  {asset.code}
                </span>
                {selected && <Check size={16} className="text-violet-300" aria-hidden="true" />}
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuItem
            onSelect={beginCustomAsset}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 focus:bg-violet-500/10 focus:text-white"
          >
            <Plus size={17} className="text-slate-400" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">Add Custom Asset</span>
              <span className="block text-xs text-slate-500">Validate a Stellar issuer address</span>
            </span>
            {showCustomAsset && <Check size={16} className="text-violet-300" aria-hidden="true" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showCustomAsset && (
        <div className="rounded-xl border border-slate-800/40 bg-slate-950/60 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor={`${id}-custom-issuer`} className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Issuer Address
            </label>
            <button
              type="button"
              onClick={() => selectAsset('XLM')}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-300"
            >
              <X size={12} aria-hidden="true" />
              Clear
            </button>
          </div>
          <input
            id={`${id}-custom-issuer`}
            value={customIssuer}
            onChange={(event) => handleCustomIssuerChange(event.target.value)}
            placeholder="G..."
            maxLength={56}
            aria-invalid={!!customError || !!error}
            className={cn(
              'w-full rounded-lg border bg-white/5 px-3 py-2 font-mono text-sm text-white outline-none transition-colors placeholder:text-slate-600',
              customError || error ? 'border-red-500/60 focus:border-red-400' : 'border-slate-800/60 focus:border-violet-500/60'
            )}
          />
          <p className={cn('mt-2 text-xs', customError ? 'text-red-400' : 'text-slate-500')}>
            {customError || 'Custom issuer must be 56 uppercase alphanumeric characters and start with G.'}
          </p>
        </div>
      )}

      {error && !customError && <p className="text-xs font-bold text-red-400">{error}</p>}
    </div>
  );
}
