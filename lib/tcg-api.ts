import type { TcgApiCard, TcgApiSet, PokemonCard, CachedSet, CachedMeta } from "./types"

// ── In-memory server cache ──

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()

const TTL_SETS = 24 * 60 * 60 * 1000 // 24h
const TTL_META = 24 * 60 * 60 * 1000 // 24h
const TTL_CARDS = 15 * 60 * 1000     // 15min
const TTL_CURATED = 6 * 60 * 60 * 1000 // 6h
const CURATED_TARGET = 40
const CURATED_PER_SET = 10
const CURATED_MIN_SETS = 6
const CURATED_MAX_SETS = 12

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) return null // keep entry for stale fallback
  return entry.data as T
}

/** Return cached data even if expired (stale-while-revalidate). */
function getAnyCached<T>(key: string): T | null {
  const entry = cache.get(key)
  return entry ? (entry.data as T) : null
}

function setCached<T>(key: string, data: T, ttl: number) {
  cache.set(key, { data, expiresAt: Date.now() + ttl })
}

// ── API helpers ──

const BASE_URL = "https://api.pokemontcg.io/v2"
const FETCH_TIMEOUT = 12_000 // 12s
const MAX_RETRIES = 2
const RETRYABLE_STATUSES = new Set([429, 502, 504])

function apiHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" }
  const key = process.env.POKEMONTCG_API_KEY
  if (key && key !== "your_api_key_here") {
    headers["X-Api-Key"] = key
  }
  return headers
}

async function apiFetch<T>(path: string): Promise<T> {
  let lastError: Error = new Error("apiFetch failed")

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise<void>((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)))
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: apiHeaders(),
        signal: controller.signal,
      })
      clearTimeout(timer)

      if (!res.ok) {
        lastError = new Error(`TCG API ${res.status}: ${res.statusText}`)
        if (RETRYABLE_STATUSES.has(res.status) && attempt < MAX_RETRIES) continue
        throw lastError
      }

      return res.json() as Promise<T>
    } catch (err) {
      clearTimeout(timer)
      if (err === lastError) throw err // non-retryable HTTP status
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt >= MAX_RETRIES) throw lastError
    }
  }

  throw lastError
}

// ── Transform ──

export function transformCard(raw: TcgApiCard): PokemonCard {
  return {
    id: raw.id,
    name: raw.name,
    set: raw.set.name,
    setId: raw.set.id,
    number: raw.number,
    printedTotal: raw.set.printedTotal,
    setTotal: raw.set.total,
    rarity: raw.rarity ?? "Unknown",
    type: raw.types?.[0] ?? "Colorless",
    artist: raw.artist ?? "Unknown",
    imageUrl: raw.images.small,
    status: "none",
  }
}

function transformSet(raw: TcgApiSet): CachedSet {
  return {
    id: raw.id,
    name: raw.name,
    series: raw.series,
    total: raw.total,
    releaseDate: raw.releaseDate,
    symbolUrl: raw.images.symbol,
    logoUrl: raw.images.logo,
  }
}

// ── Public API ──

export async function fetchSets(): Promise<CachedSet[]> {
  const cacheKey = "sets"
  const cached = getCached<CachedSet[]>(cacheKey)
  if (cached) return cached

  const res = await apiFetch<{ data: TcgApiSet[] }>("/sets?orderBy=-releaseDate&pageSize=100")
  const sets = res.data.map(transformSet)
  setCached(cacheKey, sets, TTL_SETS)
  return sets
}

export async function fetchMeta(): Promise<CachedMeta> {
  const cacheKey = "meta"
  const cached = getCached<CachedMeta>(cacheKey)
  if (cached) return cached

  const [typesRes, raritiesRes, subtypesRes] = await Promise.all([
    apiFetch<{ data: string[] }>("/types"),
    apiFetch<{ data: string[] }>("/rarities"),
    apiFetch<{ data: string[] }>("/subtypes"),
  ])

  const meta: CachedMeta = {
    types: typesRes.data,
    rarities: raritiesRes.data,
    subtypes: subtypesRes.data,
  }
  setCached(cacheKey, meta, TTL_META)
  return meta
}

type FetchCardsResult = { cards: PokemonCard[]; totalCount: number; page: number; pageSize: number; stale?: boolean }

