"use client"

import { useMemo } from "react"
import { CarouselRow } from "./carousel-row"
import { CarouselRowSkeleton } from "@/components/shared/carousel-row-skeleton"
import { useFeaturedCards } from "@/hooks/use-tcg-data"
import { useAppStore } from "@/lib/store"
import type { CachedSet, PokemonCard } from "@/lib/types"

interface SetCarouselRowProps {
  set: CachedSet
  onCardTap: (card: PokemonCard) => void
  onViewAll: () => void
}

export function SetCarouselRow({ set, onCardTap, onViewAll }: SetCarouselRowProps) {
  const { cards, loading } = useFeaturedCards(set.id, 10)
  const cardStates = useAppStore((s) => s.cardStates)

  // Overlay user's owned/wishlist status
  const cardsWithStatus = useMemo(() => {
    return cards.map((c) => ({
      ...c,
      status: cardStates[c.id]?.status ?? c.status,
    }))
  }, [cards, cardStates])

  if (loading && cardsWithStatus.length === 0) {
    return <CarouselRowSkeleton />
  }

  if (cardsWithStatus.length === 0) return null

  return (
    <CarouselRow
      title={set.name}
      cards={cardsWithStatus}
      onCardTap={onCardTap}
      onViewAll={onViewAll}
    />
  )
}
