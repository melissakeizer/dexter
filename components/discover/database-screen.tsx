"use client"

import { useState, useMemo } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardTile } from "@/components/shared/card-tile"
import { CardDetailModal } from "@/components/shared/card-detail-modal"
import { QuickFilterBar } from "@/components/shared/quick-filter-bar"
import type { MetaFilter } from "@/lib/types"
import { MOCK_CARDS } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"
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
  const [visibleCount, setVisibleCount] = useState(CARDS_PER_PAGE)
  const cardStates = useAppStore((s) => s.cardStates)

  const allCards = useMemo(() => {
    return MOCK_CARDS.map((c) => ({
      ...c,
      status: cardStates[c.id]?.status ?? c.status,
    }))
  }, [cardStates])

  const filtered = useMemo(() => {
    let results = allCards

    if (query) {
      const q = query.toLowerCase()
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.set.toLowerCase().includes(q) ||
          c.artist.toLowerCase().includes(q)
      )
    }
    if (filters.rarity.length) {
      results = results.filter((c) => filters.rarity.includes(c.rarity))
    }
    if (filters.artist.length) {
      results = results.filter((c) => filters.artist.includes(c.artist))
    }
    if (filters.set.length) {
      results = results.filter((c) => filters.set.includes(c.set))
    }
    if (filters.type.length) {
      results = results.filter((c) => filters.type.includes(c.type))
    }
    // Meta-filters
    if (metaFilters.includes("owned")) {
      results = results.filter((c) => c.status === "owned")
    }
    if (metaFilters.includes("wishlist")) {
      results = results.filter((c) => c.status === "wishlist")
    }

    return results
  }, [allCards, query, filters, metaFilters])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  function handleFiltersChange(f: CardFilters) {
    setFilters(f)
    setVisibleCount(CARDS_PER_PAGE)
  }

  function handleQueryChange(q: string) {
    setQuery(q)
    setVisibleCount(CARDS_PER_PAGE)
  }

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
            {filtered.length} card{filtered.length !== 1 && "s"}
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
      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">No cards found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-4 md:grid-cols-4">
          {visible.map((card) => (
            <CardTile key={card.id} card={card} onTap={setSelectedCard} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pb-6">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((v) => v + CARDS_PER_PAGE)}
          >
            Load more ({filtered.length - visibleCount} remaining)
          </Button>
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
