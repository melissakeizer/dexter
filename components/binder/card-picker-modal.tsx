"use client"

import { useMemo } from "react"
import Image from "next/image"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAppStore } from "@/lib/store"
import { MOCK_CARDS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface CardPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (cardId: string) => void
}

export function CardPickerModal({ open, onOpenChange, onSelect }: CardPickerModalProps) {
  const cardStates = useAppStore((s) => s.cardStates)

  const ownedCards = useMemo(
    () => MOCK_CARDS.filter((c) => cardStates[c.id]?.owned ?? c.owned),
    [cardStates]
  )

  const likedCards = useMemo(
    () => MOCK_CARDS.filter((c) => cardStates[c.id]?.liked ?? c.liked),
    [cardStates]
  )

  function renderGrid(cards: typeof MOCK_CARDS) {
    if (cards.length === 0) {
      return (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No cards in this list
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80dvh]">
        <DrawerHeader>
          <DrawerTitle>Choose a Card</DrawerTitle>
        </DrawerHeader>
        <div className="px-4">
          <Tabs defaultValue="owned" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="owned" className="flex-1">
                Owned ({ownedCards.length})
              </TabsTrigger>
              <TabsTrigger value="liked" className="flex-1">
                Liked ({likedCards.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="owned" className="mt-3">
              <ScrollArea className="h-[50dvh]">
                {renderGrid(ownedCards)}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="liked" className="mt-3">
              <ScrollArea className="h-[50dvh]">
                {renderGrid(likedCards)}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
