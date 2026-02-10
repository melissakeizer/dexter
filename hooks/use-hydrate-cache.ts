"use client"

import { useEffect, useRef } from "react"
import { hydrateCardCache } from "@/lib/card-cache"

export function useHydrateCache() {
  const hydrated = useRef(false)
  useEffect(() => {
    if (hydrated.current) return
    hydrated.current = true
    hydrateCardCache()
  }, [])
}
