import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <Skeleton className="h-48 w-full rounded-2xl" />

      <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>

      <Skeleton className="h-64 w-full rounded-2xl" />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48 rounded-2xl md:col-span-2" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  )
}
