'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Search as SearchIcon, X, Users, Coins, User } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ---------- types ---------- */

interface SearchResult {
  id: string
  title: string
  section: 'guilds' | 'bounties' | 'users'
  url?: string
}

interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/* ---------- dummy data (independence note) ---------- */

const DUMMY_RESULTS: SearchResult[] = [
  { id: 'g1', title: 'Stellar Developers Guild', section: 'guilds', url: '/guilds/stellar-devs' },
  { id: 'g2', title: 'Rust Builders Collective', section: 'guilds', url: '/guilds/rust-builders' },
  { id: 'g3', title: 'Protocol Engineers', section: 'guilds', url: '/guilds/protocol-eng' },
  { id: 'b1', title: 'Fix OAuth2 token refresh flow', section: 'bounties', url: '/bounties/42' },
  { id: 'b2', title: 'Add S3 file storage adapter', section: 'bounties', url: '/bounties/43' },
  { id: 'b3', title: 'Implement role-based guards', section: 'bounties', url: '/bounties/44' },
  { id: 'u1', title: 'alice_stellar', section: 'users', url: '/users/alice' },
  { id: 'u2', title: 'bob_builder', section: 'users', url: '/users/bob' },
]

const SECTION_META: Record<SearchResult['section'], { label: string; icon: React.ElementType }> = {
  guilds:    { label: 'Guilds',    icon: Users },
  bounties:  { label: 'Bounties',  icon: Coins },
  users:     { label: 'Users',     icon: User },
}

/* ---------- component ---------- */

export default function CommandPalette({
  open: controlledOpen,
  onOpenChange,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen ?? internalOpen
  const setIsOpen = onOpenChange ?? setInternalOpen

  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // ---- filter ----
  const filtered = DUMMY_RESULTS.filter((r) =>
    r.title.toLowerCase().includes(query.toLowerCase())
  )

  // group by section preserving order
  const grouped = Object.entries(SECTION_META).reduce<Record<string, SearchResult[]>>((acc, [key]) => {
    const hits = filtered.filter((r) => r.section === key)
    if (hits.length > 0) acc[key] = hits
    return acc
  }, {})

  const flatResults = Object.values(grouped).flat()

  // ---- keyboard shortcut (Cmd+K / Ctrl+K) ----
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, setIsOpen])

  // ---- focus input when opened ----
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIndex(0)
      // small delay so the transition starts
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [isOpen])

  // ---- arrow-key navigation ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (flatResults[activeIndex]?.url) {
            window.location.href = flatResults[activeIndex].url!
          }
          break
      }
    },
    [activeIndex, flatResults]
  )

  // ---- scroll active item into view ----
  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.querySelector('[data-active="true"]') as HTMLElement
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* dialog */}
      <div
        className="relative w-full max-w-xl rounded-xl border border-stellar-lightNavy bg-stellar-navy/95 shadow-2xl backdrop-blur-md overflow-hidden"
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded="true"
      >
        {/* search row */}
        <div className="flex items-center gap-3 border-b border-stellar-lightNavy px-4">
          <SearchIcon className="h-4 w-4 shrink-0 text-stellar-slate" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0) }}
            placeholder="Search guilds, bounties, users…"
            className="flex-1 bg-transparent py-3.5 text-sm text-stellar-white placeholder:text-stellar-slate focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-stellar-lightNavy bg-stellar-lightNavy/80 px-1.5 text-[10px] text-stellar-slate font-medium">
            ESC
          </kbd>
        </div>

        {/* results */}
        <ul ref={listRef} className="max-h-80 overflow-y-auto py-2" role="listbox">
          {flatResults.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-stellar-slate">
              No results found for &ldquo;{query}&rdquo;
            </li>
          )}

          {Object.entries(grouped).map(([section, results]) => (
            <li key={section} role="presentation">
              {/* section header */}
              <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-stellar-slate/70">
                {SECTION_META[section as SearchResult['section']].label}
              </div>
              {results.map((result) => {
                const idx = flatResults.indexOf(result)
                const isActive = idx === activeIndex
                const meta = SECTION_META[result.section]
                const Icon = meta.icon

                return (
                  <button
                    key={result.id}
                    role="option"
                    aria-selected={isActive}
                    data-active={isActive || undefined}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                      isActive
                        ? 'bg-gold-500/10 text-stellar-white'
                        : 'text-stellar-slate hover:bg-stellar-lightNavy/50 hover:text-stellar-white'
                    )}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => result.url && (window.location.href = result.url)}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
                    <span className="flex-1 truncate">{result.title}</span>
                    {isActive && (
                      <span className="text-[10px] text-stellar-slate/50">↵</span>
                    )}
                  </button>
                )
              })}
            </li>
          ))}
        </ul>

        {/* footer */}
        <div className="flex items-center justify-between border-t border-stellar-lightNavy px-4 py-2.5 text-[10px] text-stellar-slate/50">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-stellar-lightNavy bg-stellar-lightNavy/60 px-1">↑↓</kbd> navigate
            <kbd className="ml-1.5 rounded border border-stellar-lightNavy bg-stellar-lightNavy/60 px-1">↵</kbd> open
            <kbd className="ml-1.5 rounded border border-stellar-lightNavy bg-stellar-lightNavy/60 px-1">esc</kbd> close
          </span>
          <span>Cmd+K to toggle</span>
        </div>
      </div>
    </div>
  )
}
