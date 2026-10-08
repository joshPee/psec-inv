'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardLiveUpdatesProps {
  children: React.ReactNode
  pollInterval?: number // in milliseconds, default 30000 (30 seconds)
}

export default function DashboardLiveUpdates({ children, pollInterval = 30000 }: DashboardLiveUpdatesProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData()
    }, pollInterval)

    return () => clearInterval(interval)
  }, [pollInterval])

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      router.refresh()
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error refreshing dashboard:', error)
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={isRefreshing}
          className="dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      {children}
    </div>
  )
}
