import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/skeletons'
import { Skeleton } from '@/components/ui/skeleton'

export default function InventoryLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <PageHeaderSkeleton />
      
      {/* Search and Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1 max-w-sm rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={8} cols={7} />
    </div>
  )
}
