export type SearchSection = 'all' | 'bounties' | 'guilds' | 'users' | 'tags'

export type SortOption =
  | 'relevance'
  | 'newest'
  | 'reward-desc'
  | 'members-desc'

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error'

export interface SearchFilters {
  sections: SearchSection[]
  bountyStatus: string[]
  bountyDifficulty: string[]
  guildCategory: string[]
  guildTier: string[]
  tags: string[]
  minReward?: number
  maxReward?: number
  sortBy: SortOption
}

export interface FacetOption {
  value: string
  label: string
  count: number
}

export interface SearchFacets {
  sections: FacetOption[]
  bountyStatus: FacetOption[]
  bountyDifficulty: FacetOption[]
  guildCategory: FacetOption[]
  guildTier: FacetOption[]
  tags: FacetOption[]
}

export type SearchResultKind = 'bounty' | 'guild' | 'user' | 'tag'

export interface SearchResultBase {
  id: string
  kind: SearchResultKind
  title: string
  subtitle?: string
  href?: string
  badge?: string
  score: number
  meta?: Record<string, unknown>
}

export interface SearchQueryState {
  term: string
  section: SearchSection
  filters: SearchFilters
  page: number
  pageSize: number
}

export interface SearchResponse {
  results: SearchResultBase[]
  facets: SearchFacets
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

