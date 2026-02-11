"use client"

import { useState, useEffect, useMemo, useRef, startTransition } from "react"
import Image from "next/image"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CardTile } from "./card-tile"
import { CardTileSkeleton } from "./card-tile-skeleton"
import { ArrowLeft, Check, Heart, ChevronRight } from "lucide-react"
import type { PokemonCard } from "@/lib/types"
import { useAppStore } from "@/lib/store"
import { cn, dedupeById } from "@/lib/utils"
import { useSearchCards } from "@/hooks/use-tcg-data"

// ── Types ──

interface ChipFilter {
  label: string
  query: string
}

interface CardDetailModalProps {
  card: PokemonCard | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ── Modal Shell ──

export function CardDetailModal({ card, open, onOpenChange }: CardDetailModalProps) {
  const [displayedCard, setDisplayedCard] = useState<PokemonCard | null>(card)
  const [subScreen, setSubScreen] = useState<ChipFilter | null>(null)
  const scrollTopRef = useRef<HTMLDivElement>(null)

  // Sync from prop when parent selects a new card
  useEffect(() => {
    if (card) {
      setDisplayedCard(card)
      setSubScreen(null)
    }
  }, [card])

  // Scroll to top when displayed card or sub-screen changes
  useEffect(() => {
    requestAnimationFrame(() => {
      scrollTopRef.current?.scrollIntoView({ block: "start" })
    })
  }, [displayedCard, subScreen])

  if (!displayedCard) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[100dvh] p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>{displayedCard.name}</SheetTitle>
          <SheetDescription>Card details for {displayedCard.name}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full">
          <div ref={scrollTopRef} />
          {subScreen ? (
            <ChipResultsView
              filter={subScreen}
              onBack={() => setSubScreen(null)}
              onCardTap={(c) => {
                setDisplayedCard(c)
                setSubScreen(null)
              }}
            />
          ) : (
            <CardDetailView
              card={displayedCard}
              onChipTap={setSubScreen}
              onRelatedCardTap={setDisplayedCard}
            />
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

// ── Detail View ──

interface CardDetailViewProps {
  card: PokemonCard
  onChipTap: (filter: ChipFilter) => void
  onRelatedCardTap: (card: PokemonCard) => void
}

function CardDetailView({ card, onChipTap, onRelatedCardTap }: CardDetailViewProps) {
  const cardStates = useAppStore((s) => s.cardStates)
  const setCardStatus = useAppStore((s) => s.setCardStatus)
  const status = cardStates[card.id]?.status ?? "none"

  const chips = [
    {
      label: "Set",
      value: card.set,
      filter: {
        label: card.set,
        query: card.setId ? `set.id:"${card.setId}"` : `set.name:"${card.set}"`,
      },
    },
    {
      label: "Rarity",
      value: card.rarity,
      filter: { label: card.rarity, query: `rarity:"${card.rarity}"` },
    },
    {
      label: "Type",
      value: card.type,
      filter: { label: card.type, query: `types:"${card.type}"` },
    },
    {
      label: "Artist",
      value: card.artist,
      filter: { label: card.artist, query: `artist:"${card.artist}"` },
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-6 pt-4">
      {/* Card Image */}
      <div className="flex justify-center py-2">
        <div className="relative aspect-[2.5/3.5] w-72 overflow-hidden rounded-xl shadow-lg">
          <Image
            src={card.imageUrl || "/placeholder.svg"}
            alt={card.name}
            fill
            className="object-contain"
            sizes="288px"
            priority
          />
        </div>
      </div>

      {/* Title + Number */}
      <h2 className="text-center text-xl font-bold text-foreground text-balance">{card.name}</h2>
      {card.number && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>{card.number} / {card.printedTotal ?? card.setTotal ?? "?"}</span>
          {card.printedTotal && Number(card.number) > card.printedTotal && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600">
              Secret
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant={status === "owned" ? "default" : "outline"}
          className={cn(
            "flex-1",
            status === "owned" && "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] hover:bg-[hsl(var(--success))]/90"
          )}
          onClick={() => setCardStatus(card.id, status === "owned" ? "none" : "owned")}
        >
          <Check className="mr-1.5 h-4 w-4" />
          {status === "owned" ? "Owned" : "Mark Owned"}
        </Button>
        <Button
          variant={status === "wishlist" ? "default" : "outline"}
          className={cn(
            "flex-1",
            status === "wishlist" && "bg-red-500 text-card hover:bg-red-500/90"
          )}
          onClick={() => setCardStatus(card.id, status === "wishlist" ? "none" : "wishlist")}
        >
          <Heart className={cn("mr-1.5 h-4 w-4", status === "wishlist" && "fill-current")} />
          {status === "wishlist" ? "Wishlist" : "Add to Wishlist"}
        </Button>
      </div>

      <Separator />

      {/* Metadata Chips */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground">Details</h3>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => onChipTap(chip.filter)}
              className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm transition-colors active:bg-muted/70"
            >
              <span className="text-muted-foreground">{chip.label}:</span>
              <span className="font-medium text-foreground">{chip.value}</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Related Cards */}
      <RelatedCards card={card} onCardTap={onRelatedCardTap} />
    </div>
  )
}

// ── Related Cards Section ──

function RelatedCards({ card, onCardTap }: { card: PokemonCard; onCardTap: (c: PokemonCard) => void }) {
  const { result, loading } = useSearchCards({
    rawQuery: `name:"${card.name}"`,
    pageSize: 13,
  })

  const relatedCards = useMemo(() => {
    if (!result) return []
    return result.cards.filter((c) => c.id !== card.id).slice(0, 12)
  }, [result, card.id])

  if (!loading && relatedCards.length === 0) return null

  return (
    <div className="flex flex-col gap-3 pb-6">
      <h3 className="text-sm font-semibold text-foreground">More {card.name} cards</h3>
      {loading ? (
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardTileSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {relatedCards.map((c) => (
            <CardTile key={c.id} card={c} onTap={onCardTap} showOwned={false} showLiked={false} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Chip Results View ──

function ChipResultsView({
  filter,
  onBack,
  onCardTap,
}: {
  filter: ChipFilter
  onBack: () => void
  onCardTap: (card: PokemonCard) => void
}) {
  const [page, setPage] = useState(1)
  const [allFetchedCards, setAllFetchedCards] = useState<PokemonCard[]>([])
  const [endReached, setEndReached] = useState(false)
  const cardStates = useAppStore((s) => s.cardStates)

  const { result, loading } = useSearchCards({
    rawQuery: filter.query,
    page,
    pageSize: 20,
  })

  useEffect(() => {
    if (!result) return
    if (result.cards.length < 20) {
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

  const cards = useMemo(() => {
    return allFetchedCards.map((c) => ({
      ...c,
      status: cardStates[c.id]?.status ?? c.status,
    }))
  }, [allFetchedCards, cardStates])

  const totalCount = result?.totalCount ?? 0
  const hasMore = !endReached && allFetchedCards.length < totalCount
  const isFirstLoad = loading && allFetchedCards.length === 0

  return (
    <div className="flex flex-col gap-4 p-6 pt-4">
      {/* Header with back */}
      <div className="flex items-center gap-3 pr-8">
        <button
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-colors active:bg-secondary/70"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-foreground">{filter.label}</h2>
          <p className="text-xs text-muted-foreground">
            {totalCount > 0
              ? `${totalCount.toLocaleString()} card${totalCount !== 1 ? "s" : ""}`
              : loading
                ? "Searching\u2026"
                : `${cards.length} card${cards.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Grid */}
      {isFirstLoad ? (
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
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
          {cards.map((c) => (
            <CardTile key={c.id} card={c} onTap={onCardTap} showOwned={false} showLiked={false} />
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
    </div>
  )
}
