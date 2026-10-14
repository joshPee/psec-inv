'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, Ban, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ConfirmVariant = 'destructive' | 'warning' | 'info'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Dialog heading */
  title: string
  /** Explanatory body text */
  description?: string
  /** Label for the confirm button. Defaults to "Confirm" */
  confirmLabel?: string
  /** Label for the cancel button. Defaults to "Cancel" */
  cancelLabel?: string
  /** Visual style for the confirm button */
  variant?: ConfirmVariant
  /** Whether the async action is loading */
  loading?: boolean
  /** Custom icon to show in the header */
  icon?: LucideIcon
  onConfirm: () => void | Promise<void>
}

const variantMap: Record<
  ConfirmVariant,
  { btn: string; iconBg: string; iconColor: string; DefaultIcon: LucideIcon }
> = {
  destructive: {
    btn: 'bg-rose-600 hover:bg-rose-700 text-white',
    iconBg: 'bg-rose-100 dark:bg-rose-950/50',
    iconColor: 'text-rose-600 dark:text-rose-400',
    DefaultIcon: Trash2,
  },
  warning: {
    btn: 'bg-amber-600 hover:bg-amber-700 text-white',
    iconBg: 'bg-amber-100 dark:bg-amber-950/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    DefaultIcon: AlertTriangle,
  },
  info: {
    btn: 'bg-blue-600 hover:bg-blue-700 text-white',
    iconBg: 'bg-blue-100 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    DefaultIcon: Ban,
  },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  loading = false,
  icon,
  onConfirm,
}: ConfirmDialogProps) {
  const v = variantMap[variant]
  const Icon = icon ?? v.DefaultIcon

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-1">
            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', v.iconBg)}>
              <Icon className={cn('h-5 w-5', v.iconColor)} />
            </div>
            <div>
              <DialogTitle className="text-slate-900 dark:text-white text-base font-semibold leading-tight">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2 mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 border-slate-200 dark:border-slate-700"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={cn('flex-1', v.btn)}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing…
              </span>
            ) : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
