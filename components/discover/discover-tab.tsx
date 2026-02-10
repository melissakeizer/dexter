"use client"

import { useState, useMemo, useCallback } from "react"
import { ChevronRight } from "lucide-react"
import { CarouselRow } from "./carousel-row"
import { DatabaseScreen } from "./database-screen"
import { CardTile } from "@/components/shared/card-tile"
import { CardDetailModal } from "@/components/shared/card-detail-modal"
import { QuickFilterBar } from "@/components/shared/quick-filter-bar"
import type { MetaFilter } from "@/components/shared/quick-filter-bar"
import { MOCK_CARDS } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"
import type { PokemonCard, CardFilters } from "@/lib/types"

// ── Row definitions (deterministic, driven by set/artist/rarity) ──

interface RowDef {
  id: string
  title: string
  filterKey: keyof CardFilters
  filterValue: string
}

const ROW_DEFS: RowDef[] = [
  { id: "set-base", title: "Set Spotlight: Base Set", filterKey: "set", filterValue: "Base" },
  { id: "artist-arita", title: "Artist Spotlight: Mitsuhiro Arita", filterKey: "artist", filterValue: "Mitsuhiro Arita" },
  { id: "set-jungle", title: "Set Spotlight: Jungle", filterKey: "set", filterValue: "Jungle" },
  { id: "artist-himeno", title: "Artist Spotlight: Kagemaru Himeno", filterKey: "artist", filterValue: "Kagemaru Himeno" },
  { id: "set-fossil", title: "Set Spotlight: Fossil", filterKey: "set", filterValue: "Fossil" },
  { id: "set-rocket", title: "Set Spotlight: Team Rocket", filterKey: "set", filterValue: "Team Rocket" },
]

const emptyFilters: CardFilters = { rarity: [], artist: [], set: [], type: [] }

type Screen =
  | { type: "feed" }
  | { type: "database"; filters?: CardFilters; query?: string }

