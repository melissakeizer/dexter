"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { BinderLibraryScreen } from "./binder-library-screen"
import { BinderDetailScreen } from "./binder-detail-screen"

export function BinderTab() {
  const binders = useAppStore((s) => s.binders)
  const [activeBinderId, setActiveBinderId] = useState<string | null>(null)

  const activeBinder = activeBinderId
    ? binders.find((b) => b.id === activeBinderId) ?? null
    : null

  if (activeBinder) {
    return (
      <BinderDetailScreen
        binder={activeBinder}
        onBack={() => setActiveBinderId(null)}
      />
    )
  }

  return (
    <BinderLibraryScreen
      onSelectBinder={(binder) => setActiveBinderId(binder.id)}
    />
  )
}
