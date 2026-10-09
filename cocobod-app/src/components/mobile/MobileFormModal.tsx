'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ReactNode, useEffect, useRef } from 'react'

interface MobileFormModalProps {
  trigger: ReactNode
  title: string
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

export function MobileFormModal({
  trigger,
  title,
  children,
  open,
  onOpenChange,
  className
}: MobileFormModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Auto-focus first input on mobile when dialog opens
  useEffect(() => {
    if (open && dialogRef.current) {
      const firstInput = dialogRef.current.querySelector('input, select, textarea') as HTMLElement | null
      // Small delay to ensure dialog is rendered
      setTimeout(() => firstInput?.focus(), 100)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        ref={dialogRef}
        className={cn(
          'lg:max-w-md max-w-full h-full lg:h-auto lg:rounded-lg rounded-none p-0',
          'flex flex-col mobile-slide-up',
          className
        )}
      >
        {/* Mobile sticky header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 lg:hidden z-10">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </div>

        {/* Desktop header */}
        <DialogHeader className="hidden lg:block p-6 pb-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