export function DiscoverTab() {
  const [screen, setScreen] = useState<Screen>({ type: "feed" })
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null)

  // Feed-level filter state (for quick chips + all-filters on the feed)
  const [feedQuery, setFeedQuery] = useState("")
  const [feedFilters, setFeedFilters] = useState<CardFilters>(emptyFilters)
  const [feedMeta, setFeedMeta] = useState<MetaFilter[]>([])

  const cardStates = useAppStore((s) => s.cardStates)

  // Merge live store state into cards
  const allCards = useMemo(() => {
    return MOCK_CARDS.map((c) => ({
      ...c,
      owned: cardStates[c.id]?.owned ?? c.owned,
      liked: cardStates[c.id]?.liked ?? c.liked,
    }))
  }, [cardStates])

  // Is any feed filter active?
  const hasFeedFilters =
    feedQuery.trim().length > 0 ||
    Object.values(feedFilters).flat().length > 0 ||
    feedMeta.length > 0

  // Filtered results when feed filters are active
  const feedFilteredCards = useMemo(() => {
    if (!hasFeedFilters) return null
    let results = allCards

    if (feedQuery.trim()) {
      const q = feedQuery.toLowerCase()
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.set.toLowerCase().includes(q) ||
          c.artist.toLowerCase().includes(q)
      )
    }
    if (feedFilters.rarity.length)
      results = results.filter((c) => feedFilters.rarity.includes(c.rarity))
    if (feedFilters.artist.length)
      results = results.filter((c) => feedFilters.artist.includes(c.artist))
    if (feedFilters.set.length)
      results = results.filter((c) => feedFilters.set.includes(c.set))
    if (feedFilters.type.length)
      results = results.filter((c) => feedFilters.type.includes(c.type))
    if (feedMeta.includes("owned"))
      results = results.filter((c) => c.owned)
    if (feedMeta.includes("liked"))
      results = results.filter((c) => c.liked)

    return results
  }, [allCards, feedQuery, feedFilters, feedMeta, hasFeedFilters])

  // Chase cards = holo rarity cards that are liked
  const chaseCards = useMemo(() => {
    return allCards
      .filter((c) => c.rarity === "Rare Holo")
      .sort((a, b) => {
        const aScore = (a.liked ? 2 : 0) + (a.owned ? 1 : 0)
        const bScore = (b.liked ? 2 : 0) + (b.owned ? 1 : 0)
        return bScore - aScore
      })
      .slice(0, 10)
  }, [allCards])

  // Build row card lists (max 12 per row)
  const rowCards = useMemo(() => {
    const map: Record<string, PokemonCard[]> = {}
    for (const row of ROW_DEFS) {
      map[row.id] = allCards
        .filter((c) => c[row.filterKey as keyof PokemonCard] === row.filterValue)
        .slice(0, 12)
    }
    return map
  }, [allCards])

  const handleViewAll = useCallback((row: RowDef) => {
    const filters: CardFilters = { ...emptyFilters, [row.filterKey]: [row.filterValue] }
    setScreen({ type: "database", filters })
  }, [])

  // ── Database screen ──
  if (screen.type === "database") {
    return (
      <DatabaseScreen
        onBack={() => setScreen({ type: "feed" })}
        initialFilters={screen.filters}
        initialQuery={screen.query}
      />
    )
  }

  // ── Curated feed ──
  return (
    <div className="flex flex-col gap-5 pb-6 pt-4">
      {/* Header */}
      <div className="px-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Discover</h1>
        <p className="text-sm text-muted-foreground">Find your next favorite card</p>
      </div>

      {/* Search + quick chips + all-filters button */}
      <div className="flex flex-col gap-3 px-4">
        <QuickFilterBar
          query={feedQuery}
          onQueryChange={setFeedQuery}
          filters={feedFilters}
          onFiltersChange={setFeedFilters}
          metaFilters={feedMeta}
          onMetaFiltersChange={setFeedMeta}
        />
      </div>

      {/* If filters are active, show a flat grid instead of carousels */}
      {hasFeedFilters && feedFilteredCards ? (
        <div className="flex flex-col gap-3 px-4">
          <p className="text-xs text-muted-foreground">
            {feedFilteredCards.length} result{feedFilteredCards.length !== 1 && "s"}
          </p>
          {feedFilteredCards.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No cards match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {feedFilteredCards.slice(0, 20).map((card) => (
                <div key={card.id}>
                  <CardTile card={card} onTap={setSelectedCard} />
                </div>
              ))}
              {feedFilteredCards.length > 20 && (
                <div className="col-span-2 flex justify-center py-4 md:col-span-4">
                  <button
                    onClick={() =>
                      setScreen({
                        type: "database",
                        filters: feedFilters,
                        query: feedQuery.trim() || undefined,
                      })
                    }
                    className="text-sm font-medium text-primary transition-colors active:text-primary/70"
                  >
                    View all {feedFilteredCards.length} results in Browse
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Browse all CTA */}
          <div className="px-4">
            <button
              onClick={() => setScreen({ type: "database" })}
              className="flex w-full items-center justify-between rounded-xl bg-primary px-4 py-3.5 text-primary-foreground shadow-sm transition-all active:scale-[0.99]"
            >
              <div className="text-left">
                <span className="text-sm font-semibold">Browse all cards</span>
                <p className="text-xs text-primary-foreground/70">
                  {allCards.length} cards across {new Set(allCards.map((c) => c.set)).size} sets
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-primary-foreground/70" />
            </button>
          </div>

          {/* Chase Cards row */}
          <CarouselRow
            title="Chase Cards"
            cards={chaseCards}
            onCardTap={setSelectedCard}
            onViewAll={() =>
              setScreen({ type: "database", filters: { ...emptyFilters, rarity: ["Rare Holo"] } })
            }
          />

          {/* Dynamic rows */}
          {ROW_DEFS.map((row) => (
            <CarouselRow
              key={row.id}
              title={row.title}
              cards={rowCards[row.id] ?? []}
              onCardTap={setSelectedCard}
              onViewAll={() => handleViewAll(row)}
            />
          ))}
        </>
      )}

      {/* Card Detail Modal */}
      <CardDetailModal
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
      />
    </div>
  )
}
