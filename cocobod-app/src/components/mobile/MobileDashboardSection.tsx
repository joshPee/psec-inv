'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileDashboardSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function MobileDashboardSection({
  title,
  children,
  defaultOpen = false,
  className
}: MobileDashboardSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className={cn('mb-4 lg:hidden', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-semibold text-slate-900 dark:text-white">{title}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-slate-400 transition-transform duration-200',
            isOpen ? 'rotate-180' : ''
          )}
        />
      </button>
      {isOpen && <CardContent className="pt-0 px-4 pb-4">{children}</CardContent>}
    </Card>
  )
}
