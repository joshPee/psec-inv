import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/skeletons'

export default function MovementLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <PageHeaderSkeleton />
      <TableSkeleton rows={10} cols={9} />
    </div>
  )
}
