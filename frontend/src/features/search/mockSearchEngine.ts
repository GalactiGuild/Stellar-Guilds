import { MOCK_BOUNTIES } from '@/lib/mocks/bounties'
import { mockGuildDetails } from '@/lib/mocks/guilds'
import { mockUser, mockActivity } from '@/features/profile/mockData'
import type {
  SearchQueryState,
  SearchResponse,
  SearchResultBase,
  SearchFacets,
  SearchFilters,
} from './types'

function sanitizeSearchTerm(raw: string): string {
  return raw.trim().slice(0, 120).replace(/[\u0000-\u001F]+/g, '')
}

function textScore(haystack: string, needle: string): number {
  const h = haystack.toLowerCase()
  const n = needle.toLowerCase()
  if (!n) return 0
  if (h === n) return 120
  if (h.startsWith(n)) return 100
  if (h.includes(n)) return 70
  const tokens = n.split(/\s+/).filter(Boolean)
  let score = 0
  for (const t of tokens) {
    if (h.includes(t)) score += 20
  }
  return score
}

function matchesFiltersForBounty(filters: SearchFilters, status: string, difficulty: string, tags: string[], rewardAmount: number): boolean {
  const statusOk =
    filters.bountyStatus.length === 0 ||
    filters.bountyStatus.includes(status)

  const difficultyOk =
    filters.bountyDifficulty.length === 0 ||
    filters.bountyDifficulty.includes(difficulty)

  const tagsOk =
    filters.tags.length === 0 ||
    filters.tags.some((t) => tags.includes(t))

  const rewardOk =
    (filters.minReward == null || rewardAmount >= filters.minReward) &&
    (filters.maxReward == null || rewardAmount <= filters.maxReward)

  return statusOk && difficultyOk && tagsOk && rewardOk
}

function matchesFiltersForGuild(filters: SearchFilters, category: string, tier: string): boolean {
  const categoryOk =
    filters.guildCategory.length === 0 ||
    filters.guildCategory.includes(category)

  const tierOk =
    filters.guildTier.length === 0 ||
    filters.guildTier.includes(tier)

  return categoryOk && tierOk
}

function buildFacets(results: SearchResultBase[]): SearchFacets {
  const counters = {
    sections: new Map<string, number>(),
    bountyStatus: new Map<string, number>(),
    bountyDifficulty: new Map<string, number>(),
    guildCategory: new Map<string, number>(),
    guildTier: new Map<string, number>(),
    tags: new Map<string, number>(),
  }

  for (const r of results) {
    counters.sections.set(r.kind, (counters.sections.get(r.kind) ?? 0) + 1)

    if (r.kind === 'bounty' && r.meta) {
      const status = String(r.meta.status ?? '')
      const difficulty = String(r.meta.difficulty ?? '')
      const tags = (r.meta.tags as string[]) ?? []
      if (status) {
        counters.bountyStatus.set(status, (counters.bountyStatus.get(status) ?? 0) + 1)
      }
      if (difficulty) {
        counters.bountyDifficulty.set(
          difficulty,
          (counters.bountyDifficulty.get(difficulty) ?? 0) + 1,
        )
      }
      for (const tag of tags) {
        counters.tags.set(tag, (counters.tags.get(tag) ?? 0) + 1)
      }
    }

    if (r.kind === 'guild' && r.meta) {
      const category = String(r.meta.category ?? '')
      const tier = String(r.meta.tier ?? '')
      if (category) {
        counters.guildCategory.set(
          category,
          (counters.guildCategory.get(category) ?? 0) + 1,
        )
      }
      if (tier) {
        counters.guildTier.set(tier, (counters.guildTier.get(tier) ?? 0) + 1)
      }
    }
  }

  const toFacet = (map: Map<string, number>) =>
    Array.from(map.entries())
      .map(([value, count]) => ({
        value,
        label: value,
        count,
      }))
      .sort((a, b) => b.count - a.count)

  return {
    sections: toFacet(counters.sections),
    bountyStatus: toFacet(counters.bountyStatus),
    bountyDifficulty: toFacet(counters.bountyDifficulty),
    guildCategory: toFacet(counters.guildCategory),
    guildTier: toFacet(counters.guildTier),
    tags: toFacet(counters.tags),
  }
}