export async function fetchCards(opts: {
  q?: string
  page?: number
  pageSize?: number
  orderBy?: string
}): Promise<FetchCardsResult> {
  const page = opts.page ?? 1
  const pageSize = opts.pageSize ?? 20
  const orderBy = opts.orderBy ?? "-set.releaseDate"

  const params = new URLSearchParams()
  if (opts.q) params.set("q", opts.q)
  params.set("page", String(page))
  params.set("pageSize", String(pageSize))
  params.set("orderBy", orderBy)

  const cacheKey = `cards:${params.toString()}`
  const cached = getCached<FetchCardsResult>(cacheKey)
  if (cached) return cached

  try {
    const res = await apiFetch<{ data: TcgApiCard[]; totalCount: number }>(
      `/cards?${params.toString()}`
    )

    const result: FetchCardsResult = {
      cards: res.data.map(transformCard),
      totalCount: res.totalCount,
      page,
      pageSize,
    }
    setCached(cacheKey, result, TTL_CARDS)
    return result
  } catch (err) {
    // Stale-while-revalidate: return expired cache if available
    const stale = getAnyCached<FetchCardsResult>(cacheKey)
    if (stale) return { ...stale, stale: true }
    throw err
  }
}

// ── Curated gallery ──

/** mulberry32 seeded PRNG */
function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Seeded Fisher-Yates shuffle (in-place) */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function getTimeWindow(): number {
  return Math.floor(Date.now() / TTL_CURATED)
}

/** Rarity score — higher means rarer / more desirable for curated picks */
const RARITY_SCORE: Record<string, number> = {
  "Special Illustration Rare": 100,
  "Hyper Rare": 95,
  "Illustration Rare": 90,
  "Rare Secret": 85,
  "Ultra Rare": 80,
  "Double Rare": 75,
  "Rare Holo VMAX": 70,
  "Rare Holo VSTAR": 65,
  "Rare Holo V": 60,
  "Rare Holo GX": 55,
  "Rare Holo EX": 50,
  "Rare Holo": 45,
  "Rare": 40,
}

function cardSortScore(card: PokemonCard): number {
  const num = parseInt(card.number, 10)
  const isSecret = !isNaN(num) && card.printedTotal != null && num > card.printedTotal
  const rarity = RARITY_SCORE[card.rarity] ?? 0
  // Secrets get a large bonus so they always appear first
  return (isSecret ? 1000 : 0) + rarity
}

type CuratedResult = { cards: PokemonCard[]; windowKey: number; stale?: boolean }

export async function fetchCuratedCards(): Promise<CuratedResult> {
  const windowKey = getTimeWindow()
  const cacheKey = `curated:${windowKey}`

  const cached = getCached<CuratedResult>(cacheKey)
  if (cached) return cached

  try {
    // 1. Get sets (cached 24h) and pick deterministically
    const allSets = await fetchSets()
    if (allSets.length === 0) throw new Error("No sets available")

    const shuffledSets = seededShuffle([...allSets], windowKey)

    // 2. Fetch sets in batches until we have enough cards
    const allCards: PokemonCard[] = []
    const seen = new Set<string>()
    let setIndex = 0

    while (allCards.length < CURATED_TARGET && setIndex < Math.min(shuffledSets.length, CURATED_MAX_SETS)) {
      const batchSize = setIndex === 0 ? CURATED_MIN_SETS : 2
      const batch = shuffledSets.slice(setIndex, setIndex + batchSize)
      setIndex += batch.length

      const results = await Promise.allSettled(
        batch.map((set) =>
          fetchCards({ q: `set.id:"${set.id}"`, pageSize: 60, orderBy: "number" })
        )
      )

      for (const r of results) {
        if (r.status !== "fulfilled") continue

        // Sort: secret rares first, then by rarity score desc
        const sorted = [...r.value.cards].sort((a, b) => cardSortScore(b) - cardSortScore(a))

        // Take top cards from this set, dedupe
        let taken = 0
        for (const card of sorted) {
          if (taken >= CURATED_PER_SET) break
          if (!seen.has(card.id)) {
            seen.add(card.id)
            allCards.push(card)
            taken++
          }
        }
      }
    }

    if (allCards.length === 0) throw new Error("All set fetches failed")

    const result: CuratedResult = { cards: allCards.slice(0, CURATED_TARGET), windowKey }
    setCached(cacheKey, result, TTL_CURATED)
    setCached("curated:latest", result, TTL_CURATED * 4) // long-lived fallback
    return result
  } catch {
    // Stale-while-revalidate: return any previous curated result
    const stale =
      getAnyCached<CuratedResult>(cacheKey) ??
      getAnyCached<CuratedResult>("curated:latest")
    if (stale) return { ...stale, stale: true }
    throw new Error("No curated cards available")
  }
}

export async function fetchCardById(id: string): Promise<PokemonCard | null> {
  const cacheKey = `card:${id}`
  const cached = getCached<PokemonCard>(cacheKey)
  if (cached) return cached

  try {
    const res = await apiFetch<{ data: TcgApiCard }>(`/cards/${id}`)
    const card = transformCard(res.data)
    setCached(cacheKey, card, TTL_CARDS)
    return card
  } catch {
    return null
  }
}
