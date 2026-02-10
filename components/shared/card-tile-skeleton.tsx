import { Skeleton } from "@/components/ui/skeleton"

export function CardTileSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="aspect-[2.5/3.5] w-full rounded-xl" />
      <Skeleton className="mx-auto h-3 w-3/4 rounded" />
    </div>
  )
}