export async function executeMockSearch(query: SearchQueryState): Promise<SearchResponse> {
  const term = sanitizeSearchTerm(query.term)
  const termLower = term.toLowerCase()
  const wantsAll = query.section === 'all'

  const results: SearchResultBase[] = []

  if (wantsAll || query.section === 'bounties') {
    for (const bounty of MOCK_BOUNTIES) {
      const titleScore = textScore(bounty.title, termLower)
      const descScore = textScore(bounty.description, termLower)
      const tagScore = textScore(bounty.tags.join(' '), termLower)
      const score = titleScore + descScore + tagScore
      const matchesTerm = !term || score > 0

      if (
        matchesTerm &&
        matchesFiltersForBounty(
          query.filters,
          bounty.status,
          bounty.difficulty,
          bounty.tags,
          bounty.rewardAmount,
        )
      ) {
        results.push({
          id: `bounty-${bounty.id}`,
          kind: 'bounty',
          title: bounty.title,
          subtitle: bounty.guildName,
          href: `/bounties?id=${bounty.id}`,
          badge: bounty.status,
          score: score + bounty.rewardAmount / 100,
          meta: {
            status: bounty.status,
            difficulty: bounty.difficulty,
            rewardAmount: bounty.rewardAmount,
            tokenSymbol: bounty.tokenSymbol,
            tags: bounty.tags,
          },
        })
      }
    }
  }

  if (wantsAll || query.section === 'guilds') {
    for (const guild of mockGuildDetails) {
      const titleScore = textScore(guild.name, termLower)
      const descScore = textScore(guild.description, termLower)
      const categoryScore = textScore(guild.category ?? '', termLower)
      const score = titleScore + descScore + categoryScore
      const matchesTerm = !term || score > 0

      if (matchesTerm && matchesFiltersForGuild(query.filters, guild.category ?? '', guild.tier)) {
        results.push({
          id: `guild-${guild.id}`,
          kind: 'guild',
          title: guild.name,
          subtitle: guild.description,
          href: `/guilds?id=${guild.id}`,
          badge: guild.tier,
          score: score + guild.memberCount / 10,
          meta: {
            category: guild.category,
            tier: guild.tier,
            memberCount: guild.memberCount,
            reputation: guild.reputation,
          },
        })
      }
    }
  }

  if (wantsAll || query.section === 'users') {
    const titleScore = textScore(mockUser.displayName, termLower)
    const bioScore = textScore(mockUser.bio, termLower)
    const score = titleScore + bioScore
    const matchesTerm = !term || score > 0

    if (matchesTerm) {
      results.push({
        id: 'user-' + mockUser.address,
        kind: 'user',
        title: mockUser.displayName,
        subtitle: mockUser.bio,
        href: `/profile/${mockUser.address}`,
        badge: mockUser.tier,
        score: score + mockUser.reputationScore / 10,
        meta: {
          address: mockUser.address,
          tier: mockUser.tier,
        },
      })
    }
  }

  if (wantsAll || query.section === 'tags') {
    const tagSet = new Set<string>()

    for (const bounty of MOCK_BOUNTIES) {
      for (const tag of bounty.tags) {
        if (!term || textScore(tag, termLower) > 0) {
          tagSet.add(tag)
        }
      }
    }

    for (const activity of mockActivity) {
      if (!term || textScore(activity.title, termLower) > 0) {
        tagSet.add(activity.type)
      }
    }

    for (const tag of tagSet) {
      results.push({
        id: `tag-${tag}`,
        kind: 'tag',
        title: tag,
        score: textScore(tag, termLower) + 10,
      })
    }
  }

  let sorted = [...results]

  if (query.filters.sortBy === 'relevance') {
    sorted.sort((a, b) => b.score - a.score)
  } else if (query.filters.sortBy === 'newest') {
    sorted.sort((a, b) => (a.id < b.id ? 1 : -1))
  } else if (query.filters.sortBy === 'reward-desc') {
    sorted.sort((a, b) => {
      const ar = (a.meta?.rewardAmount as number) ?? 0
      const br = (b.meta?.rewardAmount as number) ?? 0
      return br - ar
    })
  } else if (query.filters.sortBy === 'members-desc') {
    sorted.sort((a, b) => {
      const am = (a.meta?.memberCount as number) ?? 0
      const bm = (b.meta?.memberCount as number) ?? 0
      return bm - am
    })
  }

  const start = (query.page - 1) * query.pageSize
  const end = start + query.pageSize
  const pageResults = sorted.slice(start, end)

  const facets = buildFacets(results)

  await new Promise((resolve) => setTimeout(resolve, 150))

  return {
    results: pageResults,
    facets,
    total: results.length,
    page: query.page,
    pageSize: query.pageSize,
    hasMore: end < results.length,
  }
}

