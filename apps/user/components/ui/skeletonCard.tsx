import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[150px] w-[300px] rounded-xl bg-zinc-300" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[300px] bg-zinc-300" />
        <Skeleton className="h-4 w-[240px] bg-zinc-300" />
      </div>
    </div>
  )
}
