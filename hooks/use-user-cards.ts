"use client"

import { useMemo } from "react"
import { useAppStore } from "@/lib/store"
import { getCardFromCache } from "@/lib/card-cache"
import { useCardsById } from "./use-tcg-data"
import type { PokemonCard, CardStatus } from "@/lib/types"

export function useUserCards(status: CardStatus) {
  const cardStates = useAppStore((s) => s.cardStates)

  // Get all card IDs with the matching status
  const matchingIds = useMemo(() => {
    return Object.entries(cardStates)
      .filter(([, state]) => state.status === status)
      .map(([id]) => id)
  }, [cardStates, status])

  // Try to resolve from cache first
  const { cachedCards, missingIds } = useMemo(() => {
    const cached: PokemonCard[] = []
    const missing: string[] = []
    for (const id of matchingIds) {
      const card = getCardFromCache(id)
      if (card) {
        cached.push({ ...card, status })
      } else {
        missing.push(id)
      }
    }
    return { cachedCards: cached, missingIds: missing }
  }, [matchingIds, status])

  // Fetch any missing cards from API
  const { cards: fetchedMap, loading } = useCardsById(missingIds)

  // Combine cached + fetched
  const cards = useMemo(() => {
    const all = [...cachedCards]
    for (const [, card] of fetchedMap) {
      all.push({ ...card, status })
    }
    return all
  }, [cachedCards, fetchedMap, status])

  return { cards, loading }
}
