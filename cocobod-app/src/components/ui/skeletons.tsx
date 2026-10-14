import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

/** Full-page table skeleton: header row + N body rows */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      {/* header */}
      <div className="flex gap-4 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 max-w-[120px]" />
        ))}
      </div>
      {/* rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 px-4 py-3.5 border-b last:border-b-0 border-slate-100 dark:border-slate-800"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={cn('h-4 flex-1', c === 0 ? 'max-w-[80px]' : c === cols - 1 ? 'max-w-[64px]' : 'max-w-[160px]')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Card grid skeleton: N placeholder cards */
export function CardGridSkeleton({ count = 6, cols = 3 }: { count?: number; cols?: number }) {
  const colClass =
    cols === 2 ? 'grid-cols-1 sm:grid-cols-2'
    : cols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

  return (
    <div className={cn('grid gap-4', colClass)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-4 flex-1 max-w-[120px]" />
          </div>
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  )
}

/** Hero/page-header shaped skeleton */
export function PageHeaderSkeleton() {
  return (
    <div className="relative rounded-2xl border border-slate-800/80 bg-slate-950 p-6 md:p-8 space-y-4 overflow-hidden">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-24 rounded-full bg-slate-800" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-xl bg-slate-800" />
        <Skeleton className="h-8 w-64 bg-slate-800" />
      </div>
      <Skeleton className="h-4 w-96 max-w-full bg-slate-800" />
    </div>
  )
}

/** Inline single-row skeleton for list items */
export function ListItemSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800 p-3">
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}
