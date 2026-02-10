"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CardTile } from "@/components/shared/card-tile"
import { CardDetailModal } from "@/components/shared/card-detail-modal"
import { useAppStore } from "@/lib/store"
import { MOCK_CARDS } from "@/lib/mock-data"
import type { PokemonCard } from "@/lib/types"
import { cn } from "@/lib/utils"

export function CollectionTab() {
  const cardStates = useAppStore((s) => s.cardStates)
  const segment = useAppStore((s) => s.collectionSegment)
  const setSegment = useAppStore((s) => s.setCollectionSegment)
  const query = useAppStore((s) => s.collectionQuery)
  const setQuery = useAppStore((s) => s.setCollectionQuery)
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null)

  const cards = useMemo(() => {
    let results = MOCK_CARDS.map((c) => ({
      ...c,
      status: cardStates[c.id]?.status ?? c.status,
    }))

    // Filter by segment
    results = results.filter((c) =>
      segment === "wishlist" ? c.status === "wishlist" : c.status === "owned"
    )

    // Filter by search
    if (query) {
      const q = query.toLowerCase()
      results = results.filter((c) => c.name.toLowerCase().includes(q))
    }

    return results
  }, [cardStates, segment, query])

  const wishlistCount = MOCK_CARDS.filter((c) => (cardStates[c.id]?.status ?? c.status) === "wishlist").length
  const ownedCount = MOCK_CARDS.filter((c) => (cardStates[c.id]?.status ?? c.status) === "owned").length

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Collection</h1>
        <p className="text-sm text-muted-foreground">
          {wishlistCount} wishlist, {ownedCount} owned
        </p>
      </div>

      {/* Segmented control */}
      <div className="flex rounded-lg bg-muted p-1">
        <button
          onClick={() => setSegment("wishlist")}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            segment === "wishlist"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Wishlist ({wishlistCount})
        </button>
        <button
          onClick={() => setSegment("owned")}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            segment === "owned"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Owned ({ownedCount})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search collection..."
          className="pl-9"
        />
      </div>

      {/* Results */}
      {cards.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16">
          <p className="text-sm text-muted-foreground">
            No {segment} cards{query ? " matching search" : " yet"}
          </p>
          <p className="text-xs text-muted-foreground">
            Head to Discover to {segment === "wishlist" ? "wishlist" : "mark"} some cards
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-4 md:grid-cols-4">
          {cards.map((card) => (
            <CardTile
              key={card.id}
              card={card}
              onTap={setSelectedCard}
              showOwned={segment === "owned"}
              showLiked={segment === "wishlist"}
            />
          ))}
        </div>
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
