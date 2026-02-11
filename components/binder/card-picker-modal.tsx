"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useUserCards } from "@/hooks/use-user-cards"
import { CardTileSkeleton } from "@/components/shared/card-tile-skeleton"
import type { PokemonCard } from "@/lib/types"

interface CardPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (cardId: string) => void
}

export function CardPickerModal({ open, onOpenChange, onSelect }: CardPickerModalProps) {
  const { cards: ownedCards, loading: ownedLoading } = useUserCards("owned")
  const { cards: wishlistCards, loading: wishlistLoading } = useUserCards("wishlist")
  const [query, setQuery] = useState("")

  const filteredOwned = useMemo(() => {
    if (!query.trim()) return ownedCards
    const q = query.toLowerCase()
    return ownedCards.filter((c) => c.name.toLowerCase().includes(q))
  }, [ownedCards, query])

  const filteredWishlist = useMemo(() => {
    if (!query.trim()) return wishlistCards
    const q = query.toLowerCase()
    return wishlistCards.filter((c) => c.name.toLowerCase().includes(q))
  }, [wishlistCards, query])

  function renderGrid(cards: PokemonCard[], loading: boolean) {
    if (loading && cards.length === 0) {
      return (
        <div className="grid grid-cols-3 gap-2 pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardTileSkeleton key={i} />
          ))}
        </div>
      )
    }
    if (cards.length === 0) {
      return (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {query.trim() ? "No cards match your search" : "No cards in this list"}
        </p>
      )
    }
    return (
      <div className="grid grid-cols-3 gap-2 pb-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelect(card.id)}
            className="group flex flex-col items-center rounded-lg bg-card p-1 ring-1 ring-border transition-all hover:ring-primary active:scale-[0.97]"
          >
            <div className="relative aspect-[2.5/3.5] w-full overflow-hidden rounded-md">
              <Image
                src={card.imageUrl || "/placeholder.svg"}
                alt={card.name}
                fill
                className="object-contain"
                sizes="25vw"
              />
            </div>
            <span className="mt-1 w-full truncate text-center text-[10px] font-medium text-foreground">
              {card.name}
            </span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <Drawer open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setQuery("") }}>
      <DrawerContent className="max-h-[80dvh]">
        <DrawerHeader>
          <DrawerTitle>Choose a Card</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cards..."
              className="pl-9"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="owned" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="owned" className="flex-1">
                Owned ({filteredOwned.length})
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex-1">
                Wishlist ({filteredWishlist.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="owned" className="mt-3">
              <ScrollArea className="h-[50dvh]">
                {renderGrid(filteredOwned, ownedLoading)}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="wishlist" className="mt-3">
              <ScrollArea className="h-[50dvh]">
                {renderGrid(filteredWishlist, wishlistLoading)}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
