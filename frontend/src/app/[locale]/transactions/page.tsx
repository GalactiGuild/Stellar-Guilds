'use client'

import { TransactionList } from '@/components/Dashboard/TransactionList'

export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Treasury & Transactions
          </h1>
          <p className="text-slate-400">
            Manage your guild treasury and export transaction records for tax and accounting purposes.
          </p>
        </div>

        {/* Transaction List with Export */}
        <TransactionList />
      </div>
    </div>
  )
}
