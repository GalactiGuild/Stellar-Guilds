'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'

interface ExportCSVButtonProps {
  onExport: () => void
  label?: string
  className?: string
}

export function ExportCSVButton({ 
  onExport, 
  label = 'Export CSV',
  className = '' 
}: ExportCSVButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300))
      onExport()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
      {isExporting ? 'Exporting...' : label}
    </button>
  )
}
