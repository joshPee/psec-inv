'use client'

import { useState, useRef, ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: ReactNode
  className?: string
  threshold?: number
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull-to-refresh at the top of the page
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY !== 0 || isRefreshing) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current

    if (diff > 0) {
      e.preventDefault()
      // Add resistance
      const resistance = 0.3
      const distance = Math.min(diff * resistance, threshold * 1.5)
      setPullDistance(distance)
      setIsPulling(distance >= threshold)
    }
  }

  const handleTouchEnd = async () => {
    if (isPulling && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(threshold)

      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      }

      // Reset after delay
      setTimeout(() => {
        setIsRefreshing(false)
        setPullDistance(0)
        setIsPulling(false)
      }, 500)
    } else {
      setPullDistance(0)
      setIsPulling(false)
    }
  }

  const pullProgress = Math.min(pullDistance / threshold, 1)

  return (
    <div
      ref={containerRef}
      className={cn('lg:hidden relative', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center items-center transition-transform duration-200 pointer-events-none"
        style={{
          transform: `translateY(${Math.max(0, pullDistance - 20)}px)`,
          opacity: pullProgress,
        }}
      >
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 shadow-md',
            isRefreshing && 'animate-pulse'
          )}
        >
          <RefreshCw
            className={cn(
              'h-5 w-5 text-emerald-600 dark:text-emerald-400',
              isRefreshing && 'animate-spin'
            )}
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {isRefreshing ? 'Refreshing...' : isPulling ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{ transform: `translateY(${isRefreshing ? threshold : 0}px)` }}
      >
        {children}
      </div>
    </div>
  )
}
