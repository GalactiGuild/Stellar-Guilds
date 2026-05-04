'use client'

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown, TableProperties } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface DataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  className?: string
  emptyTitle?: string
  emptyDescription?: string
}

function SortIcon({ direction }: { direction: false | 'asc' | 'desc' }) {
  if (direction === 'asc') {
    return <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
  }

  if (direction === 'desc') {
    return <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
  }

  return <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
}

export function DataTable<TData, TValue>({
  data,
  columns,
  className,
  emptyTitle = 'No Data Available',
  emptyDescription = 'Rows will appear here once data is available.',
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/50 shadow-2xl shadow-black/20 backdrop-blur-xl',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-full border-collapse text-sm">
          <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-400">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sortDirection = header.column.getIsSorted()

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      className="border-b border-slate-800 px-4 py-3 text-left font-semibold"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 text-left transition hover:text-slate-100"
                          onClick={header.column.getToggleSortingHandler()}
                          aria-label={`Sort by ${header.column.id}`}
                        >
                          <span className="min-w-0 truncate">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          <SortIcon direction={sortDirection} />
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-800/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-14">
                  <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                      <TableProperties className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-semibold text-white">{emptyTitle}</h3>
                    <p className="mt-1 text-sm text-slate-400">{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export type { DataTableProps }
