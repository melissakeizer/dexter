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
import type { Binder, BinderColor, PocketLayout } from "@/lib/types"
import { cn } from "@/lib/utils"

const BINDER_COLORS: { value: BinderColor; bg: string; ring: string }[] = [
  { value: "red", bg: "bg-red-500", ring: "ring-red-500" },
  { value: "blue", bg: "bg-blue-500", ring: "ring-blue-500" },
  { value: "green", bg: "bg-green-500", ring: "ring-green-500" },
  { value: "purple", bg: "bg-violet-500", ring: "ring-violet-500" },
  { value: "orange", bg: "bg-orange-500", ring: "ring-orange-500" },
  { value: "black", bg: "bg-neutral-800", ring: "ring-neutral-800" },
]

const LAYOUT_OPTIONS: { value: PocketLayout; label: string; desc: string }[] = [
  { value: 4, label: "2\u00d72", desc: "4-pocket" },
  { value: 9, label: "3\u00d73", desc: "9-pocket" },
  { value: 12, label: "3\u00d74", desc: "12-pocket" },
]

function getColorBg(color: BinderColor) {
  return BINDER_COLORS.find((c) => c.value === color)?.bg ?? "bg-neutral-500"
}

function BinderCover({ color, zipColor, layout }: { color: BinderColor; zipColor: BinderColor; layout: PocketLayout }) {
  return (
    <div className={cn("relative flex h-14 w-11 shrink-0 overflow-hidden rounded-lg shadow-sm sm:h-16 sm:w-12", getColorBg(color))}>
      {/* Zip accent strip */}
      <div className={cn("absolute right-0 top-0 h-full w-1.5 sm:w-2", getColorBg(zipColor))} />
      {/* Layout badge */}
      <span className="absolute bottom-1 left-1 rounded bg-black/30 px-1 text-[9px] font-bold leading-tight text-white">
        {layout}
      </span>
      {/* Book icon */}
      <div className="flex flex-1 items-center justify-center">
        <BookOpen className="h-5 w-5 text-white/80 sm:h-6 sm:w-6" />
      </div>
    </div>
  )
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
  const [newZipColor, setNewZipColor] = useState<BinderColor>("red")
  const [newLayout, setNewLayout] = useState<PocketLayout>(9)

  function handleCreate() {
    const name = newName.trim() || "Untitled Binder"
    addBinder(name, newColor, newZipColor, newLayout)
    setNewName("")
    setNewColor("blue")
    setNewZipColor("red")
    setNewLayout(9)
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
              <BinderCover color={binder.color} zipColor={binder.zipColor} layout={binder.layout} />
              <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                <span className="truncate text-sm font-semibold text-foreground sm:text-base">
                  {binder.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {binder.layout}-pocket &middot; {binder.pages.length}{" "}
                  {binder.pages.length === 1 ? "page" : "pages"} &middot;{" "}
                  {filledSlots} cards
                </span>
              </div>
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
            {/* Name */}
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

            {/* Cover color */}
            <div className="flex flex-col gap-1.5">
              <Label>Cover Color</Label>
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

            {/* Zip color */}
            <div className="flex flex-col gap-1.5">
              <Label>Zip Color</Label>
              <div className="flex items-center gap-2">
                {BINDER_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setNewZipColor(c.value)}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all",
                      c.bg,
                      newZipColor === c.value
                        ? "ring-2 ring-offset-2 ring-offset-background " + c.ring
                        : "opacity-60 hover:opacity-100"
                    )}
                  >
                    <span className="sr-only">{c.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout */}
            <div className="flex flex-col gap-1.5">
              <Label>Pocket Layout</Label>
              <div className="flex items-center gap-2">
                {LAYOUT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setNewLayout(opt.value)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-0.5 rounded-xl border-2 py-2.5 text-sm font-medium transition-all",
                      newLayout === opt.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <span className="text-base font-bold">{opt.label}</span>
                    <span className="text-[10px]">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center justify-center pt-1">
              <BinderCover color={newColor} zipColor={newZipColor} layout={newLayout} />
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
