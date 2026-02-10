"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AllFiltersModal } from "./all-filters-modal"
import type { CardFilters, MetaFilter } from "@/lib/types"
import { cn } from "@/lib/utils"

/* ── Static curated quick-filter chips ── */

interface QuickChip {
  id: string
  label: string
  /** Which filter key this chip maps to */
  filterKey: keyof CardFilters
  /** The value to toggle */
  filterValue: string
}

const QUICK_CHIPS: QuickChip[] = [
  { id: "holo", label: "Holo", filterKey: "rarity", filterValue: "Rare Holo" },
  { id: "base", label: "Base Set", filterKey: "set", filterValue: "Base" },
  { id: "fossil", label: "Fossil", filterKey: "set", filterValue: "Fossil" },
  { id: "arita", label: "Mitsuhiro Arita", filterKey: "artist", filterValue: "Mitsuhiro Arita" },
  { id: "himeno", label: "Kagemaru Himeno", filterKey: "artist", filterValue: "Kagemaru Himeno" },
]

/* ── Meta chips that work on card state, not CardFilters ── */

interface QuickFilterBarProps {
  query: string
  onQueryChange: (q: string) => void
  filters: CardFilters
  onFiltersChange: (f: CardFilters) => void
  /** Optional meta-filters for Owned / Liked */
  metaFilters?: MetaFilter[]
  onMetaFiltersChange?: (m: MetaFilter[]) => void
  placeholder?: string
}

export function QuickFilterBar({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  metaFilters = [],
  onMetaFiltersChange,
  placeholder = "Search cards, sets, artists...",
}: QuickFilterBarProps) {
  const [allFiltersOpen, setAllFiltersOpen] = useState(false)

  const totalActive =
    Object.values(filters).flat().length + metaFilters.length

  function isChipActive(chip: QuickChip) {
    return filters[chip.filterKey].includes(chip.filterValue)
  }

  function toggleChip(chip: QuickChip) {
    const arr = filters[chip.filterKey]
    const next = arr.includes(chip.filterValue)
      ? arr.filter((v) => v !== chip.filterValue)
      : [...arr, chip.filterValue]
    onFiltersChange({ ...filters, [chip.filterKey]: next })
  }

  function toggleMeta(m: MetaFilter) {
    if (!onMetaFiltersChange) return
    onMetaFiltersChange(
      metaFilters.includes(m)
        ? metaFilters.filter((v) => v !== m)
        : [...metaFilters, m]
    )
  }

  function clearAll() {
    onFiltersChange({ rarity: [], artist: [], set: [], type: [] })
    onMetaFiltersChange?.([])
  }

  return (
    <>
      {/* Search row: input + filter icon */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            className="pl-9"
          />
        </div>
        <button
          onClick={() => setAllFiltersOpen(true)}
          className={cn(
            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors active:bg-muted",
            totalActive > 0
              ? "border-primary bg-primary/5 text-primary"
              : "border-input bg-background text-muted-foreground"
          )}
          aria-label="Open all filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {totalActive > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {totalActive}
            </span>
          )}
        </button>
      </div>

      {/* Quick chips */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {/* Meta chips */}
        {onMetaFiltersChange && (
          <>
            <button onClick={() => toggleMeta("owned")} className="shrink-0">
              <Badge
                variant={metaFilters.includes("owned") ? "default" : "outline"}
                className="cursor-pointer text-xs whitespace-nowrap"
              >
                Owned
              </Badge>
            </button>
            <button onClick={() => toggleMeta("wishlist")} className="shrink-0">
              <Badge
                variant={metaFilters.includes("wishlist") ? "default" : "outline"}
                className="cursor-pointer text-xs whitespace-nowrap"
              >
                Wishlist
              </Badge>
            </button>
          </>
        )}

        {/* Curated filter chips */}
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip.id}
            onClick={() => toggleChip(chip)}
            className="shrink-0"
          >
            <Badge
              variant={isChipActive(chip) ? "default" : "outline"}
              className="cursor-pointer text-xs whitespace-nowrap"
            >
              {chip.label}
            </Badge>
          </button>
        ))}

        {/* Clear action */}
        {totalActive > 0 && (
          <button onClick={clearAll} className="shrink-0">
            <Badge
              variant="secondary"
              className="cursor-pointer gap-1 text-xs text-destructive whitespace-nowrap"
            >
              <X className="h-3 w-3" />
              Clear
            </Badge>
          </button>
        )}
      </div>

      {/* All Filters full-screen modal */}
      <AllFiltersModal
        open={allFiltersOpen}
        onClose={() => setAllFiltersOpen(false)}
        filters={filters}
        onApply={onFiltersChange}
      />
    </>
  )
}
