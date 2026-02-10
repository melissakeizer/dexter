"use client"

import React from "react"

import { useState } from "react"
import Image from "next/image"
import { Heart, Check } from "lucide-react"
import { useAppStore } from "@/lib/store"
import type { PokemonCard } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CardTileProps {
  card: PokemonCard
  onTap: (card: PokemonCard) => void
  showOwned?: boolean
  showLiked?: boolean
}

export function CardTile({ card, onTap, showOwned = true, showLiked = true }: CardTileProps) {
  const cardStates = useAppStore((s) => s.cardStates)
  const setCardStatus = useAppStore((s) => s.setCardStatus)
  const [heartBounce, setHeartBounce] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const status = cardStates[card.id]?.status ?? "none"

  function handleToggleOwned(e: React.MouseEvent) {
    e.stopPropagation()
    setCardStatus(card.id, status === "owned" ? "none" : "owned")
  }

  function handleToggleWishlist(e: React.MouseEvent) {
    e.stopPropagation()
    const newStatus = status === "wishlist" ? "none" : "wishlist"
    setCardStatus(card.id, newStatus)
    if (newStatus === "wishlist") {
      setHeartBounce(true)
      setShowToast(true)
      setTimeout(() => setHeartBounce(false), 400)
      setTimeout(() => setShowToast(false), 1200)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => onTap(card)}
        className="group relative flex w-full flex-col items-center rounded-xl bg-card p-1.5 shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]"
      >
        <div className="relative aspect-[2.5/3.5] w-full overflow-hidden rounded-lg">
          <Image
            src={card.imageUrl || "/placeholder.svg"}
            alt={card.name}
            fill
            className="object-contain transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 45vw, 22vw"
          />
        </div>
        <span className="mt-1.5 w-full truncate px-0.5 text-center text-xs font-medium text-foreground">
          {card.name}
        </span>
      </button>

      {/* Owned toggle - top right */}
      {showOwned && (
        <button
          onClick={handleToggleOwned}
          className={cn(
            "absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-all active:scale-90",
            status === "owned"
              ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]"
              : "bg-card/80 text-muted-foreground backdrop-blur-sm ring-1 ring-border hover:bg-card"
          )}
          aria-label={status === "owned" ? "Remove from owned" : "Mark as owned"}
        >
          <Check className={cn("h-3.5 w-3.5", status === "owned" && "stroke-[3]")} />
        </button>
      )}

      {/* Wishlist button - bottom center overlay */}
      {showLiked && (
        <button
          onClick={handleToggleWishlist}
          className={cn(
            "absolute bottom-9 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center rounded-full p-1.5 shadow-md transition-all active:scale-90",
            status === "wishlist"
              ? "bg-red-500 text-card"
              : "bg-card/80 text-muted-foreground backdrop-blur-sm ring-1 ring-border hover:bg-card"
          )}
          aria-label={status === "wishlist" ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-transform",
              status === "wishlist" && "fill-current",
              heartBounce && "animate-bounce-heart"
            )}
          />
        </button>
      )}

      {/* Wishlist toast */}
      {showToast && (
        <div className="absolute bottom-14 left-1/2 z-20 -translate-x-1/2 animate-fade-up rounded-full bg-foreground/90 px-3 py-1 text-xs font-medium text-background shadow-lg">
          Wishlisted!
        </div>
      )}
    </div>
  )
}
