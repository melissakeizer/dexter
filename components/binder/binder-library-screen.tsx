"use client"

import { useState } from "react"
import { BookOpen, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAppStore } from "@/lib/store"
import type { Binder, BinderColor } from "@/lib/types"
import { cn } from "@/lib/utils"

const BINDER_COLORS: { value: BinderColor; bg: string; ring: string }[] = [
  { value: "red", bg: "bg-red-500", ring: "ring-red-500" },
  { value: "blue", bg: "bg-blue-500", ring: "ring-blue-500" },
  { value: "green", bg: "bg-green-500", ring: "ring-green-500" },
  { value: "purple", bg: "bg-violet-500", ring: "ring-violet-500" },
  { value: "orange", bg: "bg-orange-500", ring: "ring-orange-500" },
  { value: "black", bg: "bg-neutral-800", ring: "ring-neutral-800" },
]

function getBinderColorClasses(color: BinderColor) {
  return BINDER_COLORS.find((c) => c.value === color) ?? BINDER_COLORS[0]
}

interface BinderLibraryScreenProps {
  onSelectBinder: (binder: Binder) => void
}

export function BinderLibraryScreen({ onSelectBinder }: BinderLibraryScreenProps) {
  const binders = useAppStore((s) => s.binders)
  const addBinder = useAppStore((s) => s.addBinder)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState<BinderColor>("blue")

  function handleCreate() {
    const name = newName.trim() || "Untitled Binder"
    addBinder(name, newColor)
    setNewName("")
    setNewColor("blue")
    setShowCreate(false)
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-24 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Binders
          </h1>
          <p className="text-sm text-muted-foreground">
            {binders.length} {binders.length === 1 ? "binder" : "binders"}
          </p>
        </div>
      </div>

      {/* Binder list */}
      <div className="flex flex-col gap-2">
        {binders.map((binder) => {
          const colorClasses = getBinderColorClasses(binder.color)
          const filledSlots = binder.pages.reduce(
            (acc, p) => acc + p.slots.filter((s) => s.cardId).length,
            0
          )
          return (
            <button
              key={binder.id}
              onClick={() => onSelectBinder(binder)}
              className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border transition-all hover:ring-primary/30 hover:shadow-md active:scale-[0.99] sm:p-4"
            >
              {/* Binder cover icon */}
              <div
                className={cn(
                  "flex h-14 w-11 shrink-0 items-center justify-center rounded-lg shadow-sm sm:h-16 sm:w-12",
                  colorClasses.bg
                )}
              >
                <BookOpen className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                <span className="truncate text-sm font-semibold text-foreground sm:text-base">
                  {binder.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  4-pocket &middot; {binder.pages.length}{" "}
                  {binder.pages.length === 1 ? "page" : "pages"} &middot;{" "}
                  {filledSlots} cards
                </span>
              </div>
              {/* Chevron */}
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </button>
          )
        })}
      </div>

      {/* Add new binder card */}
      <button
        onClick={() => setShowCreate(true)}
        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card py-8 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground active:scale-[0.99]"
      >
        <Plus className="h-5 w-5" />
        Add new binder
      </button>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New Binder</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="binder-name">Name</Label>
              <Input
                id="binder-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Fire Collection"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                {BINDER_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setNewColor(c.value)}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all",
                      c.bg,
                      newColor === c.value
                        ? "ring-2 ring-offset-2 ring-offset-background " + c.ring
                        : "opacity-60 hover:opacity-100"
                    )}
                  >
                    <span className="sr-only">{c.value}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
