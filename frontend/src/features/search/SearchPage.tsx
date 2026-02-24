'use client'

import React from 'react'
import { useSearch } from '@/hooks/useSearch'
import SearchInput from '@/components/Search/SearchInput'
import SearchFiltersPanel from '@/components/Search/SearchFilters'
import SearchResults from '@/components/Search/SearchResults'
import SearchSidebarMeta from '@/components/Search/SearchSidebar'

const SearchPage: React.FC = () => {
  const {
    term,
    section,
    filters,
    status,
    error,
    results,
    facets,
    total,
    hasMore,
    isFetchingMore,
    history,
    savedSearches,
    suggestions,
    setTerm,
    setSection,
    setFilters,
    loadMore,
    clearHistory,
    runImmediateSearch,
    toggleSavedSearch,
    toggleNotifications,
  } = useSearch(18)

  const handleSuggestionSelect = (value: string) => {
    setTerm(value)
    runImmediateSearch()
  }

  return (
    <div className="min-h-screen bg-stellar-navy text-stellar-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">
            Discovery Engine
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Search bounties, guilds, and contributors
          </h1>
          <p className="max-w-2xl text-sm text-stellar-slate">
            Type to search across the entire network. Refine with filters, save frequent searches,
            and get a unified view of who is building what.
          </p>
          <div className="mt-2 max-w-2xl">
            <SearchInput
              value={term}
              onChange={setTerm}
              onSubmit={runImmediateSearch}
              suggestions={suggestions}
              onSuggestionSelect={handleSuggestionSelect}
            />
          </div>
        </header>

        <main className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,4fr)_minmax(0,2fr)]">
          <div className="order-2 md:order-1">
            <SearchFiltersPanel
              filters={filters}
              facets={facets}
              onChange={setFilters}
              section={section}
              onSectionChange={setSection}
            />
          </div>

          <div className="order-1 md:order-2 xl:col-span-1">
            <SearchResults
              results={results}
              status={status}
              error={error}
              total={total}
              onLoadMore={loadMore}
              hasMore={hasMore}
              isFetchingMore={isFetchingMore}
            />
          </div>

          <div className="order-3 hidden xl:block">
            <SearchSidebarMeta
              history={history}
              onHistorySelect={handleSuggestionSelect}
              onClearHistory={clearHistory}
              savedSearches={savedSearches}
              onToggleSavedSearch={() => toggleSavedSearch()}
              onToggleNotifications={toggleNotifications}
            />
          </div>
        </main>

        <section className="mt-6 grid gap-4 border-t border-stellar-lightNavy/60 pt-4 text-xs text-stellar-slate md:grid-cols-3">
          <div>
            <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stellar-slate">
              Real-time search
            </h2>
            <p>
              Input is debounced by 300ms and results are cached per query, keeping the interface
              responsive while minimizing network load.
            </p>
          </div>
          <div>
            <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stellar-slate">
              Faceted discovery
            </h2>
            <p>
              Dynamic facets are derived from search matches, enabling drill-down by status,
              difficulty, guild category, tier, and tags.
            </p>
          </div>
          <div>
            <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stellar-slate">
              Saved searches & alerts
            </h2>
            <p>
              Save frequent queries locally today, and connect notification toggles to backend
              alerts when server endpoints are available.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SearchPage

