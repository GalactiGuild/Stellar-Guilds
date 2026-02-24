import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { executeMockSearch } from '@/features/search/mockSearchEngine'
import type {
  SearchFilters,
  SearchQueryState,
  SearchResponse,
  SearchSection,
  SearchStatus,
  SearchResultBase,
} from '@/features/search/types'

const HISTORY_KEY = 'stellar-search-history'
const SAVED_KEY = 'stellar-search-saved'

export interface SavedSearch {
  id: string
  label: string
  query: SearchQueryState
  notificationsEnabled: boolean
}

export interface UseSearchState {
  term: string
  section: SearchSection
  filters: SearchFilters
  status: SearchStatus
  error: string | null
  results: SearchResultBase[]
  facets: SearchResponse['facets']
  total: number
  page: number
  hasMore: boolean
  isFetchingMore: boolean
  history: string[]
  savedSearches: SavedSearch[]
  suggestions: string[]
  setTerm: (value: string) => void
  setSection: (section: SearchSection) => void
  setFilters: (updater: (prev: SearchFilters) => SearchFilters) => void
  loadMore: () => void
  clearHistory: () => void
  runImmediateSearch: () => void
  toggleSavedSearch: (label?: string) => void
  toggleNotifications: (id: string) => void
}

function createDefaultFilters(): SearchFilters {
  return {
    sections: ['all'],
    bountyStatus: [],
    bountyDifficulty: [],
    guildCategory: [],
    guildTier: [],
    tags: [],
    sortBy: 'relevance',
  }
}

function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const value = window.localStorage.getItem(key)
    if (!value) return fallback
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function writeLocalStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

function makeCacheKey(q: SearchQueryState): string {
  return JSON.stringify({
    term: q.term,
    section: q.section,
    filters: q.filters,
    page: q.page,
    pageSize: q.pageSize,
  })
}

