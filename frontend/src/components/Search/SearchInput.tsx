import React, { FormEvent } from 'react'
import { Search as SearchIcon, Clock, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  suggestions: string[]
  onSuggestionSelect: (value: string) => void
  placeholder?: string
  compact?: boolean
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSubmit,
  suggestions,
  onSuggestionSelect,
  placeholder = 'Search bounties, guilds, contributors, tags…',
  compact,
}) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  const showSuggestions = suggestions.length > 0 && !compact

  return (
    <div className="relative w-full" aria-label="Global search" role="search">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stellar-slate">
            <SearchIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'w-full rounded-lg border border-stellar-lightNavy bg-stellar-lightNavy/80 pl-10 pr-10 py-2 text-sm text-stellar-white placeholder:text-stellar-slate focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-stellar-navy',
              compact ? 'h-9' : 'h-11',
            )}
            autoComplete="off"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute inset-y-0 right-3 flex items-center text-stellar-slate hover:text-stellar-white"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </form>

      {showSuggestions && (
        <ul
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-stellar-lightNavy bg-stellar-navy/95 text-sm shadow-xl"
          role="listbox"
          aria-label="Search suggestions"
        >
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-stellar-slate hover:bg-stellar-lightNavy hover:text-stellar-white"
                onClick={() => onSuggestionSelect(s)}
              >
                <Clock className="h-3 w-3" aria-hidden="true" />
                <span>{s}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchInput

