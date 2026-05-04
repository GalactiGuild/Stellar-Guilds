'use client'

import type { ComponentType } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Search, Shield, User, Users, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type SearchSection = 'Guilds' | 'Bounties' | 'Users'

interface SearchResult {
  id: string
  section: SearchSection
  title: string
  description: string
  href: string
}

const SEARCH_RESULTS: SearchResult[] = [
  {
    id: 'guild-stellar-builders',
    section: 'Guilds',
    title: 'Stellar Builders Guild',
    description: 'Developer collective shipping smart contract tooling.',
    href: '/guilds/stellar-builders',
  },
  {
    id: 'guild-security-council',
    section: 'Guilds',
    title: 'Security Council',
    description: 'Audit reviewers and bounty validators.',
    href: '/guilds/security-council',
  },
  {
    id: 'bounty-wallet-integration',
    section: 'Bounties',
    title: 'Wallet Integration Review',
    description: 'Validate Freighter and XUMM transaction flows.',
    href: '/bounties/wallet-integration-review',
  },
  {
    id: 'bounty-soroban-events',
    section: 'Bounties',
    title: 'Soroban Event Indexing',
    description: 'Improve contract event coverage for indexers.',
    href: '/bounties/soroban-event-indexing',
  },
  {
    id: 'user-alex-validator',
    section: 'Users',
    title: 'Alex Validator',
    description: 'Top reviewer for governance and bounty submissions.',
    href: '/profile/GALAXVALIDATOR0000000000000000000000000000000000000000000',
  },
  {
    id: 'user-mira-builder',
    section: 'Users',
    title: 'Mira Builder',
    description: 'Frontend contributor and guild maintainer.',
    href: '/profile/GMIRABUILDER00000000000000000000000000000000000000000000',
  },
]

const SECTION_ICONS: Record<SearchSection, ComponentType<{ className?: string }>> = {
  Guilds: Users,
  Bounties: Shield,
  Users: User,
}

function matchesSearch(result: SearchResult, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return [result.section, result.title, result.description]
    .join(' ')
    .toLowerCase()
    .includes(normalizedQuery)
}

export function CommandPalette() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const filteredResults = useMemo(
    () => SEARCH_RESULTS.filter((result) => matchesSearch(result, query)),
    [query]
  )

  const groupedResults = useMemo(
    () =>
      filteredResults.reduce<Record<SearchSection, SearchResult[]>>(
        (groups, result) => {
          groups[result.section].push(result)
          return groups
        },
        { Guilds: [], Bounties: [], Users: [] }
      ),
    [filteredResults]
  )

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const isSearchShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'

      if (isSearchShortcut) {
        event.preventDefault()
        setIsOpen((current) => !current)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setActiveIndex(0)
      return
    }

    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [isOpen])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  const closePalette = () => setIsOpen(false)

  const openResult = (result: SearchResult) => {
    router.push(result.href)
    closePalette()
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      closePalette()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => Math.min(current + 1, filteredResults.length - 1))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, 0))
      return
    }

    if (event.key === 'Enter' && filteredResults[activeIndex]) {
      event.preventDefault()
      openResult(filteredResults[activeIndex])
    }
  }

  if (!isOpen) {
    return null
  }

  let resultIndex = -1

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close search"
        className="fixed inset-0 cursor-default"
        onClick={closePalette}
      />

      <div className="relative mx-auto mt-24 w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search guilds, bounties, or users..."
            className="h-11 flex-1 bg-transparent text-base text-white placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="hidden rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-400 sm:inline">
            ESC
          </kbd>
          <button
            type="button"
            onClick={closePalette}
            className="rounded-md p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[28rem] overflow-y-auto p-2">
          {filteredResults.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              No matching guilds, bounties, or users.
            </div>
          ) : (
            (['Guilds', 'Bounties', 'Users'] as SearchSection[]).map((section) => {
              const sectionResults = groupedResults[section]
              const SectionIcon = SECTION_ICONS[section]

              if (sectionResults.length === 0) {
                return null
              }

              return (
                <section key={section} className="py-2">
                  <div className="mb-1 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <SectionIcon className="h-3.5 w-3.5" />
                    {section}
                  </div>
                  <div className="space-y-1">
                    {sectionResults.map((result) => {
                      resultIndex += 1
                      const isActive = resultIndex === activeIndex

                      return (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => openResult(result)}
                          onMouseEnter={() => setActiveIndex(resultIndex)}
                          className={cn(
                            'flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition',
                            isActive ? 'bg-indigo-500/15 text-white' : 'text-slate-300 hover:bg-slate-800/80'
                          )}
                        >
                          <FileText className="mt-0.5 h-4 w-4 flex-none text-indigo-300" />
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{result.title}</span>
                            <span className="block truncate text-sm text-slate-500">
                              {result.description}
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3 text-xs text-slate-500">
          <span>Use ↑↓ to navigate and Enter to open</span>
          <span>Cmd/Ctrl + K</span>
        </div>
      </div>
    </div>
  )
}
