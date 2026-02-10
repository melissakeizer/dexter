"use client"

import { useState, useEffect, useRef, useMemo, startTransition } from "react"
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
} from "@/lib/card-cache"

// ── useSets ──

const DEFAULT_META: CachedMeta = { types: MOCK_TYPES, rarities: MOCK_RARITIES, subtypes: [] }

export function useSets() {
  // Start with empty array (deterministic for SSR), hydrate from localStorage in effect
  const [sets, setSets] = useState<CachedSet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    // Hydrate from localStorage first
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

    return () => controller.abort()
  }, [])

  return { sets, loading, error }
}

// ── useMeta ──

export function useMeta() {
  // Start with deterministic defaults (safe for SSR), hydrate from localStorage in effect
  const [meta, setMeta] = useState<CachedMeta>(DEFAULT_META)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true

    // Hydrate from localStorage first
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
}

export function useSearchCards(opts: UseSearchCardsOpts) {
  const { q, page = 1, pageSize = 20, filters, enabled = true } = opts
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
    if (luceneQuery) params.set("q", luceneQuery)
    params.set("page", String(page))
    params.set("pageSize", String(pageSize))

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
  }, [luceneQuery, page, pageSize, enabled])

  return { result, loading, error }
}

// ── useFeaturedCards ──

export function useFeaturedCards(setId: string | undefined, limit = 8) {
  const [cards, setCards] = useState<PokemonCard[]>([])
  const [loading, setLoading] = useState(false)
  const fetched = useRef<string | null>(null)

  useEffect(() => {
    if (!setId || fetched.current === setId) return
    fetched.current = setId

    const controller = new AbortController()
    startTransition(() => setLoading(true))

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
  }, [setId, limit])

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
