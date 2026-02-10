import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Binder, BinderColor, CardFilters, CardStatus, MetaFilter } from "./types"
import { MOCK_CARDS, DEFAULT_BINDERS } from "./mock-data"

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

interface AppStore {
  // ── Card states (keyed by card id) ──
  cardStates: Record<string, { status: CardStatus }>
  setCardStatus: (cardId: string, status: CardStatus) => void
  isOwned: (cardId: string) => boolean
  isWishlist: (cardId: string) => boolean

  // ── Persisted filter state ──
  discoverQuery: string
  discoverFilters: CardFilters
  discoverMeta: MetaFilter[]
  collectionQuery: string
  collectionSegment: "wishlist" | "owned"
  setDiscoverQuery: (q: string) => void
  setDiscoverFilters: (f: CardFilters) => void
  setDiscoverMeta: (m: MetaFilter[]) => void
  setCollectionQuery: (q: string) => void
  setCollectionSegment: (s: "wishlist" | "owned") => void

  // ── Binders ──
  binders: Binder[]
  addBinder: (name: string, color: BinderColor) => void
  deleteBinder: (binderId: string) => void
  addPage: (binderId: string) => void
  setSlotCard: (binderId: string, pageId: string, slotId: string, cardId: string | null) => void
  clearSlot: (binderId: string, pageId: string, slotId: string) => void
}

// Build initial card states from mock data
const initialCardStates: Record<string, { status: CardStatus }> = {}
for (const card of MOCK_CARDS) {
  initialCardStates[card.id] = { status: card.status }
}

function updateBinderPages(
  binders: Binder[],
  binderId: string,
  pageId: string,
  slotId: string,
  cardId: string | null
): Binder[] {
  return binders.map((b) => {
    if (b.id !== binderId) return b
    return {
      ...b,
      pages: b.pages.map((p) => {
        if (p.id !== pageId) return p
        return {
          ...p,
          slots: p.slots.map((s) => (s.id === slotId ? { ...s, cardId } : s)),
        }
      }),
    }
  })
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      cardStates: initialCardStates,

      setCardStatus: (cardId, status) =>
        set((state) => ({
          cardStates: {
            ...state.cardStates,
            [cardId]: { status },
          },
        })),

      isOwned: (cardId) => get().cardStates[cardId]?.status === "owned",
      isWishlist: (cardId) => get().cardStates[cardId]?.status === "wishlist",

      // ── Persisted filter state ──
      discoverQuery: "",
      discoverFilters: { rarity: [], artist: [], set: [], type: [] },
      discoverMeta: [],
      collectionQuery: "",
      collectionSegment: "wishlist",
      setDiscoverQuery: (q) => set({ discoverQuery: q }),
      setDiscoverFilters: (f) => set({ discoverFilters: f }),
      setDiscoverMeta: (m) => set({ discoverMeta: m }),
      setCollectionQuery: (q) => set({ collectionQuery: q }),
      setCollectionSegment: (s) => set({ collectionSegment: s }),

      // ── Binders ──
      binders: DEFAULT_BINDERS,

      addBinder: (name, color) =>
        set((state) => ({
          binders: [
            ...state.binders,
            {
              id: generateId(),
              name,
              color,
              pages: [
                {
                  id: generateId(),
                  slots: Array.from({ length: 4 }, (_, i) => ({
                    id: generateId(),
                    cardId: null,
                    position: i,
                  })),
                },
              ],
            },
          ],
        })),

      deleteBinder: (binderId) =>
        set((state) => ({
          binders: state.binders.filter((b) => b.id !== binderId),
        })),

      addPage: (binderId) =>
        set((state) => ({
          binders: state.binders.map((b) => {
            if (b.id !== binderId) return b
            return {
              ...b,
              pages: [
                ...b.pages,
                {
                  id: generateId(),
                  slots: Array.from({ length: 4 }, (_, i) => ({
                    id: generateId(),
                    cardId: null,
                    position: i,
                  })),
                },
              ],
            }
          }),
        })),

      setSlotCard: (binderId, pageId, slotId, cardId) =>
        set((state) => ({
          binders: updateBinderPages(state.binders, binderId, pageId, slotId, cardId),
        })),

      clearSlot: (binderId, pageId, slotId) =>
        set((state) => ({
          binders: updateBinderPages(state.binders, binderId, pageId, slotId, null),
        })),
    }),
    {
      name: "pokemon-binder-storage",
      version: 1,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>
        if (version === 0) {
          // Migrate from { owned: boolean, liked: boolean } to { status: CardStatus }
          const oldCardStates = state.cardStates as Record<string, { owned?: boolean; liked?: boolean; status?: CardStatus }> | undefined
          if (oldCardStates) {
            const newCardStates: Record<string, { status: CardStatus }> = {}
            for (const [id, val] of Object.entries(oldCardStates)) {
              if (val.status) {
                newCardStates[id] = { status: val.status }
              } else {
                const status: CardStatus = val.owned ? "owned" : val.liked ? "wishlist" : "none"
                newCardStates[id] = { status }
              }
            }
            state.cardStates = newCardStates
          }
        }
        return state as unknown as AppStore
      },
    }
  )
)
