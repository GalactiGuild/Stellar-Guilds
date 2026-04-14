'use client'

import React, { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

/* ---------- types ---------- */

type ColumnKey = string

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[]
  columns: {
    accessorKey: ColumnKey
    header: string
    cell?: (value: unknown, row: T) => React.ReactNode
    sortable?: boolean
  }[]
  /** Message shown when data is empty */
  emptyMessage?: string
  /** Enable row stripe coloring */
  striped?: boolean
  className?: string
}

/* ---------- component ---------- */

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns: columnDefs,
  emptyMessage = 'No data available',
  striped = true,
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])

  // Build tanstack columns from simple def array
  const columns = useMemo(() => {
    return columnDefs.map((col) =>
      createColumnHelper<T>().accessor(col.accessorKey as keyof T, {
        header: () => (
          <div className="flex items-center gap-1.5">
            <span>{col.header}</span>
            {col.sortable !== false && (
              <SortIndicator />
            )}
          </div>
        ),
        cell: (info) => {
          if (col.cell) return col.cell(info.getValue(), info.row.original)
          return (info.getValue() as React.ReactNode) ?? '—'
        },
      })
    )
  }, [columnDefs])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (!data || data.length === 0) {
    return (
      <div className={cn(
        'rounded-xl border border-stellar-lightNavy bg-stellar-lightNavy/30',
        'flex items-center justify-center py-16 text-sm text-stellar-slate',
        className
      )}>
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-stellar-lightNavy', className)}>
      <table className="w-full text-left text-sm">
        {/* Header */}
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={cn(
                    'whitespace-nowrap px-4 py-3 font-medium text-stellar-slate border-b border-stellar-lightNavy',
                    header.column.getCanSort() && 'cursor-pointer select-none hover:text-stellar-white transition-colors'
                  )}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        {/* Body */}
        <tbody>
          {table.getRowModel().rows.map((row, idx) => (
            <tr
              key={row.id}
              className={cn(
                'border-b border-stellar-lightNavy/50 transition-colors hover:bg-stellar-lightNavy/20',
                striped && idx % 2 === 1 && 'bg-stellar-lightNavy/10'
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-stellar-white/90">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------- internal: sort indicator ---------- */

function SortIndicator() {
  const { column } = (() => ({ column: null }))()
  // We rely on the table context for actual sort direction;
  // this is a static icon that the parent header toggles.
  return (
    <span className="inline-flex">
      <ArrowUpDown className="h-3 w-3 opacity-40" />
    </span>
  )
}

export default DataTable
