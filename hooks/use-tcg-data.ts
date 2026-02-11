"use client"

import { useState, useEffect, useMemo, startTransition } from "react"
import type { PokemonCard, CachedSet, CachedMeta, CardFilters, TcgCardsResponse } from "@/lib/types"
import { MOCK_CARDS, MOCK_TYPES, MOCK_RARITIES } from "@/lib/mock-data"
import {
  getCachedSets,
  setCachedSets,
  isSetsStale,
  getCachedMeta,
  setCachedMeta,
  isMetaStale,
  getCardFromCache,
  putCardsInCacheAndPersist,
  getSetFeaturedCache,
  setSetFeaturedCache,
  isSetFeaturedCacheStale,
} from "@/lib/card-cache"

// ── useSets ──

const DEFAULT_META: CachedMeta = { types: MOCK_TYPES, rarities: MOCK_RARITIES, subtypes: [] }

export function useSets() {
  // Deterministic initial value for SSR; localStorage hydration happens in effect
  const [sets, setSets] = useState<CachedSet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Hydrate from localStorage first (synchronous, idempotent)
    const cached = getCachedSets()
    if (cached && cached.length > 0) {
      startTransition(() => setSets(cached))
      if (!isSetsStale()) return
    }

    const controller = new AbortController()
    startTransition(() => setLoading(true))

    fetch("/api/tcg/sets", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then((data: { sets: CachedSet[] }) => {
        setCachedSets(data.sets)
        startTransition(() => {
          setSets(data.sets)
          setError(null)
          setLoading(false)
        })
      })
      .catch((err) => {
        if (err.name === "AbortError") return
        console.error("useSets error:", err)
        startTransition(() => {
          setError(err.message)
          setLoading(false)
        })
      })

    // Cleanup aborts in-flight fetch; React will re-run the effect on remount
    return () => controller.abort()
  }, [])

  return { sets, loading, error }
}

// ── useMeta ──

export function useMeta() {
  // Deterministic initial value for SSR; localStorage hydration happens in effect
  const [meta, setMeta] = useState<CachedMeta>(DEFAULT_META)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Hydrate from localStorage first (synchronous, idempotent)
    const cached = getCachedMeta()
    if (cached) {
      startTransition(() => setMeta(cached))
      if (!isMetaStale()) return
    }

    const controller = new AbortController()
    startTransition(() => setLoading(true))

    fetch("/api/tcg/meta", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then((data: CachedMeta) => {
        setCachedMeta(data)
        startTransition(() => {
          setMeta(data)
          setError(null)
          setLoading(false)
        })
      })
      .catch((err) => {
        if (err.name === "AbortError") return
        console.error("useMeta error:", err)
        startTransition(() => {
          setError(err.message)
          setLoading(false)
        })
      })

    // Cleanup aborts in-flight fetch; React will re-run the effect on remount
    return () => controller.abort()
  }, [])

  return { meta, loading, error }
}

// ── useSearchCards ──

interface UseSearchCardsOpts {
  q?: string
  page?: number
  pageSize?: number
  filters?: CardFilters
  enabled?: boolean
  /** Pre-built Lucene query — bypasses q + filters building */
  rawQuery?: string
  /** API orderBy param, e.g. "number" or "-rarity" */
  orderBy?: string
}

