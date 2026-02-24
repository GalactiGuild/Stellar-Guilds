# Global Search Feature

This module implements the cross‑section search experience for Stellar Guilds.

It is designed to:

- **Search across entities** – bounties, guilds, contributors, and tags.
- **Support real‑time, debounced input** – 300 ms debounce with caching.
- **Expose faceted filtering** – status, difficulty, categories, tiers, tags.
- **Provide search history, suggestions, and saved queries** – persisted locally.
- **Prepare for backend integration** – swap the mock engine for API calls.

## Architecture

- `hooks/useSearch` – core search state and behavior:
  - 300 ms debounced search with in‑memory result cache (minimizes server calls).
  - Pagination + "infinite scroll" style `loadMore` with result concatenation.
  - Local storage for **history** and **saved searches**.
  - Notification toggles on saved searches (UI + state, backend optional).
- `features/search/mockSearchEngine` – current implementation uses mock data from:
  - `MOCK_BOUNTIES`
  - `mockGuildDetails`
  - profile mock user/activity
- `features/search/types` – shared query, filter, facet, and result types.
- `features/search/SearchPage` – page‑level composition.
- `components/Search/*` – reusable UI for input, filters, results, and meta sidebars.

To integrate with a real backend search service (e.g. Elasticsearch, Meilisearch, or a custom API),
replace `executeMockSearch` with a function that:

```ts
async function executeSearch(query: SearchQueryState): Promise<SearchResponse> {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  })
  if (!res.ok) throw new Error('Search request failed')
  return (await res.json()) as SearchResponse
}
```

and then update `useSearch` to call this function instead of the mock engine.

## Performance Benchmarking

When preparing your PR, capture basic performance metrics:

- **Response time** – in dev, log `performance.now()` before and after `executeMockSearch` (or the real API)
  and verify **p95 < 500 ms** for typical queries.
- **Debounce behavior** – use your browser's devtools to confirm that rapid typing does **not** fire
  more than ~3–4 requests per second thanks to the 300 ms debounce and client‑side cache.
- **Pagination** – verify that `loadMore` appends results without re‑fetching previous pages and that
  the infinite scroll sentinel only triggers a single in‑flight request at a time.

For production APIs, you should also:

- Add server‑side **query caching** (e.g. per term + filter key).
- Ensure the search index has appropriate **text, keyword, and numeric fields** with relevant analyzers.

## User Testing Scenarios

When manually testing the UX, run through these scenarios:

- **Basic keyword search**
  - Type a simple term (e.g. "design") and confirm results include matching bounties and guilds.
  - Clear the input and confirm search state resets to "idle".
- **Cross‑section search**
  - Switch between `All`, `Bounties`, `Guilds`, `Contributors`, `Tags` and verify result sets update.
- **Faceted filtering**
  - Apply bounty status/difficulty facets and confirm counts + results reflect active filters.
  - Apply guild category/tier facets and confirm only matching guilds are returned.
  - Combine multiple facets and ensure no inconsistent states or empty facets.
- **Sorting**
  - Toggle between relevance, newest, highest reward, and most members.
  - Confirm ordering visibly changes without losing current filters.
- **Saved searches & history**
  - Perform several searches; confirm they appear under "Recent searches".
  - Save a search, reload the page, confirm it's still available.
  - Toggle notifications on a saved search and verify state persistence.
- **Infinite scroll**
  - Scroll results until `loadMore` triggers; confirm more results are appended and the "Load more" CTA works.

## Security & Input Handling

Although the current implementation runs entirely on the client against mock data, treat search
input as untrusted:

- **Sanitization** – all terms are trimmed, length‑limited, and control characters are stripped before use.
- **Escaping** – when calling a backend, always send search terms as request body/parameters, not interpolated
  into raw queries; let the search engine handle escaping.
- **Rate limiting** – the 300 ms debounce and client‑side caching reduce request volume, but production
  APIs should still enforce per‑IP/user rate limits.
- **Injection safety** – if you add server‑side query builders, parameterize queries rather than string‑concat.

## Mobile Responsiveness

The `/search` page is responsive by design:

- On small screens:
  - Search bar is full‑width at the top.
  - Filters and meta panels stack below results, with vertical spacing.
- On medium+ screens:
  - Filters appear in a left column, results in the main column.
- On extra‑large screens:
  - Filters, results, and saved‑search/history sidebars are shown as three columns.

When testing mobile:

- Use responsive devtools to confirm layout at `375px`, `768px`, and `1024px`.
- Ensure tap targets (chips, facet badges, "Save current", etc.) are large enough and keyboard focus is visible.

