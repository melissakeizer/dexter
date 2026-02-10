"use client"

import { useState } from "react"
import { BottomNav, type TabId } from "./bottom-nav"
import { DiscoverTab } from "./discover/discover-tab"
import { CollectionTab } from "./collection/collection-tab"
import { BinderTab } from "./binder/binder-tab"
import { useHydrateCache } from "@/hooks/use-hydrate-cache"

export function AppShell() {
  useHydrateCache()
  const [activeTab, setActiveTab] = useState<TabId>("discover")

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 pb-16">
        {activeTab === "discover" && <DiscoverTab />}
        {activeTab === "collection" && <CollectionTab />}
        {activeTab === "binder" && <BinderTab />}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
