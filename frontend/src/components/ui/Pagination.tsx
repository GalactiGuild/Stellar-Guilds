import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange?: (page: number) => void
  className?: string
  siblingCount?: number
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ currentPage, totalPages, onPageChange, className, siblingCount = 1 }, ref) => {
    // Edge case: No pages or invalid state
    if (totalPages <= 0 || currentPage < 1 || currentPage > totalPages) {
      return null
    }

    // Edge case: Single page
    if (totalPages === 1) {
      return null
    }

    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages && onPageChange) {
        onPageChange(page)
      }
    }

    // Generate page numbers to display
    const getPageNumbers = () => {
      const pages: (number | 'ellipsis')[] = []
      const totalVisible = siblingCount * 2 + 3 // siblings + current + 2 edges

      // If we have fewer pages than totalVisible, show all
      if (totalPages <= totalVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
        return pages
      }

      // Always show first page
      pages.push(1)

      // Calculate left and right bounds
      const leftSibling = Math.max(2, currentPage - siblingCount)
      const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount)

      // Add left ellipsis if needed
      if (leftSibling > 2) {
        pages.push('ellipsis')
      } else if (leftSibling === 2) {
        pages.push(2)
      }

      // Add siblings around current page
      for (let i = leftSibling; i <= rightSibling; i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }

      // Add right ellipsis if needed
      if (rightSibling < totalPages - 1) {
        pages.push('ellipsis')
      } else if (rightSibling === totalPages - 1 && !pages.includes(totalPages - 1)) {
        pages.push(totalPages - 1)
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }

      return pages
    }

    const pageNumbers = getPageNumbers()

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center gap-1',
          className
        )}
        role="navigation"
        aria-label="Pagination"
      >
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-md border border-stellar-slate text-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar-slate focus-visible:ring-offset-2',
            currentPage === 1
              ? 'opacity-50 cursor-not-allowed text-stellar-gray'
              : 'hover:bg-stellar-lightNavy hover:text-stellar-white cursor-pointer'
          )}
          aria-label="Previous page"
          aria-disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center w-10 h-10 text-stellar-gray"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            )
          }

          const isActive = page === currentPage

          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-md border text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar-slate focus-visible:ring-offset-2',
                isActive
                  ? 'bg-gold-500 border-gold-500 text-stellar-navy cursor-default'
                  : 'border-stellar-slate hover:bg-stellar-lightNavy hover:text-stellar-white cursor-pointer'
              )}
              aria-label={`Page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          )
        })}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-md border border-stellar-slate text-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar-slate focus-visible:ring-offset-2',
            currentPage === totalPages
              ? 'opacity-50 cursor-not-allowed text-stellar-gray'
              : 'hover:bg-stellar-lightNavy hover:text-stellar-white cursor-pointer'
          )}
          aria-label="Next page"
          aria-disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )
  }
)

Pagination.displayName = 'Pagination'

export { Pagination }
