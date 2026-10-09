'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface Action {
  label: string
  icon: any
  onClick: () => void
  variant?: 'default' | 'destructive'
}

interface MobileActionSheetProps {
  trigger: React.ReactNode
  actions: Action[]
  title?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MobileActionSheet({
  trigger,
  actions,
  title = 'Actions',
  open,
  onOpenChange
}: MobileActionSheetProps) {
  const handleActionClick = (action: Action) => {
    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
    action.onClick()
    onOpenChange?.(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild className="lg:hidden">
        {trigger}
      </DialogTrigger>
      <DialogContent
        className="fixed left-0 right-0 bottom-0 top-auto translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none max-h-[75vh] overflow-y-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 m-0 w-full max-w-none mobile-slide-up"
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-4 pt-4">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 px-4 pb-4">
          {actions.map((action, index) => (
            <button
              key={action.label}
              onClick={() => handleActionClick(action)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left',
                action.variant === 'destructive'
                  ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <action.icon className="h-5 w-5 shrink-0" />
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