export function useSearch(pageSize = 12): UseSearchState {
  const [term, setTermRaw] = useState('')
  const [section, setSectionState] = useState<SearchSection>('all')
  const [filters, setFiltersState] = useState<SearchFilters>(() => createDefaultFilters())
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResultBase[]>([])
  const [facets, setFacets] = useState<SearchResponse['facets'] | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [history, setHistory] = useState<string[]>(() =>
    readLocalStorage<string[]>(HISTORY_KEY, []),
  )
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() =>
    readLocalStorage<SavedSearch[]>(SAVED_KEY, []),
  )

  const debounceRef = useRef<number | null>(null)
  const cacheRef = useRef<Map<string, SearchResponse>>(new Map())
  const requestIdRef = useRef(0)

  const suggestions = useMemo(() => {
    const base: string[] = [
      'zero-knowledge',
      'frontend',
      'design',
      'security',
      'growth',
      'dao',
      'education',
    ]

    const fromHistory = history.slice(0, 5)
    const pool = Array.from(new Set([...fromHistory, ...base]))

    if (!term) return pool
    const lower = term.toLowerCase()
    return pool
      .filter((p) => p.toLowerCase().includes(lower))
      .slice(0, 8)
  }, [history, term])

  const queryState: SearchQueryState = useMemo(
    () => ({
      term,
      section,
      filters,
      page,
      pageSize,
    }),
    [term, section, filters, page, pageSize],
  )

  const performSearch = useCallback(
    async (state: SearchQueryState, isLoadMore: boolean) => {
      const key = makeCacheKey(state)
      const cached = cacheRef.current.get(key)

      const nextRequestId = ++requestIdRef.current

      if (cached) {
        if (isLoadMore) {
          setResults((prev) => [...prev, ...cached.results])
        } else {
          setResults(cached.results)
        }
        setFacets(cached.facets)
        setTotal(cached.total)
        setHasMore(cached.hasMore)
        setStatus('success')
        setError(null)
        return
      }

      try {
        const response = await executeMockSearch(state)
        if (requestIdRef.current !== nextRequestId) {
          return
        }

        cacheRef.current.set(key, response)

        if (isLoadMore) {
          setResults((prev) => [...prev, ...response.results])
        } else {
          setResults(response.results)
        }
        setFacets(response.facets)
        setTotal(response.total)
        setHasMore(response.hasMore)
        setStatus('success')
        setError(null)

        if (state.term) {
          setHistory((prev) => {
            const existing = prev.filter((h) => h.toLowerCase() !== state.term.toLowerCase())
            const next = [state.term, ...existing].slice(0, 20)
            writeLocalStorage(HISTORY_KEY, next)
            return next
          })
        }
      } catch (err) {
        if (requestIdRef.current !== nextRequestId) return
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        if (isLoadMore) {
          setIsFetchingMore(false)
        }
      }
    },
    [],
  )

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current)
    }

    if (!term && filters.sections.length === 1 && filters.sections[0] === 'all') {
      setStatus('idle')
      setResults([])
      setFacets(null)
      setTotal(0)
      setHasMore(false)
      return
    }

    setStatus('loading')
    setError(null)

    debounceRef.current = window.setTimeout(() => {
      performSearch(
        {
          term,
          section,
          filters,
          page: 1,
          pageSize,
        },
        false,
      )
      setPage(1)
    }, 300)

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current)
      }
    }
  }, [term, section, filters, pageSize, performSearch])

  const setTerm = useCallback((value: string) => {
    setTermRaw(value)
  }, [])

  const setSection = useCallback((next: SearchSection) => {
    setSectionState(next)
    setFiltersState((prev) => ({
      ...prev,
      sections: [next],
    }))
  }, [])

  const setFilters = useCallback((updater: (prev: SearchFilters) => SearchFilters) => {
    setFiltersState((prev) => updater(prev))
  }, [])

  const loadMore = useCallback(() => {
    if (isFetchingMore || !hasMore || status === 'loading') return
    const nextPage = page + 1
    setIsFetchingMore(true)
    setPage(nextPage)
    performSearch(
      {
        term,
        section,
        filters,
        page: nextPage,
        pageSize,
      },
      true,
    )
  }, [filters, hasMore, isFetchingMore, page, pageSize, performSearch, section, status, term])

  const clearHistory = useCallback(() => {
    setHistory([])
    writeLocalStorage(HISTORY_KEY, [])
  }, [])

  const runImmediateSearch = useCallback(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current)
    }
    setStatus('loading')
    setError(null)
    setPage(1)
    performSearch(
      {
        term,
        section,
        filters,
        page: 1,
        pageSize,
      },
      false,
    )
  }, [filters, performSearch, section, term, pageSize])

  const toggleSavedSearch = useCallback(
    (label?: string) => {
      const key = makeCacheKey(queryState)
      setSavedSearches((prev) => {
        const existing = prev.find((s) => makeCacheKey(s.query) === key)
        if (existing) {
          const next = prev.filter((s) => s.id !== existing.id)
          writeLocalStorage(SAVED_KEY, next)
          return next
        }

        const next: SavedSearch[] = [
          {
            id: `saved-${Date.now()}`,
            label: label || queryState.term || 'Search',
            query: queryState,
            notificationsEnabled: false,
          },
          ...prev,
        ]
        writeLocalStorage(SAVED_KEY, next)
        return next
      })
    },
    [queryState],
  )

  const toggleNotifications = useCallback((id: string) => {
    setSavedSearches((prev) => {
      const next = prev.map((s) =>
        s.id === id ? { ...s, notificationsEnabled: !s.notificationsEnabled } : s,
      )
      writeLocalStorage(SAVED_KEY, next)
      return next
    })
  }, [])

  return {
    term,
    section,
    filters,
    status,
    error,
    results,
    facets: facets ?? {
      sections: [],
      bountyStatus: [],
      bountyDifficulty: [],
      guildCategory: [],
      guildTier: [],
      tags: [],
    },
    total,
    page,
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
  }
}

