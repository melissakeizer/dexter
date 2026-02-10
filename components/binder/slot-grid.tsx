"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Plus, ArrowLeftRight, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/lib/store"
import { useCardsById } from "@/hooks/use-tcg-data"
import { CardPickerModal } from "./card-picker-modal"
import type { BinderPage } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SlotGridProps {
  binderId: string
  page: BinderPage
}

export function SlotGrid({ binderId, page }: SlotGridProps) {
  const cardStates = useAppStore((s) => s.cardStates)
  const setSlotCard = useAppStore((s) => s.setSlotCard)
  const clearSlot = useAppStore((s) => s.clearSlot)

  // Collect all card IDs that need resolving
  const slotCardIds = useMemo(
    () => page.slots.map((s) => s.cardId).filter((id): id is string => id !== null),
    [page.slots]
  )

  const { cards: resolvedCards, loading: cardsLoading } = useCardsById(slotCardIds)

  // Picker for empty slots (tap to add)
  const [pickerSlotId, setPickerSlotId] = useState<string | null>(null)
  // Replace picker for filled slots
  const [replaceSlotId, setReplaceSlotId] = useState<string | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 rounded-2xl bg-muted/40 p-3 sm:gap-3 sm:p-4">
        {page.slots.map((slot) => {
          const card = slot.cardId ? resolvedCards.get(slot.cardId) : null
          const state = slot.cardId ? cardStates[slot.cardId] : null
          const status = state?.status ?? "none"
          const isWishlistOnly = status === "wishlist"
          const isLoadingCard = slot.cardId && !card && cardsLoading

          {/* Empty slot */}
          if (!slot.cardId) {
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setPickerSlotId(slot.id)}
                className="flex aspect-[2.5/3.5] items-center justify-center rounded-xl border-2 border-dashed border-border bg-card transition-all active:scale-[0.97]"
              >
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                  <Plus className="h-6 w-6" />
                  <span className="text-xs font-medium">Add card</span>
                </div>
              </button>
            )
          }

          {/* Loading skeleton while card resolves */}
          if (isLoadingCard) {
            return (
              <div key={slot.id} className="overflow-hidden rounded-xl">
                <Skeleton className="aspect-[2.5/3.5] w-full rounded-xl" />
              </div>
            )
          }

          {/* Card not found (shouldn't happen often) */}
          if (!card) {
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setPickerSlotId(slot.id)}
                className="flex aspect-[2.5/3.5] items-center justify-center rounded-xl border-2 border-dashed border-border bg-card transition-all active:scale-[0.97]"
              >
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                  <Plus className="h-6 w-6" />
                  <span className="text-xs font-medium">Add card</span>
                </div>
              </button>
            )
          }

          {/* Filled slot */}
          return (
            <div key={slot.id} className="overflow-hidden rounded-xl shadow-md">
              {/* Card image */}
              <div className="relative">
                <div
                  className={cn(
                    "relative aspect-[2.5/3.5] w-full",
                    isWishlistOnly && "opacity-30",
                  )}
                >
                  <Image
                    src={card.imageUrl || "/placeholder.svg"}
                    alt={card.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 42vw, 20vw"
                  />
                </div>

                {/* Wishlist label */}
                {isWishlistOnly && (
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] font-medium text-background pointer-events-none">
                    Wishlist
                  </span>
                )}
              </div>

              {/* Action bar */}
              <div className="flex h-11 items-stretch bg-muted/60">
                <button
                  type="button"
                  onClick={() => setReplaceSlotId(slot.id)}
                  className="flex flex-1 items-center justify-center text-muted-foreground transition-colors active:bg-muted"
                  aria-label={`Replace ${card.name}`}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </button>
                <div className="w-px self-stretch bg-border" />
                <button
                  type="button"
                  onClick={() => clearSlot(binderId, page.id, slot.id)}
                  className="flex flex-1 items-center justify-center text-destructive transition-colors active:bg-muted"
                  aria-label={`Remove ${card.name} from slot`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Picker for empty slots */}
      <CardPickerModal
        open={!!pickerSlotId}
        onOpenChange={(open) => !open && setPickerSlotId(null)}
        onSelect={(cardId) => {
          if (pickerSlotId) {
            setSlotCard(binderId, page.id, pickerSlotId, cardId)
            setPickerSlotId(null)
          }
        }}
      />

      {/* Picker for replacing a filled slot */}
      <CardPickerModal
        open={!!replaceSlotId}
        onOpenChange={(open) => !open && setReplaceSlotId(null)}
        onSelect={(cardId) => {
          if (replaceSlotId) {
            setSlotCard(binderId, page.id, replaceSlotId, cardId)
            setReplaceSlotId(null)
          }
        }}
      />
    </>
  )
}
