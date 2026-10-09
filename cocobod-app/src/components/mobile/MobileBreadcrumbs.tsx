'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronRight, ArrowLeft } from 'lucide-react'

export function MobileBreadcrumbs() {
  const pathname = usePathname()
  const router = useRouter()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <div className="lg:hidden flex items-center gap-2 mb-4 safe-area-top">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors min-h-[44px]"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-medium">Back</span>
      </button>
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 overflow-x-auto">
        {segments.map((segment, i) => (
          <React.Fragment key={segment}>
            <span className="capitalize whitespace-nowrap">{segment}</span>
            {i < segments.length - 1 && <ChevronRight className="h-4 w-4 shrink-0" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
