export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  currency: string
  type: 'income' | 'expense' | 'transfer'
  status: 'completed' | 'pending' | 'failed'
  from: string
  to: string
  txHash?: string
}

/**
 * Generates mock transaction data for demonstration
 */
export const generateMockTransactions = (): Transaction[] => {
  const now = new Date()
  return [
    {
      id: 'tx-001',
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Bounty completion reward',
      amount: 250.00,
      currency: 'XLM',
      type: 'income',
      status: 'completed',
      from: 'Treasury',
      to: 'GA7Z...K9PL',
      txHash: 'a1b2c3d4e5f6...'
    },
    {
      id: 'tx-002',
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Guild treasury contribution',
      amount: 100.00,
      currency: 'XLM',
      type: 'expense',
      status: 'completed',
      from: 'GA7Z...K9PL',
      to: 'Guild Treasury',
      txHash: 'f6e5d4c3b2a1...'
    },
    {
      id: 'tx-003',
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Grant disbursement',
      amount: 500.00,
      currency: 'XLM',
      type: 'income',
      status: 'completed',
      from: 'Platform Grants',
      to: 'GA7Z...K9PL',
      txHash: '9z8y7x6w5v4u...'
    },
    {
      id: 'tx-004',
      date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Member tip',
      amount: 25.50,
      currency: 'XLM',
      type: 'income',
      status: 'completed',
      from: 'GB2M...X4RT',
      to: 'GA7Z...K9PL',
      txHash: '3u4v5w6x7y8z...'
    },
    {
      id: 'tx-005',
      date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Transfer to savings',
      amount: 150.00,
      currency: 'XLM',
      type: 'transfer',
      status: 'pending',
      from: 'GA7Z...K9PL',
      to: 'GC8W...N5MQ',
      txHash: '7y8z9a0b1c2d...'
    }
  ]
}

/**
 * Converts a Transaction object to CSV row format
 */
const transactionToCSVRow = (tx: Transaction): string => {
  const date = new Date(tx.date).toLocaleDateString()
  const time = new Date(tx.date).toLocaleTimeString()
  
  return [
    tx.id,
    `${date} ${time}`,
    `"${tx.description.replace(/"/g, '""')}"`,
    tx.amount.toFixed(2),
    tx.currency,
    tx.type,
    tx.status,
    tx.from,
    tx.to,
    tx.txHash || ''
  ].join(',')
}

/**
 * Converts an array of Transaction objects to CSV string
 */
export const transactionsToCSV = (transactions: Transaction[]): string => {
  if (!transactions || transactions.length === 0) {
    return ''
  }

  // CSV Header
  const headers = [
    'Transaction ID',
    'Date',
    'Description',
    'Amount',
    'Currency',
    'Type',
    'Status',
    'From',
    'To',
    'Transaction Hash'
  ].join(',')

  // CSV Rows
  const rows = transactions.map(transactionToCSVRow).join('\n')

  return `${headers}\n${rows}`
}

/**
 * Triggers a CSV file download using a hidden anchor element with Data URI
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  if (!csvContent) return

  // Create blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the object URL
    URL.revokeObjectURL(url)
  }
}

/**
 * Generates a filename with current date for transaction exports
 * Format: transactions_YYYY-MM-DD.csv
 */
export const generateTransactionFilename = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  return `transactions_${year}-${month}-${day}.csv`
}

/**
 * Complete export flow: Generate mock data → Convert to CSV → Download
 */
export const exportTransactionsToCSV = (): void => {
  const transactions = generateMockTransactions()
  const csvContent = transactionsToCSV(transactions)
  const filename = generateTransactionFilename()
  
  downloadCSV(csvContent, filename)
}
