import React from 'react'
import { Filter, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { SearchFilters, SearchFacets, SearchSection, SortOption } from '@/features/search/types'

interface SearchFiltersProps {
  filters: SearchFilters
  facets: SearchFacets
  onChange: (updater: (prev: SearchFilters) => SearchFilters) => void
  section: SearchSection
  onSectionChange: (section: SearchSection) => void
}

const sectionLabels: Record<SearchSection, string> = {
  all: 'All',
  bounties: 'Bounties',
  guilds: 'Guilds',
  users: 'Contributors',
  tags: 'Tags',
}

const sortLabels: Record<SortOption, string> = {
  relevance: 'Relevance',
  newest: 'Newest',
  'reward-desc': 'Highest reward',
  'members-desc': 'Most members',
}

const SearchFiltersPanel: React.FC<SearchFiltersProps> = ({
  filters,
  facets,
  onChange,
  section,
  onSectionChange,
}) => {
  const toggleFilterValue = (key: keyof SearchFilters, value: string) => {
    onChange((prev) => {
      const current = (prev[key] as string[]) ?? []
      const exists = current.includes(value)
      const nextValues = exists ? current.filter((v) => v !== value) : [...current, value]
      return {
        ...prev,
        [key]: nextValues,
      }
    })
  }

  const handleSortChange = (value: SortOption) => {
    onChange((prev) => ({
      ...prev,
      sortBy: value,
    }))
  }

  return (
    <aside className="space-y-6 rounded-xl border border-stellar-lightNavy bg-stellar-navy/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stellar-slate">
          <Filter className="h-3 w-3" />
          Filters
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stellar-slate">
          Section
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(sectionLabels) as SearchSection[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSectionChange(s)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                section === s
                  ? 'border-gold-500 bg-gold-500 text-stellar-navy'
                  : 'border-stellar-lightNavy bg-stellar-lightNavy/60 text-stellar-slate hover:border-gold-500 hover:text-stellar-white',
              )}
            >
              {sectionLabels[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-stellar-slate">
            Sort
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(sortLabels) as SortOption[]).map((s) => (
            <Button
              key={s}
              type="button"
              variant={filters.sortBy === s ? 'primary' : 'ghost'}
              size="sm"
              className={cn(
                'border border-stellar-lightNavy text-xs',
                filters.sortBy === s
                  ? 'border-gold-500'
                  : 'text-stellar-slate hover:text-stellar-white',
              )}
              onClick={() => handleSortChange(s)}
            >
              {sortLabels[s]}
            </Button>
          ))}
        </div>
      </div>

      {facets.bountyStatus.length > 0 && (
        <FacetGroup
          title="Bounty status"
          items={facets.bountyStatus}
          selected={filters.bountyStatus}
          onToggle={(value) => toggleFilterValue('bountyStatus', value)}
        />
      )}

      {facets.bountyDifficulty.length > 0 && (
        <FacetGroup
          title="Difficulty"
          items={facets.bountyDifficulty}
          selected={filters.bountyDifficulty}
          onToggle={(value) => toggleFilterValue('bountyDifficulty', value)}
        />
      )}

      {facets.guildCategory.length > 0 && (
        <FacetGroup
          title="Guild category"
          items={facets.guildCategory}
          selected={filters.guildCategory}
          onToggle={(value) => toggleFilterValue('guildCategory', value)}
        />
      )}

      {facets.guildTier.length > 0 && (
        <FacetGroup
          title="Guild tier"
          items={facets.guildTier}
          selected={filters.guildTier}
          onToggle={(value) => toggleFilterValue('guildTier', value)}
        />
      )}

      {facets.tags.length > 0 && (
        <FacetGroup
          title="Tags"
          items={facets.tags}
          selected={filters.tags}
          onToggle={(value) => toggleFilterValue('tags', value)}
          icon={<Tag className="h-3 w-3" />}
        />
      )}
    </aside>
  )
}

interface FacetGroupProps {
  title: string
  items: { value: string; label: string; count: number }[]
  selected: string[]
  onToggle: (value: string) => void
  icon?: React.ReactNode
}

const FacetGroup: React.FC<FacetGroupProps> = ({
  title,
  items,
  selected,
  onToggle,
  icon,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stellar-slate">
        {icon}
        <span>{title}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const active = selected.includes(item.value)
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onToggle(item.value)}
              className={cn(
                'flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] leading-none transition-colors',
                active
                  ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                  : 'border-stellar-lightNavy bg-stellar-lightNavy/60 text-stellar-slate hover:border-gold-500 hover:text-stellar-white',
              )}
            >
              <span>{item.label}</span>
              <span className="text-[10px] text-stellar-slate">({item.count})</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SearchFiltersPanel
