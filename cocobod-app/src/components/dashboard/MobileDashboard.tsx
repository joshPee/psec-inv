'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  Package,
  Shield,
  AlertTriangle,
  TrendingUp,
  Plus,
  Search,
  FileText,
  ChevronRight,
  Activity
} from 'lucide-react'

interface MobileDashboardProps {
  stats: {
    totalItems: number
    availableItems: number
    issuedItems: number
    overdueCount: number
    pendingBookings: number
    lowStockCount: number
  }
}

export function MobileDashboard({ stats }: MobileDashboardProps) {
  const quickActions = [
    {
      icon: Plus,
      label: 'Add Equipment',
      href: '/add',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      icon: TrendingUp,
      label: 'Issue Item',
      href: '/issue',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      icon: Search,
      label: 'Active Items',
      href: '/active',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      badge: stats.issuedItems,
    },
    {
      icon: Shield,
      label: 'Guards',
      href: '/guards',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    },
  ]

  const alertCards = [
    {
      icon: AlertTriangle,
      label: 'Overdue Items',
      value: stats.overdueCount,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30',
      borderColor: 'border-rose-200 dark:border-rose-800',
      href: '/active?filter=overdue',
    },
    {
      icon: AlertTriangle,
      label: 'Pending Bookings',
      value: stats.pendingBookings,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200 dark:border-amber-800',
      href: '/bookings',
    },
    {
      icon: Package,
      label: 'Low Stock',
      value: stats.lowStockCount,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      borderColor: 'border-orange-200 dark:border-orange-800',
      href: '/inventory',
    },
  ]

  return (
    <div className="lg:hidden space-y-4 pb-20">
      {/* Quick Stats Overview */}
      <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Total</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalItems}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Available</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.availableItems}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Cards */}
      {(stats.overdueCount > 0 || stats.pendingBookings > 0 || stats.lowStockCount > 0) && (
        <div className="space-y-2">
          {alertCards
            .filter(card => card.value > 0)
            .map((card, index) => (
              <Link key={index} href={card.href}>
                <Card
                  className={cn(
                    'border-2 hover:shadow-md transition-all duration-200',
                    card.borderColor,
                    card.bgColor
                  )}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg', card.bgColor)}>
                          <card.icon className={cn('h-5 w-5', card.color)} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {card.label}
                          </p>
                          <p className={cn('text-lg font-bold', card.color)}>{card.value}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      )}

      {/* Quick Actions Grid */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Button
                  variant="outline"
                  className={cn(
                    'h-auto py-4 flex flex-col items-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800',
                    'transition-all duration-200 active:scale-95'
                  )}
                >
                  <div className={cn('p-2 rounded-xl', action.bgColor)}>
                    <action.icon className={cn('h-5 w-5', action.color)} />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {action.label}
                  </span>
                  {action.badge !== undefined && action.badge > 0 && (
                    <span className="absolute top-2 right-2 h-5 w-5 flex items-center justify-center bg-rose-500 text-white text-xs rounded-full">
                      {action.badge}
                    </span>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Quick Links
          </h3>
          <div className="space-y-1">
            <Link href="/reports">
              <Button
                variant="ghost"
                className="w-full justify-between h-10 px-3 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <FileText className="h-4 w-4" />
                  Reports & Analytics
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Button>
            </Link>
            <Link href="/records/movement">
              <Button
                variant="ghost"
                className="w-full justify-between h-10 px-3 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Activity className="h-4 w-4" />
                  Movement Log
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Button>
            </Link>
            <Link href="/categories">
              <Button
                variant="ghost"
                className="w-full justify-between h-10 px-3 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Package className="h-4 w-4" />
                  Categories
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
