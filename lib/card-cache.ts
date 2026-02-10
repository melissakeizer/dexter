import type { PokemonCard, CachedSet, CachedMeta } from "./types"
import { MOCK_CARDS } from "./mock-data"

// ── In-memory card map (seeded from MOCK_CARDS) ──

const cardMap = new Map<string, PokemonCard>()

// Seed with mock data
for (const card of MOCK_CARDS) {
  cardMap.set(card.id, card)
}

export function getCardFromCache(id: string): PokemonCard | undefined {
  return cardMap.get(id)
}

export function putCardInCache(card: PokemonCard) {
  cardMap.set(card.id, card)
}

export function putCardsInCache(cards: PokemonCard[]) {
  for (const card of cards) {
    cardMap.set(card.id, card)
  }
}

export function getAllCachedCards(): PokemonCard[] {
  return Array.from(cardMap.values())
}

// ── localStorage persistence ──

const LS_SETS = "tcg_sets"
const LS_META = "tcg_meta"
const LS_CARD_CACHE = "tcg_card_cache"
const LS_TIMESTAMPS = "tcg_cache_timestamps"

const STALE_SETS = 24 * 60 * 60 * 1000 // 24h
const STALE_META = 24 * 60 * 60 * 1000 // 24h
const STALE_SET_CARDS = 60 * 60 * 1000 // 1h
const MAX_CARD_CACHE = 500

function getTimestamps(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(LS_TIMESTAMPS) ?? "{}")
  } catch {
    return {}
  }
}

function setTimestamp(key: string) {
  const ts = getTimestamps()
  ts[key] = Date.now()
  localStorage.setItem(LS_TIMESTAMPS, JSON.stringify(ts))
}

// ── Sets ──

export function getCachedSets(): CachedSet[] | null {
  try {
    const raw = localStorage.getItem(LS_SETS)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setCachedSets(sets: CachedSet[]) {
  try {
    localStorage.setItem(LS_SETS, JSON.stringify(sets))
    setTimestamp(LS_SETS)
  } catch { /* quota exceeded */ }
}

export function isSetsStale(): boolean {
  const ts = getTimestamps()[LS_SETS]
  if (!ts) return true
  return Date.now() - ts > STALE_SETS
}

// ── Meta ──

export function getCachedMeta(): CachedMeta | null {
  try {
    const raw = localStorage.getItem(LS_META)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setCachedMeta(meta: CachedMeta) {
  try {
    localStorage.setItem(LS_META, JSON.stringify(meta))
    setTimestamp(LS_META)
  } catch { /* quota exceeded */ }
}

export function isMetaStale(): boolean {
  const ts = getTimestamps()[LS_META]
  if (!ts) return true
  return Date.now() - ts > STALE_META
}

// ── Set card lists ──

function setCardKey(setId: string) {
  return `tcg_set_cards_${setId}`
}

export function getSetCardCache(setId: string): { cards: PokemonCard[]; totalCount: number } | null {
  try {
    const raw = localStorage.getItem(setCardKey(setId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setSetCardCache(setId: string, data: { cards: PokemonCard[]; totalCount: number }) {
  try {
    localStorage.setItem(setCardKey(setId), JSON.stringify(data))
    setTimestamp(setCardKey(setId))
  } catch { /* quota exceeded */ }
}

export function isSetCardCacheStale(setId: string): boolean {
  const ts = getTimestamps()[setCardKey(setId)]
  if (!ts) return true
  return Date.now() - ts > STALE_SET_CARDS
}

// ── Card cache persistence ──

function persistCardCache() {
  try {
    const entries = Array.from(cardMap.entries())
    // Only persist the most recent MAX_CARD_CACHE entries (skip mock IDs since they're always in memory)
    const nonMockEntries = entries.filter(([id]) => !MOCK_CARDS.some((m) => m.id === id))
    const capped = nonMockEntries.slice(-MAX_CARD_CACHE)
    localStorage.setItem(LS_CARD_CACHE, JSON.stringify(capped))
  } catch { /* quota exceeded */ }
}

export function hydrateCardCache() {
  try {
    const raw = localStorage.getItem(LS_CARD_CACHE)
    if (!raw) return
    const entries: [string, PokemonCard][] = JSON.parse(raw)
    for (const [id, card] of entries) {
      if (!cardMap.has(id)) {
        cardMap.set(id, card)
      }
    }
  } catch { /* ignore */ }
}

// Call persistCardCache after putting cards in cache
const originalPutCards = putCardsInCache
export { persistCardCache }

// Auto-persist when adding cards (debounced)
let persistTimer: ReturnType<typeof setTimeout> | null = null

export function putCardsInCacheAndPersist(cards: PokemonCard[]) {
  putCardsInCache(cards)
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(persistCardCache, 2000)
}
