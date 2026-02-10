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

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function setCached<T>(key: string, data: T, ttl: number) {
  cache.set(key, { data, expiresAt: Date.now() + ttl })
}

// ── API helpers ──

const BASE_URL = "https://api.pokemontcg.io/v2"

function apiHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" }
  const key = process.env.POKEMONTCG_API_KEY
  if (key && key !== "your_api_key_here") {
    headers["X-Api-Key"] = key
  }
  return headers
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: apiHeaders() })
  if (!res.ok) {
    throw new Error(`TCG API ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

// ── Transform ──

export function transformCard(raw: TcgApiCard): PokemonCard {
  return {
    id: raw.id,
    name: raw.name,
    set: raw.set.name,
    setId: raw.set.id,
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

export async function fetchCards(opts: {
  q?: string
  page?: number
  pageSize?: number
  orderBy?: string
}): Promise<{ cards: PokemonCard[]; totalCount: number; page: number; pageSize: number }> {
  const page = opts.page ?? 1
  const pageSize = opts.pageSize ?? 20
  const orderBy = opts.orderBy ?? "-set.releaseDate"

  const params = new URLSearchParams()
  if (opts.q) params.set("q", opts.q)
  params.set("page", String(page))
  params.set("pageSize", String(pageSize))
  params.set("orderBy", orderBy)

  const cacheKey = `cards:${params.toString()}`
  const cached = getCached<{ cards: PokemonCard[]; totalCount: number; page: number; pageSize: number }>(cacheKey)
  if (cached) return cached

  const res = await apiFetch<{ data: TcgApiCard[]; totalCount: number }>(
    `/cards?${params.toString()}`
  )

  const result = {
    cards: res.data.map(transformCard),
    totalCount: res.totalCount,
    page,
    pageSize,
  }
  setCached(cacheKey, result, TTL_CARDS)
  return result
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
