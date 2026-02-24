import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Loader2, Target, Users, Tag as TagIcon, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SearchResultBase, SearchStatus } from '@/features/search/types'

interface SearchResultsProps {
  results: SearchResultBase[]
  status: SearchStatus
  error: string | null
  total: number
  onLoadMore: () => void
  hasMore: boolean
  isFetchingMore: boolean
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  status,
  error,
  total,
  onLoadMore,
  hasMore,
  isFetchingMore,
}) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          onLoadMore()
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.1,
      },
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, onLoadMore])

  if (status === 'idle') {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-stellar-lightNavy/60 bg-stellar-navy/40 p-8 text-center">
        <Trophy className="mb-3 h-6 w-6 text-gold-400" aria-hidden="true" />
        <h2 className="mb-1 text-lg font-semibold text-stellar-white">
          Find your next mission
        </h2>
        <p className="max-w-md text-sm text-stellar-slate">
          Search across bounties, guilds, contributors, and tags in one place. Start typing to
          see results in real time.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-red-500/40 bg-red-950/30 p-8 text-center">
        <p className="mb-2 text-sm font-semibold text-red-300">Search failed</p>
        <p className="text-xs text-red-200/80">{error}</p>
      </div>
    )
  }

  const isLoadingInitial = status === 'loading' && results.length === 0

  return (
    <section className="flex h-full flex-col rounded-xl border border-stellar-lightNavy bg-stellar-navy/60">
      <header className="flex items-center justify-between border-b border-stellar-lightNavy/80 px-4 py-3 text-xs text-stellar-slate">
        <div className="flex items-center gap-2">
          <Target className="h-3 w-3 text-gold-400" aria-hidden="true" />
          <span>
            {total.toLocaleString()} result{total === 1 ? '' : 's'}
          </span>
        </div>
        {status === 'loading' && (
          <div className="flex items-center gap-1 text-[11px] text-stellar-slate">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            Updating…
          </div>
        )}
      </header>

      {isLoadingInitial ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-gold-400" aria-hidden="true" />
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <p className="mb-1 text-sm font-semibold text-stellar-white">No matches found</p>
          <p className="max-w-md text-xs text-stellar-slate">
            Try broadening your search, removing filters, or searching by different keywords.
          </p>
        </div>
      ) : (
        <>
          <ul className="grid max-h-[70vh] grid-cols-1 gap-px overflow-auto bg-stellar-lightNavy/40 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((result) => (
              <li key={result.id} className="bg-stellar-navy/80 p-px">
                <ResultCard result={result} />
              </li>
            ))}
          </ul>

          <div ref={sentinelRef} className="h-8 w-full" />

          {hasMore && (
            <div className="flex items-center justify-center border-t border-stellar-lightNavy/80 px-4 py-2">
              <button
                type="button"
                onClick={onLoadMore}
                className="text-xs font-medium text-gold-400 hover:text-gold-300"
              >
                {isFetchingMore ? 'Loading more…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

const ResultCard: React.FC<{ result: SearchResultBase }> = ({ result }) => {
  const icon =
    result.kind === 'bounty'
      ? Target
      : result.kind === 'guild'
      ? Users
      : result.kind === 'user'
      ? Users
      : TagIcon

  const Icon = icon

  const content = (
    <article className="flex h-full flex-col justify-between rounded-lg border border-stellar-lightNavy/80 bg-stellar-lightNavy/60 p-3 text-xs text-stellar-slate hover:border-gold-500 hover:bg-stellar-lightNavy/80">
      <header className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-stellar-slate">
            <Icon className="h-3 w-3 text-gold-400" aria-hidden="true" />
            <span>{result.kind}</span>
          </div>
          <h3 className="truncate text-sm font-semibold text-stellar-white">
            {result.title}
          </h3>
          {result.subtitle && (
            <p className="line-clamp-2 text-[11px] text-stellar-slate">{result.subtitle}</p>
          )}
        </div>
        {result.badge && (
          <span className="inline-flex items-center rounded-full bg-stellar-navy px-2 py-0.5 text-[10px] font-medium capitalize text-gold-400">
            {result.badge}
          </span>
        )}
      </header>
      <footer className="mt-2 flex items-center justify-between text-[11px] text-stellar-slate">
        <span className="text-stellar-slate/80">
          Score: <span className="text-gold-400">{result.score.toFixed(0)}</span>
        </span>
        {result.href && (
          <span className="text-[11px] font-medium text-gold-400">View →</span>
        )}
      </footer>
    </article>
  )

  if (result.href) {
    return (
      <Link href={result.href} className="block focus:outline-none focus-visible:ring-2">
        {content}
      </Link>
    )
  }

  return content
}

export default SearchResults
