import React from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

type SupportedToken = "XLM" | "USDC";

export type TokenBalances = Partial<Record<SupportedToken, string | number>>;

export interface TokenBalanceCardProps {
  balances: TokenBalances;
  isLoading?: boolean;
  className?: string;
}

const TOKEN_META: Record<SupportedToken, { name: string; accent: string; icon: React.ReactNode }> = {
  XLM: {
    name: "Stellar Lumens",
    accent: "from-violet-500/20 to-sky-500/10 text-violet-300",
    icon: <XlmIcon />,
  },
  USDC: {
    name: "USD Coin",
    accent: "from-blue-500/20 to-cyan-500/10 text-blue-300",
    icon: <UsdcIcon />,
  },
};

const formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 7,
});

function formatTokenAmount(value: string | number): string {
  const rawValue = typeof value === "number" ? value.toString() : value.trim();
  const normalizedValue = rawValue.replace(/,/g, "");
  const [integerPart, decimalPart = ""] = normalizedValue.split(".");

  if (!/^\d+$/.test(integerPart) || (decimalPart && !/^\d+$/.test(decimalPart))) {
    return rawValue;
  }

  const formattedInteger = formatter.format(Number(integerPart)).split(".")[0];
  const trimmedDecimal = decimalPart.slice(0, 7).padEnd(2, "0");

  return `${formattedInteger}.${trimmedDecimal}`;
}

export function TokenBalanceCard({ balances, isLoading = false, className }: TokenBalanceCardProps) {
  const tokens = Object.keys(TOKEN_META) as SupportedToken[];

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-violet-500/20 bg-slate-900/80 p-5 text-white shadow-[0_0_40px_rgba(139,92,246,0.08)]",
        className,
      )}
      aria-busy={isLoading}
    >
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10 mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-violet-400">
            Wallet Balance
          </p>
          <h3 className="mt-1 text-lg font-black tracking-tight text-white">
            Available Assets
          </h3>
        </div>
        <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-violet-300">
          Mock
        </div>
      </div>

      <div className="relative z-10 space-y-3">
        {tokens.map((token) => (
          <div
            key={token}
            className={cn(
              "flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-gradient-to-r p-4",
              TOKEN_META[token].accent,
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/30 ring-1 ring-white/10">
                {TOKEN_META[token].icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white">{token}</p>
                <p className="truncate text-[10px] font-medium text-slate-400">
                  {TOKEN_META[token].name}
                </p>
              </div>
            </div>

            {isLoading ? (
              <Skeleton className="h-6 w-24 bg-white/10" />
            ) : (
              <p className="text-right font-mono text-lg font-black tabular-nums text-white">
                {formatTokenAmount(balances[token] ?? "0")}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function XlmIcon() {
  return (
    <svg viewBox="0 0 32 32" role="img" aria-label="Stellar XLM" className="h-6 w-6">
      <circle cx="16" cy="16" r="15" fill="#7C3AED" opacity="0.18" />
      <path
        d="M7.2 18.5 24.8 9.6M7.2 22.4l17.6-8.9M10.6 24.2l10.8-5.5M10.6 13.3l10.8-5.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.3"
      />
    </svg>
  );
}

function UsdcIcon() {
  return (
    <svg viewBox="0 0 32 32" role="img" aria-label="USD Coin" className="h-6 w-6">
      <circle cx="16" cy="16" r="14" fill="#2563EB" />
      <circle cx="16" cy="16" r="10" fill="none" stroke="white" strokeWidth="1.8" opacity="0.75" />
      <path
        d="M16 8.5v15M19.5 12.3c-.8-1-2-1.4-3.5-1.4-1.8 0-3 .9-3 2.3 0 3.5 6.8 1.5 6.8 5.5 0 1.6-1.3 2.7-3.8 2.7-1.8 0-3.2-.6-4-1.8"
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
