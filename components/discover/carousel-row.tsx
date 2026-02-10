"use client"

import { useRef } from "react"
import { ChevronRight } from "lucide-react"
import { CardTile } from "@/components/shared/card-tile"
import type { PokemonCard } from "@/lib/types"

interface CarouselRowProps {
  title: string
  cards: PokemonCard[]
  onCardTap: (card: PokemonCard) => void
  onViewAll: () => void
}

export function CarouselRow({ title, cards, onCardTap, onViewAll }: CarouselRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (cards.length === 0) return null

  return (
    <section className="flex flex-col gap-2.5">
      {/* Row header */}
      <div className="flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <button
          onClick={onViewAll}
          className="flex items-center gap-0.5 text-xs font-medium text-primary transition-colors active:text-primary/70"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Horizontal scroll */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide"
      >
        {cards.map((card) => (
          <div key={card.id} className="w-[140px] shrink-0 md:w-[160px]">
            <CardTile card={card} onTap={onCardTap} />
          </div>
        ))}
      </div>
    </section>
  )
}
