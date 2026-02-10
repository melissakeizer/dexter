"use client"

import React from "react"

import { useState } from "react"
import Image from "next/image"
import { Plus, X, Replace, Trash2 } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { MOCK_CARDS } from "@/lib/mock-data"
import { CardPickerModal } from "./card-picker-modal"
import type { BinderPage } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

interface SlotGridProps {
  binderId: string
  page: BinderPage
}

export function SlotGrid({ binderId, page }: SlotGridProps) {
  const cardStates = useAppStore((s) => s.cardStates)
  const setSlotCard = useAppStore((s) => s.setSlotCard)
  const clearSlot = useAppStore((s) => s.clearSlot)

  // Picker for empty slots (tap to add)
  const [pickerSlotId, setPickerSlotId] = useState<string | null>(null)

  // Action drawer for filled slots (tap card to get Replace / Remove)
  const [actionSlotId, setActionSlotId] = useState<string | null>(null)
  // Replace picker opened from the action drawer
  const [replaceSlotId, setReplaceSlotId] = useState<string | null>(null)

  const actionSlot = actionSlotId
    ? page.slots.find((s) => s.id === actionSlotId)
    : null
  const actionCard = actionSlot?.cardId
    ? MOCK_CARDS.find((c) => c.id === actionSlot.cardId)
    : null

  function handleQuickRemove(e: React.MouseEvent | React.PointerEvent, slotId: string) {
    e.stopPropagation()
    clearSlot(binderId, page.id, slotId)
  }

  function handleActionRemove() {
    if (actionSlotId) {
      clearSlot(binderId, page.id, actionSlotId)
      setActionSlotId(null)
    }
  }

  function handleActionReplace() {
    setReplaceSlotId(actionSlotId)
    setActionSlotId(null)
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 rounded-2xl bg-muted/40 p-3 sm:gap-3 sm:p-4">
        {page.slots.map((slot) => {
          const card = slot.cardId
            ? MOCK_CARDS.find((c) => c.id === slot.cardId)
            : null
          const state = slot.cardId ? cardStates[slot.cardId] : null
          const isOwned = state?.owned ?? false
          const isLikedOnly = !isOwned && (state?.liked ?? false)

          {/* Empty slot */}
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
            <div key={slot.id} className="relative">
              {/* Card image -- tap opens action drawer */}
              <button
                type="button"
                onClick={() => setActionSlotId(slot.id)}
                className={cn(
                  "relative aspect-[2.5/3.5] w-full overflow-hidden rounded-xl shadow-md transition-all active:scale-[0.97]",
                  isLikedOnly && "opacity-30",
                )}
              >
                <Image
                  src={card.imageUrl || "/placeholder.svg"}
                  alt={card.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 42vw, 20vw"
                />
              </button>

              {/* Wishlist label */}
              {isLikedOnly && (
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] font-medium text-background pointer-events-none">
                  Wishlist
                </span>
              )}

              {/* Always-visible X button in top-right corner */}
              <button
                type="button"
                onClick={(e) => handleQuickRemove(e, slot.id)}
                className="absolute -right-1.5 -top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition-transform active:scale-90"
                aria-label={`Remove ${card.name} from slot`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
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

      {/* Action drawer for filled slot: Replace / Remove */}
      <Drawer open={!!actionSlotId} onOpenChange={(open) => !open && setActionSlotId(null)}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle>{actionCard?.name ?? "Slot actions"}</DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col gap-2 px-4 pb-6">
            <button
              type="button"
              onClick={handleActionReplace}
              className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3.5 text-left text-sm font-medium text-foreground transition-colors active:bg-muted"
            >
              <Replace className="h-5 w-5 text-muted-foreground" />
              Replace with another card
            </button>
            <button
              type="button"
              onClick={handleActionRemove}
              className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3.5 text-left text-sm font-medium text-destructive transition-colors active:bg-muted"
            >
              <Trash2 className="h-5 w-5" />
              Remove from slot
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
