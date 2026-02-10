"use client"

import { ChevronLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { SlotGrid } from "./slot-grid"
import type { Binder } from "@/lib/types"

interface BinderDetailScreenProps {
  binder: Binder
  onBack: () => void
}

export function BinderDetailScreen({ binder, onBack }: BinderDetailScreenProps) {
  const addPage = useAppStore((s) => s.addPage)

  const filledSlots = binder.pages.reduce(
    (acc, p) => acc + p.slots.filter((s) => s.cardId).length,
    0
  )
  const totalSlots = binder.pages.length * 4

  return (
    <div className="flex flex-col gap-4 px-4 pb-24 pt-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-9 w-9 shrink-0 text-muted-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Back to binders</span>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
            {binder.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            4-pocket &middot; {binder.pages.length}{" "}
            {binder.pages.length === 1 ? "page" : "pages"} &middot;{" "}
            {filledSlots}/{totalSlots} slots filled
          </p>
        </div>
      </div>

      {/* Scrollable page list */}
      <div className="flex flex-col gap-6">
        {binder.pages.map((page, idx) => (
          <section key={page.id}>
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
              Page {idx + 1}
            </h2>
            <SlotGrid binderId={binder.id} page={page} />
            {idx < binder.pages.length - 1 && (
              <div className="mt-6 border-t border-border" />
            )}
          </section>
        ))}
      </div>

      {/* Add page row */}
      <button
        onClick={() => addPage(binder.id)}
        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card py-6 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground active:scale-[0.99]"
      >
        <Plus className="h-4 w-4" />
        Add page
      </button>
    </div>
  )
}
