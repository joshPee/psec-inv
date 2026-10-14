import { Skeleton } from '@/components/ui/skeleton'
import { PageHeaderSkeleton } from '@/components/ui/skeletons'

export default function EquipmentDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-36" />
      </div>

      <PageHeaderSkeleton />

      {/* Tabs Skeleton */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
        <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  )
}
