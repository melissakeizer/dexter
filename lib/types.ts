// ── Pokemon Card (simplified) ──

export type CardStatus = "owned" | "wishlist" | "none"

export interface PokemonCard {
  id: string
  name: string
  set: string
  rarity: string
  type: string
  artist: string
  imageUrl: string
  status: CardStatus
}

// ── Binder Types ──

export interface Slot {
  id: string
  cardId: string | null
  position: number
}

export interface BinderPage {
  id: string
  slots: Slot[]
}

export type BinderColor =
  | "red"
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "black"

export interface Binder {
  id: string
  name: string
  color: BinderColor
  pages: BinderPage[]
}

// ── Filter Types ──

export interface CardFilters {
  rarity: string[]
  artist: string[]
  set: string[]
  type: string[]
}

export type MetaFilter = "owned" | "wishlist"
