"use client"

import { useState, useMemo, useEffect, startTransition } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardTile } from "@/components/shared/card-tile"
import { CardTileSkeleton } from "@/components/shared/card-tile-skeleton"
import { CardDetailModal } from "@/components/shared/card-detail-modal"
import { useAppStore } from "@/lib/store"
import { useSearchCards } from "@/hooks/use-tcg-data"
import type { PokemonCard } from "@/lib/types"

const CARDS_PER_PAGE = 60

interface SetScreenProps {
  setId: string
  setName: string
  onBack: () => void
}

export function SetScreen({ setId, setName, onBack }: SetScreenProps) {
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null)
  const [page, setPage] = useState(1)
  const [allFetchedCards, setAllFetchedCards] = useState<PokemonCard[]>([])
  const cardStates = useAppStore((s) => s.cardStates)

  const { result, loading } = useSearchCards({
    rawQuery: `set.id:"${setId}"`,
    orderBy: "number",
    page,
    pageSize: CARDS_PER_PAGE,
  })

  // Accumulate cards across pages
  useEffect(() => {
    if (!result) return
    startTransition(() => {
      if (page === 1) {
        setAllFetchedCards(result.cards)
      } else {
        setAllFetchedCards((prev) => [...prev, ...result.cards])
      }
    })
  }, [result, page])

  // Overlay user card states
  const cards = useMemo(() => {
    return allFetchedCards.map((c) => ({
      ...c,
      status: cardStates[c.id]?.status ?? c.status,
    }))
  }, [allFetchedCards, cardStates])

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
          <h1 className="text-xl font-bold tracking-tight text-foreground">{setName}</h1>
          <p className="text-xs text-muted-foreground">
            {totalCount > 0
              ? `${totalCount.toLocaleString()} card${totalCount !== 1 ? "s" : ""}`
              : loading
                ? "Loading..."
                : `${cards.length} card${cards.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Card grid */}
      {isFirstLoad ? (
        <div className="grid grid-cols-3 gap-3 pb-4 md:grid-cols-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <CardTileSkeleton key={i} />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">No cards found</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 pb-4 md:grid-cols-6">
          {cards.map((card) => (
            <CardTile key={card.id} card={card} onTap={setSelectedCard} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !isFirstLoad && (
        <div className="flex justify-center pb-6">
          {loading ? (
            <div className="grid w-full grid-cols-3 gap-3 md:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
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
