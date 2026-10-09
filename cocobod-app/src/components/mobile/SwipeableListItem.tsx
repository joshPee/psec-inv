'use client'

import { ReactNode, useRef, useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { cn } from '@/lib/utils'

interface SwipeableListItemProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftAction?: ReactNode
  rightAction?: ReactNode
  className?: string
}

export function SwipeableListItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className
}: SwipeableListItemProps) {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const startX = useRef(0)

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      const delta = eventData.deltaX
      // Limit swipe distance
      const maxSwipe = 100
      const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, delta))
      setSwipeOffset(clampedDelta)
    },
    onSwipedLeft: () => {
      if (onSwipeLeft) {
        onSwipeLeft()
        if (navigator.vibrate) navigator.vibrate(15)
      }
      setSwipeOffset(0)
    },
    onSwipedRight: () => {
      if (onSwipeRight) {
        onSwipeRight()
        if (navigator.vibrate) navigator.vibrate(15)
      }
      setSwipeOffset(0)
    },
    trackMouse: true,
    trackTouch: true,
  })

  return (
    <div
      {...handlers}
      className={cn('relative overflow-hidden', className)}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Left Action Background (swipe right) */}
      {leftAction && (
        <div
          className="absolute inset-y-0 left-0 flex items-center px-4 bg-emerald-500 dark:bg-emerald-600 transition-transform duration-200"
          style={{
            transform: `translateX(${Math.min(0, swipeOffset + 100)}px)`,
            width: '100%',
          }}
        >
          {leftAction}
        </div>
      )}

      {/* Right Action Background (swipe left) */}
      {rightAction && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-end px-4 bg-rose-500 dark:bg-rose-600 transition-transform duration-200"
          style={{
            transform: `translateX(${Math.max(0, swipeOffset - 100)}px)`,
            width: '100%',
          }}
        >
          {rightAction}
        </div>
      )}

      {/* Content */}
      <div
        className="relative bg-white dark:bg-slate-900 transition-transform duration-200"
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        {children}
      </div>
    </div>
  )
}
