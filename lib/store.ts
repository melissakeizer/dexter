import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Binder, BinderColor } from "./types"
import { MOCK_CARDS, DEFAULT_BINDERS } from "./mock-data"

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

interface AppStore {
  // ── Card states (keyed by card id) ──
  cardStates: Record<string, { owned: boolean; liked: boolean }>
  toggleOwned: (cardId: string) => void
  toggleLiked: (cardId: string) => void
  isOwned: (cardId: string) => boolean
  isLiked: (cardId: string) => boolean

  // ── Binders ──
  binders: Binder[]
  addBinder: (name: string, color: BinderColor) => void
  deleteBinder: (binderId: string) => void
  addPage: (binderId: string) => void
  setSlotCard: (binderId: string, pageId: string, slotId: string, cardId: string | null) => void
  clearSlot: (binderId: string, pageId: string, slotId: string) => void
}

// Build initial card states from mock data
const initialCardStates: Record<string, { owned: boolean; liked: boolean }> = {}
for (const card of MOCK_CARDS) {
  initialCardStates[card.id] = { owned: card.owned, liked: card.liked }
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

      toggleOwned: (cardId) =>
        set((state) => {
          const existing = state.cardStates[cardId] ?? { owned: false, liked: false }
          return {
            cardStates: {
              ...state.cardStates,
              [cardId]: { ...existing, owned: !existing.owned },
            },
          }
        }),

      toggleLiked: (cardId) =>
        set((state) => {
          const existing = state.cardStates[cardId] ?? { owned: false, liked: false }
          return {
            cardStates: {
              ...state.cardStates,
              [cardId]: { ...existing, liked: !existing.liked },
            },
          }
        }),

      isOwned: (cardId) => get().cardStates[cardId]?.owned ?? false,
      isLiked: (cardId) => get().cardStates[cardId]?.liked ?? false,

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
    }
  )
)
