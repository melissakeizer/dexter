"use client"

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
import { Check, Heart } from "lucide-react"
import type { PokemonCard } from "@/lib/types"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface CardDetailModalProps {
  card: PokemonCard | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CardDetailModal({ card, open, onOpenChange }: CardDetailModalProps) {
  const cardStates = useAppStore((s) => s.cardStates)
  const setCardStatus = useAppStore((s) => s.setCardStatus)

  if (!card) return null

  const status = cardStates[card.id]?.status ?? "none"

  const metadataRows = [
    { label: "Set", value: card.set },
    { label: "Rarity", value: card.rarity },
    { label: "Type", value: card.type },
    { label: "Artist", value: card.artist },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85dvh] rounded-t-2xl p-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-4 p-6 pt-2">
            <SheetHeader className="sr-only">
              <SheetTitle>{card.name}</SheetTitle>
              <SheetDescription>Card details for {card.name}</SheetDescription>
            </SheetHeader>

            {/* Card Image */}
            <div className="flex justify-center py-2">
              <div className="relative aspect-[2.5/3.5] w-56 overflow-hidden rounded-xl shadow-lg">
                <Image
                  src={card.imageUrl || "/placeholder.svg"}
                  alt={card.name}
                  fill
                  className="object-contain"
                  sizes="224px"
                  priority
                />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-center text-xl font-bold text-foreground text-balance">{card.name}</h2>

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

            {/* Metadata */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">Details</h3>
              <div className="rounded-lg bg-muted p-3">
                {metadataRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1.5 text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
