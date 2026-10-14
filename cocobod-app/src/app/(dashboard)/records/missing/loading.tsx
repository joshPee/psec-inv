import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/skeletons'

export default function MissingRecordsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <PageHeaderSkeleton />
      <TableSkeleton rows={8} cols={7} />
    </div>
  )
}
