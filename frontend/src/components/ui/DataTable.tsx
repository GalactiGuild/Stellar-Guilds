'use client';

import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';

export interface DataTableProps<TData, TValue = unknown> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  className?: string;
  emptyMessage?: string;
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | false }) {
  if (!direction) {
    return (
      <svg
        className="ml-1 h-3.5 w-3.5 text-stellar-slate/50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  return (
    <svg
      className={cn(
        'ml-1 h-3.5 w-3.5',
        direction === 'asc'
          ? 'text-violet-400'
          : 'text-violet-400 rotate-180',
      )}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path d="M5 15l7-7 7 7" />
    </svg>
  );
}

export function DataTable<TData, TValue = unknown>({
  data,
  columns,
  className,
  emptyMessage = 'No data available',
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const isEmpty = data.length === 0;

  if (isEmpty) {
    return (
      <div
        className={cn(
          'flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-stellar-slate/30 bg-stellar-lightNavy/10 text-stellar-slate',
          className,
        )}
        role="status"
      >
        <div className="text-center">
          <div className="mb-2 text-4xl opacity-40">📊</div>
          <p className="text-sm font-medium">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-xl border border-stellar-lightNavy bg-stellar-lightNavy shadow-card',
        className,
      )}
    >
      <table className="w-full text-left text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    'whitespace-nowrap border-b border-stellar-slate/20 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stellar-slate',
                    header.column.getCanSort() &&
                      'cursor-pointer select-none hover:text-stellar-white transition-colors',
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {header.column.getIsSorted() !== false && (
                      <SortIcon
                        direction={header.column.getIsSorted() as
                          | 'asc'
                          | 'desc'
                          | false}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, rowIndex) => (
            <tr
              key={row.id}
              className={cn(
                'transition-colors hover:bg-white/[0.03]',
                rowIndex % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]',
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="border-b border-stellar-slate/10 px-4 py-3 text-stellar-white/90"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
