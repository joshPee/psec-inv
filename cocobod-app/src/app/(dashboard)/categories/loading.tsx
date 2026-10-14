import { PageHeaderSkeleton, CardGridSkeleton } from '@/components/ui/skeletons'

export default function CategoriesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={6} cols={3} />
    </div>
  )
}
