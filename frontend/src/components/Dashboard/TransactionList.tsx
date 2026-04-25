'use client'

import { ExportCSVButton } from '@/components/ui/ExportCSVButton'
import { exportTransactionsToCSV, generateMockTransactions, type Transaction } from '@/features/analytics/transactionExport'

export function TransactionList() {
  // Mock transactions - in real app, this would come from props or API
  const transactions = generateMockTransactions()

  const formatAmount = (amount: number, type: Transaction['type']) => {
    const prefix = type === 'income' ? '+' : type === 'expense' ? '-' : ''
    return `${prefix}${amount.toFixed(2)} XLM`
  }

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return 'text-green-400'
      case 'expense':
        return 'text-red-400'
      case 'transfer':
        return 'text-blue-400'
      default:
        return 'text-slate-400'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with Export Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Transaction History</h2>
        <ExportCSVButton 
          onExport={exportTransactionsToCSV}
          label="Export CSV"
        />
      </div>

      {/* Transaction List */}
      <div className="bg-slate-900/40 rounded-lg border border-slate-800/50 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 bg-slate-800/50 border-b border-slate-700/50 text-sm font-medium text-slate-400">
          <div>Date</div>
          <div className="col-span-2">Description</div>
          <div>Amount</div>
          <div>Type</div>
          <div>Status</div>
        </div>

        {/* Transactions */}
        <div className="divide-y divide-slate-800/50">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="grid grid-cols-1 md:grid-cols-6 gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors"
            >
              {/* Date */}
              <div className="text-sm text-slate-400">
                {new Date(tx.date).toLocaleDateString()}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-white">{tx.description}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {tx.from} → {tx.to}
                </p>
              </div>

              {/* Amount */}
              <div className={`text-sm font-semibold ${getTypeColor(tx.type)}`}>
                {formatAmount(tx.amount, tx.type)}
              </div>

              {/* Type */}
              <div className="text-sm text-slate-400 capitalize">
                {tx.type}
              </div>

              {/* Status */}
              <div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(tx.status)}`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-700/50">
          <p className="text-sm text-slate-400">
            Showing {transactions.length} transactions
          </p>
        </div>
      </div>
    </div>
  )
}
