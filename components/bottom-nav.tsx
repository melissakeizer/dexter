"use client"

import { Search, Heart, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export type TabId = "discover" | "collection" | "binder"

const tabs: { id: TabId; label: string; icon: typeof Search }[] = [
  { id: "discover", label: "Discover", icon: Search },
  { id: "collection", label: "Collection", icon: Heart },
  { id: "binder", label: "Binder", icon: BookOpen },
]

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-sm"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-2 pt-3 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute top-0 h-0.5 w-10 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
