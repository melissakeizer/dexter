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

// ── TCG API Types ──

export interface TcgApiCard {
  id: string
  name: string
  supertype?: string
  subtypes?: string[]
  types?: string[]
  set: {
    id: string
    name: string
    series: string
    printedTotal: number
    total: number
    releaseDate: string
    images: { symbol: string; logo: string }
  }
  rarity?: string
  artist?: string
  images: { small: string; large: string }
}

export interface TcgApiSet {
  id: string
  name: string
  series: string
  printedTotal: number
  total: number
  releaseDate: string
  images: { symbol: string; logo: string }
}

export interface CachedSet {
  id: string
  name: string
  series: string
  total: number
  releaseDate: string
  symbolUrl: string
  logoUrl: string
}

export interface CachedMeta {
  types: string[]
  rarities: string[]
  subtypes: string[]
}

export interface TcgCardsResponse {
  cards: PokemonCard[]
  totalCount: number
  page: number
  pageSize: number
}