export function useSearchCards(opts: UseSearchCardsOpts) {
  const { q, page = 1, pageSize = 20, filters, enabled = true, rawQuery, orderBy } = opts
  const [result, setResult] = useState<TcgCardsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Build Lucene query from filters + q
  const luceneQuery = useMemo(() => {
    const parts: string[] = []
    if (q?.trim()) {
      parts.push(`name:"${q.trim()}*"`)
    }
    if (filters) {
      if (filters.set.length > 0) {
        const setQ = filters.set.map((s) => `"${s}"`).join(" OR ")
        parts.push(`set.name:(${setQ})`)
      }
      if (filters.type.length > 0) {
        const typeQ = filters.type.map((t) => `"${t}"`).join(" OR ")
        parts.push(`types:(${typeQ})`)
      }
      if (filters.rarity.length > 0) {
        const rarQ = filters.rarity.map((r) => `"${r}"`).join(" OR ")
        parts.push(`rarity:(${rarQ})`)
      }
      if (filters.artist.length > 0) {
        const artQ = filters.artist.map((a) => `"${a}"`).join(" OR ")
        parts.push(`artist:(${artQ})`)
      }
    }
    return parts.join(" ") || undefined
  }, [q, filters])

  useEffect(() => {
    if (!enabled) return

    const params = new URLSearchParams()
    const finalQuery = rawQuery ?? luceneQuery
    if (finalQuery) params.set("q", finalQuery)
    params.set("page", String(page))
    params.set("pageSize", String(pageSize))
    if (orderBy) params.set("orderBy", orderBy)

    const controller = new AbortController()
    startTransition(() => {
      setLoading(true)
      setError(null)
    })

    fetch(`/api/tcg/cards?${params.toString()}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then((data: TcgCardsResponse) => {
        putCardsInCacheAndPersist(data.cards)
        startTransition(() => {
          setResult(data)
          setLoading(false)
        })
      })
      .catch((err) => {
        if (err.name === "AbortError") return
        console.error("useSearchCards error:", err)
        startTransition(() => {
          setError(err.message)
          // Fallback to MOCK_CARDS on error
          setResult({
            cards: MOCK_CARDS,
            totalCount: MOCK_CARDS.length,
            page: 1,
            pageSize: MOCK_CARDS.length,
          })
          setLoading(false)
        })
      })

    return () => controller.abort()
  }, [luceneQuery, rawQuery, orderBy, page, pageSize, enabled])

  return { result, loading, error }
}

// ── useFeaturedCards ──

export function useFeaturedCards(setId: string | undefined, limit = 8) {
  // Read cache once on mount (safe — only called client-side)
  const [{ cached, needsFetch }] = useState(() => {
    if (!setId) return { cached: null as PokemonCard[] | null, needsFetch: true }
    const c = getSetFeaturedCache(setId)
    return { cached: c, needsFetch: !c || isSetFeaturedCacheStale(setId) }
  })

  const [cards, setCards] = useState<PokemonCard[]>(cached ?? [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!setId || !needsFetch) return

    const controller = new AbortController()
    if (cards.length === 0) startTransition(() => setLoading(true))

    const params = new URLSearchParams()
    params.set("q", `set.id:"${setId}"`)
    params.set("pageSize", String(limit))
    params.set("orderBy", "-rarity")

    fetch(`/api/tcg/cards?${params.toString()}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then((data: TcgCardsResponse) => {
        putCardsInCacheAndPersist(data.cards)
        setSetFeaturedCache(setId, data.cards)
        startTransition(() => {
          setCards(data.cards)
          setLoading(false)
        })
      })
      .catch((err) => {
        if (err.name === "AbortError") return
        console.error("useFeaturedCards error:", err)
        startTransition(() => setLoading(false))
      })

    return () => controller.abort()
  }, [setId, limit, needsFetch, cards.length])

  return { cards, loading }
}

// ── useCardsById ──

export function useCardsById(cardIds: string[]) {
  const [resolvedCards, setResolvedCards] = useState<Map<string, PokemonCard>>(new Map())
  const [loading, setLoading] = useState(false)
  const cardIdsKey = cardIds.join(",")

  useEffect(() => {
    if (cardIds.length === 0) {
      startTransition(() => setResolvedCards(new Map()))
      return
    }

    const resolved = new Map<string, PokemonCard>()
    const missing: string[] = []

    for (const id of cardIds) {
      const cached = getCardFromCache(id)
      if (cached) {
        resolved.set(id, cached)
      } else {
        missing.push(id)
      }
    }

    if (missing.length === 0) {
      startTransition(() => setResolvedCards(resolved))
      return
    }

    startTransition(() => setLoading(true))

    const controller = new AbortController()

    // Fetch missing cards individually
    Promise.all(
      missing.map((id) =>
        fetch(`/api/tcg/cards/${id}`, { signal: controller.signal })
          .then((r) => {
            if (!r.ok) return null
            return r.json()
          })
          .then((data: { card: PokemonCard } | null) => {
            if (data?.card) {
              resolved.set(id, data.card)
              putCardsInCacheAndPersist([data.card])
            }
          })
          .catch(() => {})
      )
    ).finally(() => {
      startTransition(() => {
        setResolvedCards(new Map(resolved))
        setLoading(false)
      })
    })

    return () => controller.abort()
  }, [cardIdsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return { cards: resolvedCards, loading }
}
