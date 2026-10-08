import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityItemProps {
  icon: LucideIcon
  title: string
  description: string
  timestamp: string
  user?: string
  iconColor?: string
  iconBgColor?: string
}

export function ActivityItem({
  icon: Icon,
  title,
  description,
  timestamp,
  user,
  iconColor = 'text-slate-600',
  iconBgColor = 'bg-slate-100',
}: ActivityItemProps) {
  return (
    <div className="flex gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className={cn('p-2 rounded-lg h-fit', iconBgColor)}>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
          {title}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {description}
          {user && <span className="ml-1">by {user}</span>}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {timestamp}
        </p>
      </div>
    </div>
  )
}