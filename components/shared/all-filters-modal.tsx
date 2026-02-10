"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, X } from "lucide-react"
import type { CardFilters } from "@/lib/types"
import { MOCK_RARITIES, MOCK_ARTISTS, MOCK_SETS, MOCK_TYPES } from "@/lib/mock-data"

type FilterKey = keyof CardFilters

interface SectionDef {
  key: FilterKey
  label: string
  options: string[]
}

const SECTIONS: SectionDef[] = [
  { key: "set", label: "Set", options: MOCK_SETS },
  { key: "artist", label: "Artist", options: MOCK_ARTISTS },
  { key: "rarity", label: "Rarity", options: MOCK_RARITIES },
  { key: "type", label: "Type", options: MOCK_TYPES },
]

interface AllFiltersModalProps {
  open: boolean
  onClose: () => void
  filters: CardFilters
  onApply: (filters: CardFilters) => void
}

export function AllFiltersModal({
  open,
  onClose,
  filters,
  onApply,
}: AllFiltersModalProps) {
  const [draft, setDraft] = useState<CardFilters>(filters)

  // Sync draft when the modal opens
  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  const totalDraft = useMemo(
    () => Object.values(draft).flat().length,
    [draft]
  )

  function toggleOption(key: FilterKey, value: string) {
    setDraft((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }))
  }

  function clearAll() {
    setDraft({ rarity: [], artist: [], set: [], type: [] })
  }

  function handleApply() {
    onApply(draft)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors active:bg-muted"
            aria-label="Close filters"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Filters</h1>
        </div>
        {totalDraft > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-sm font-medium text-destructive transition-colors active:text-destructive/70"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Sections */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-4">
          {SECTIONS.map((section, idx) => (
            <div key={section.key}>
              <h2 className="pb-2 pt-3 text-sm font-semibold text-foreground">
                {section.label}
                {draft[section.key].length > 0 && (
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    ({draft[section.key].length})
                  </span>
                )}
              </h2>
              <div className="flex flex-col gap-0.5">
                {section.options.map((opt) => (
                  <label
                    key={opt}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 active:bg-muted"
                  >
                    <Checkbox
                      checked={draft[section.key].includes(opt)}
                      onCheckedChange={() => toggleOption(section.key, opt)}
                    />
                    <span className="text-sm text-foreground">{opt}</span>
                  </label>
                ))}
              </div>
              {idx < SECTIONS.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex gap-3 border-t px-4 py-3">
        <Button
          variant="outline"
          className="flex-1 bg-transparent"
          onClick={clearAll}
          disabled={totalDraft === 0}
        >
          Clear all
        </Button>
        <Button className="flex-1" onClick={handleApply}>
          Apply filters{totalDraft > 0 ? ` (${totalDraft})` : ""}
        </Button>
      </div>
    </div>
  )
}
