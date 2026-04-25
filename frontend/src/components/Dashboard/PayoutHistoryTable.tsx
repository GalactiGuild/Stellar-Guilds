'use client';

import { useMemo, useState } from 'react';

export type PayoutAsset = 'XLM' | 'USDC';
export type PayoutStatus = 'Completed' | 'Pending' | 'Failed';

export interface Payout {
  id: string;
  date: string; // ISO date string
  recipient: string;
  amount: number;
  asset: PayoutAsset;
  status: PayoutStatus;
}

const MOCK_PAYOUTS: Payout[] = [
  { id: '1', date: '2026-04-01', recipient: 'alice.stellar', amount: 150, asset: 'XLM', status: 'Completed' },
  { id: '2', date: '2026-04-05', recipient: 'bob.stellar', amount: 75, asset: 'USDC', status: 'Pending' },
  { id: '3', date: '2026-04-10', recipient: 'carol.stellar', amount: 200, asset: 'XLM', status: 'Completed' },
  { id: '4', date: '2026-04-15', recipient: 'dave.stellar', amount: 50, asset: 'USDC', status: 'Failed' },
  { id: '5', date: '2026-04-20', recipient: 'eve.stellar', amount: 300, asset: 'XLM', status: 'Pending' },
];

const STATUS_COLORS: Record<PayoutStatus, string> = {
  Completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Failed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const INITIAL_FILTERS = { startDate: '', endDate: '', asset: '' as PayoutAsset | '', statusSearch: '' };

export function PayoutHistoryTable({ payouts = MOCK_PAYOUTS }: { payouts?: Payout[] }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const filtered = useMemo(() => {
    return payouts.filter((p) => {
      if (filters.startDate && p.date < filters.startDate) return false;
      if (filters.endDate && p.date > filters.endDate) return false;
      if (filters.asset && p.asset !== filters.asset) return false;
      if (filters.statusSearch && !p.status.toLowerCase().includes(filters.statusSearch.toLowerCase())) return false;
      return true;
    });
  }, [payouts, filters]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end bg-slate-900/40 rounded-lg border border-slate-800/50 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            className="bg-slate-800 text-white text-sm rounded px-2 py-1 border border-slate-700"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            className="bg-slate-800 text-white text-sm rounded px-2 py-1 border border-slate-700"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Asset</label>
          <select
            value={filters.asset}
            onChange={(e) => setFilters((f) => ({ ...f, asset: e.target.value as PayoutAsset | '' }))}
            className="bg-slate-800 text-white text-sm rounded px-2 py-1 border border-slate-700"
          >
            <option value="">All</option>
            <option value="XLM">XLM</option>
            <option value="USDC">USDC</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Status</label>
          <input
            type="text"
            placeholder="e.g. Completed"
            value={filters.statusSearch}
            onChange={(e) => setFilters((f) => ({ ...f, statusSearch: e.target.value }))}
            className="bg-slate-800 text-white text-sm rounded px-2 py-1 border border-slate-700"
          />
        </div>
        <button
          onClick={() => setFilters(INITIAL_FILTERS)}
          className="text-sm text-slate-400 hover:text-white border border-slate-700 rounded px-3 py-1 transition-colors"
        >
          Reset Filters
        </button>
      </div>

      <div className="bg-slate-900/40 rounded-lg border border-slate-800/50 overflow-hidden">
        <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-3 bg-slate-800/50 border-b border-slate-700/50 text-sm font-medium text-slate-400">
          <div>Date</div>
          <div>Recipient</div>
          <div>Amount</div>
          <div>Asset</div>
          <div>Status</div>
        </div>
        <div className="divide-y divide-slate-800/50">
          {filtered.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-500 text-sm">No payouts match the current filters.</div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                <div className="text-sm text-slate-400">{new Date(p.date).toLocaleDateString()}</div>
                <div className="text-sm text-white">{p.recipient}</div>
                <div className="text-sm font-semibold text-white">{p.amount.toFixed(2)}</div>
                <div className="text-sm text-slate-300">{p.asset}</div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[p.status]}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-700/50">
          <p className="text-sm text-slate-400">Showing {filtered.length} of {payouts.length} payouts</p>
        </div>
      </div>
    </div>
  );
}
