"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Plus, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/lib/store"
import { useCardsById } from "@/hooks/use-tcg-data"
import { CardPickerModal } from "./card-picker-modal"
import type { BinderPage, PocketLayout } from "@/lib/types"
import { cn } from "@/lib/utils"

const GRID_CLASSES: Record<PocketLayout, string> = {
  4: "grid-cols-2",
  9: "grid-cols-3",
  12: "grid-cols-3",
}

interface SlotGridProps {
  binderId: string
  page: BinderPage
  layout: PocketLayout
}

export function SlotGrid({ binderId, page, layout }: SlotGridProps) {
  const cardStates = useAppStore((s) => s.cardStates)
  const setSlotCard = useAppStore((s) => s.setSlotCard)
  const clearSlot = useAppStore((s) => s.clearSlot)

  const slotCardIds = useMemo(
    () => page.slots.map((s) => s.cardId).filter((id): id is string => id !== null),
    [page.slots]
  )

  const { cards: resolvedCards, loading: cardsLoading } = useCardsById(slotCardIds)

  const [pickerSlotId, setPickerSlotId] = useState<string | null>(null)

  return (
    <>
      <div className={cn("grid gap-2 rounded-2xl bg-muted/40 p-3 sm:gap-3 sm:p-4", GRID_CLASSES[layout])}>
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
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Plus className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Add</span>
                </div>
              </button>
            )
          }

          {/* Loading skeleton */}
          if (isLoadingCard) {
            return (
              <div key={slot.id} className="overflow-hidden rounded-xl">
                <Skeleton className="aspect-[2.5/3.5] w-full rounded-xl" />
              </div>
            )
          }

          {/* Card not found */}
          if (!card) {
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setPickerSlotId(slot.id)}
                className="flex aspect-[2.5/3.5] items-center justify-center rounded-xl border-2 border-dashed border-border bg-card transition-all active:scale-[0.97]"
              >
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Plus className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Add</span>
                </div>
              </button>
            )
          }

          {/* Filled slot */}
          return (
            <div key={slot.id} className="group relative overflow-hidden rounded-xl shadow-sm">
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
                  sizes={layout === 4 ? "(max-width: 768px) 42vw, 20vw" : "(max-width: 768px) 30vw, 15vw"}
                />
              </div>

              {/* Wishlist label */}
              {isWishlistOnly && (
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] font-medium text-background pointer-events-none">
                  Wishlist
                </span>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => clearSlot(binderId, page.id, slot.id)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-opacity active:bg-black/80 sm:h-5 sm:w-5 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label={`Remove ${card.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Card picker */}
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
    </>
  )
}
