"use client"

import { useState, useMemo, useEffect, useCallback, startTransition } from "react"
import { ArrowLeft, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardTile } from "@/components/shared/card-tile"
import { CardTileSkeleton } from "@/components/shared/card-tile-skeleton"
import { CardDetailModal } from "@/components/shared/card-detail-modal"
import { QuickFilterBar } from "@/components/shared/quick-filter-bar"
import type { MetaFilter } from "@/lib/types"
import { useAppStore } from "@/lib/store"
import { dedupeById } from "@/lib/utils"
import { useSearchCards, useCuratedCards } from "@/hooks/use-tcg-data"
import type { PokemonCard, CardFilters } from "@/lib/types"

const CARDS_PER_PAGE = 20

const emptyFilters: CardFilters = { rarity: [], artist: [], set: [], type: [] }

interface CuratedGalleryScreenProps {
  onBack: () => void
  initialFilters?: CardFilters
  initialQuery?: string
}

export function CuratedGalleryScreen({
  onBack,
  initialFilters,
  initialQuery = "",
}: CuratedGalleryScreenProps) {
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<CardFilters>(initialFilters ?? emptyFilters)
  const [metaFilters, setMetaFilters] = useState<MetaFilter[]>([])
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null)
  const [page, setPage] = useState(1)
  const [allFetchedCards, setAllFetchedCards] = useState<PokemonCard[]>([])
  const [endReached, setEndReached] = useState(false)
  const cardStates = useAppStore((s) => s.cardStates)

  // Is search active?
  const hasSearch =
    query.trim().length > 0 ||
    Object.values(filters).flat().length > 0

  // Curated cards (default mode)
  const { cards: curatedCards, loading: curatedLoading, stale: curatedStale, error: curatedError, retry: curatedRetry } = useCuratedCards()

  // API search (search mode)
  const { result, loading: searchLoading, stale: searchStale } = useSearchCards({
    q: query.trim() || undefined,
    page,
    pageSize: CARDS_PER_PAGE,
    filters,
    enabled: hasSearch,
  })

  // Accumulate search cards across pages
  useEffect(() => {
    if (!result) return
    if (result.cards.length < CARDS_PER_PAGE) {
      setEndReached(true)
    }
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
    setEndReached(false)
  }, [])

  const handleQueryChange = useCallback((q: string) => {
    setQuery(q)
    setPage(1)
    setAllFetchedCards([])
    setEndReached(false)
  }, [])

  // Choose card source: curated vs search results
  const displayCards = useMemo(() => {
    const source = hasSearch ? allFetchedCards : curatedCards
    // Overlay user card states
    let results = source.map((c) => ({
      ...c,
      status: cardStates[c.id]?.status ?? c.status,
    }))
    // Apply meta-filters client-side
    if (metaFilters.includes("owned")) {
      results = results.filter((c) => c.status === "owned")
    }
    if (metaFilters.includes("wishlist")) {
      results = results.filter((c) => c.status === "wishlist")
    }
    return results
  }, [hasSearch, allFetchedCards, curatedCards, cardStates, metaFilters])

  const loading = hasSearch ? searchLoading : curatedLoading
  const isStale = hasSearch ? searchStale : curatedStale
  const totalCount = result?.totalCount ?? 0
  const hasMore = hasSearch && !endReached && allFetchedCards.length < totalCount
  const isFirstLoad = loading && displayCards.length === 0

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
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {hasSearch ? "Search Results" : "Curated Gallery"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {hasSearch
              ? totalCount > 0
                ? `${totalCount.toLocaleString()} card${totalCount !== 1 ? "s" : ""}`
                : searchLoading
                  ? "Searching..."
                  : `${displayCards.length} card${displayCards.length !== 1 ? "s" : ""}`
              : "Hand-picked rare & beautiful cards"}
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

      {/* Stale data indicator */}
      {isStale && !isFirstLoad && displayCards.length > 0 && (
        <div className="rounded-lg bg-muted px-3 py-2 text-center">
          <p className="text-xs text-muted-foreground">Using cached results</p>
        </div>
      )}

      {/* Card grid */}
      {isFirstLoad ? (
        <div className="grid grid-cols-3 gap-3 pb-4 md:grid-cols-6">
          {Array.from({ length: 14 }).map((_, i) => (
            <CardTileSkeleton key={i} />
          ))}
        </div>
      ) : !hasSearch && curatedError && displayCards.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <p className="text-sm text-muted-foreground">{curatedError}</p>
          <Button variant="outline" size="sm" onClick={curatedRetry}>
            <RotateCw className="mr-1.5 h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      ) : displayCards.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <p className="text-sm text-muted-foreground">
            {hasSearch ? "No cards match your search" : "No curated cards found"}
          </p>
          {!hasSearch && (
            <Button variant="outline" size="sm" onClick={curatedRetry}>
              <RotateCw className="mr-1.5 h-3.5 w-3.5" />
              Try again
            </Button>
          )}
        </div>
      ) : (
        <div className={hasSearch
          ? "grid grid-cols-2 gap-3 pb-4 md:grid-cols-4"
          : "grid grid-cols-3 gap-3 pb-4 md:grid-cols-6"
        }>
          {displayCards.map((card) => (
            <CardTile key={card.id} card={card} onTap={setSelectedCard} />
          ))}
        </div>
      )}

      {/* Load more (search mode only) */}
      {hasMore && !isFirstLoad && (
        <div className="flex justify-center pb-6">
          {searchLoading ? (
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

      {/* Footer note (curated mode only) */}
      {!hasSearch && !isFirstLoad && displayCards.length > 0 && (
        <p className="pb-6 text-center text-xs text-muted-foreground">
          Curated picks refresh every 6 hours
        </p>
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
