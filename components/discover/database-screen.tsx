"use client"

import { useState, useMemo, useEffect, useCallback, startTransition } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardTile } from "@/components/shared/card-tile"
import { CardTileSkeleton } from "@/components/shared/card-tile-skeleton"
import { CardDetailModal } from "@/components/shared/card-detail-modal"
import { QuickFilterBar } from "@/components/shared/quick-filter-bar"
import type { MetaFilter } from "@/lib/types"
import { useAppStore } from "@/lib/store"
import { dedupeById } from "@/lib/utils"
import { useSearchCards } from "@/hooks/use-tcg-data"
import type { PokemonCard, CardFilters } from "@/lib/types"

const CARDS_PER_PAGE = 20

const emptyFilters: CardFilters = { rarity: [], artist: [], set: [], type: [] }

interface DatabaseScreenProps {
  onBack: () => void
  initialFilters?: CardFilters
  initialQuery?: string
}

export function DatabaseScreen({
  onBack,
  initialFilters,
  initialQuery = "",
}: DatabaseScreenProps) {
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<CardFilters>(initialFilters ?? emptyFilters)
  const [metaFilters, setMetaFilters] = useState<MetaFilter[]>([])
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null)
  const [page, setPage] = useState(1)
  const [allFetchedCards, setAllFetchedCards] = useState<PokemonCard[]>([])
  const cardStates = useAppStore((s) => s.cardStates)

  // API search
  const { result, loading, error } = useSearchCards({
    q: query.trim() || undefined,
    page,
    pageSize: CARDS_PER_PAGE,
    filters,
  })

  // Accumulate cards across pages (dedupe to prevent duplicate keys)
  useEffect(() => {
    if (!result) return
    startTransition(() => {
      if (page === 1) {
        setAllFetchedCards(dedupeById(result.cards))
      } else {
        setAllFetchedCards((prev) => dedupeById([...prev, ...result.cards]))
      }
    })
  }, [result, page])

  // Reset page when filters/query change
  const handleFiltersChange = useCallback((f: CardFilters) => {
    setFilters(f)
    setPage(1)
    setAllFetchedCards([])
  }, [])

  const handleQueryChange = useCallback((q: string) => {
    setQuery(q)
    setPage(1)
    setAllFetchedCards([])
  }, [])

  // Overlay user card states
  const cardsWithStatus = useMemo(() => {
    return allFetchedCards.map((c) => ({
      ...c,
      status: cardStates[c.id]?.status ?? c.status,
    }))
  }, [allFetchedCards, cardStates])

  // Apply meta-filters client-side (API doesn't know user state)
  const filtered = useMemo(() => {
    let results = cardsWithStatus
    if (metaFilters.includes("owned")) {
      results = results.filter((c) => c.status === "owned")
    }
    if (metaFilters.includes("wishlist")) {
      results = results.filter((c) => c.status === "wishlist")
    }
    return results
  }, [cardsWithStatus, metaFilters])

  const totalCount = result?.totalCount ?? 0
  const hasMore = allFetchedCards.length < totalCount

  const isFirstLoad = loading && allFetchedCards.length === 0

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      {/* Header with back */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-colors active:bg-secondary/70"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Browse All Cards</h1>
          <p className="text-xs text-muted-foreground">
            {totalCount > 0
              ? `${totalCount.toLocaleString()} card${totalCount !== 1 ? "s" : ""}`
              : loading
                ? "Searching..."
                : `${filtered.length} card${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Search + quick chips + all-filters */}
      <QuickFilterBar
        query={query}
        onQueryChange={handleQueryChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        metaFilters={metaFilters}
        onMetaFiltersChange={setMetaFilters}
      />

      {/* Card grid */}
      {isFirstLoad ? (
        <div className="grid grid-cols-2 gap-3 pb-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardTileSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">No cards found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-4 md:grid-cols-4">
          {filtered.map((card) => (
            <CardTile key={card.id} card={card} onTap={setSelectedCard} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !isFirstLoad && (
        <div className="flex justify-center pb-6">
          {loading ? (
            <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardTileSkeleton key={i} />
              ))}
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
            >
              Load more ({(totalCount - allFetchedCards.length).toLocaleString()} remaining)
            </Button>
          )}
        </div>
      )}

      {/* Card Detail */}
      <CardDetailModal
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
      />
    </div>
  )
}
