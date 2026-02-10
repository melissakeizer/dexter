import { Skeleton } from "@/components/ui/skeleton"
import { CardTileSkeleton } from "./card-tile-skeleton"

export function CarouselRowSkeleton() {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-4">
        <Skeleton className="h-4 w-40 rounded" />
        <Skeleton className="h-3 w-14 rounded" />
      </div>
      <div className="flex gap-3 overflow-hidden px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-[140px] shrink-0 md:w-[160px]">
            <CardTileSkeleton />
          </div>
        ))}
      </div>
    </section>
  )
}
