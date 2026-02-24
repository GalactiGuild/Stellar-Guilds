import React from 'react'
import { Bell, BellOff, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { SavedSearch } from '@/hooks/useSearch'

interface SearchSidebarProps {
  history: string[]
  onHistorySelect: (value: string) => void
  onClearHistory: () => void
  savedSearches: SavedSearch[]
  onToggleSavedSearch: () => void
  onToggleNotifications: (id: string) => void
}

const SearchSidebarMeta: React.FC<SearchSidebarProps> = ({
  history,
  onHistorySelect,
  onClearHistory,
  savedSearches,
  onToggleSavedSearch,
  onToggleNotifications,
}) => {
  const hasHistory = history.length > 0
  const hasSaved = savedSearches.length > 0

  return (
    <aside className="space-y-6 rounded-xl border border-stellar-lightNavy bg-stellar-navy/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stellar-slate">
          <Bookmark className="h-3 w-3" aria-hidden="true" />
          <span>Saved searches</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-stellar-lightNavy text-[11px] text-stellar-slate hover:text-stellar-white"
          onClick={onToggleSavedSearch}
        >
          Save current
        </Button>
      </div>

      {hasSaved ? (
        <ul className="space-y-2 text-xs text-stellar-slate">
          {savedSearches.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-2 rounded-md border border-stellar-lightNavy bg-stellar-lightNavy/40 px-2 py-1.5"
            >
              <span className="truncate">{s.label}</span>
              <button
                type="button"
                onClick={() => onToggleNotifications(s.id)}
                className={cn(
                  'ml-1 inline-flex items-center justify-center rounded-full border px-1 py-0.5',
                  s.notificationsEnabled
                    ? 'border-gold-500 text-gold-400'
                    : 'border-stellar-lightNavy text-stellar-slate hover:text-stellar-white',
                )}
                aria-label={
                  s.notificationsEnabled ? 'Disable alerts for search' : 'Enable alerts for search'
                }
              >
                {s.notificationsEnabled ? (
                  <Bell className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <BellOff className="h-3 w-3" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-stellar-slate">
          Save frequent queries and optionally enable alerts when new matches appear (backend
          integration required).
        </p>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-stellar-slate">
          <span>Recent searches</span>
          {hasHistory && (
            <button
              type="button"
              className="text-[11px] text-stellar-slate hover:text-stellar-white"
              onClick={onClearHistory}
            >
              Clear
            </button>
          )}
        </div>
        {hasHistory ? (
          <ul className="space-y-1 text-xs text-stellar-slate">
            {history.slice(0, 10).map((h) => (
              <li key={h}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1 hover:bg-stellar-lightNavy hover:text-stellar-white"
                  onClick={() => onHistorySelect(h)}
                >
                  <span className="truncate">{h}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-stellar-slate">You have no recent searches yet.</p>
        )}
      </div>
    </aside>
  )
}

export default SearchSidebarMeta
