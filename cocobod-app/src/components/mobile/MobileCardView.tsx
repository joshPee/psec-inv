'use client'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Column {
  key: string
  label: string
  render: (item: any) => React.ReactNode
}

interface MobileCardViewProps {
  data: any[]
  columns: Column[]
  className?: string
}

export function MobileCardView({ data, columns, className }: MobileCardViewProps) {
  if (!data || data.length === 0) {
    return (
      <div className="lg:hidden text-center py-8 text-slate-500">
        No data available
      </div>
    )
  }

  return (
    <div className={cn('lg:hidden space-y-3', className)}>
      {data.map((item, index) => (
        <Card
          key={item.id || index}
          className="p-4 mobile-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {columns.map((col) => (
            <div
              key={col.key}
              className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
            >
              <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0 pr-4">
                {col.label}
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-white text-right">
                {col.render(item)}
              </span>
            </div>
          ))}
        </Card>
      ))}
    </div>
  )
}
