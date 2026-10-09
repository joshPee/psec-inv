'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileSearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export function MobileSearchBar({
  onSearch,
  placeholder = 'Search...',
  className
}: MobileSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [query, setQuery] = useState('')

  const handleSearch = (value: string) => {
    setQuery(value)
    onSearch(value)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  const handleClose = () => {
    setIsExpanded(false)
    handleClear()
  }

  return (
    <div className={cn('lg:hidden sticky top-0 z-20 bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800', className)}>
      {isExpanded ? (
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={placeholder}
              autoFocus
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full justify-start h-12"
          onClick={() => setIsExpanded(true)}
        >
          <Search className="h-4 w-4 mr-2 text-slate-400" />
          <span className="text-slate-500">{placeholder}</span>
        </Button>
      )}
    </div>
  )
}
