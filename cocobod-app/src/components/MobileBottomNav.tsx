'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  Shield,
  Search,
  FileText,
  MoreHorizontal,
  PackageCheck,
  TrendingUp,
  History,
  AlertTriangle,
  UserCog,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface NavItem {
  name: string
  href: string
  icon: any
}

function getBottomNavItems(role?: string): NavItem[] {
  return [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Guards', href: '/guards', icon: Shield },
    { name: 'Active', href: '/active', icon: Search },
    { name: 'Reports', href: '/reports', icon: FileText },
  ]
}

function getMoreItems(role?: string): NavItem[] {
  const isSupervisor = role === 'SECURITY_SUPERVISOR'
  const isCustodian = role === 'EQUIPMENT_CUSTODIAN'

  const items: NavItem[] = [
    { name: 'Categories', href: '/categories', icon: PackageCheck },
  ]

  if (isCustodian) {
    items.push(
      { name: 'Issue Item', href: '/issue', icon: TrendingUp },
      { name: 'Return Item', href: '/return', icon: History }
    )
  }

  items.push(
    { name: 'Movement Log', href: '/records/movement', icon: History },
    { name: 'Damaged Records', href: '/records/damaged', icon: AlertTriangle },
    { name: 'Missing Records', href: '/records/missing', icon: AlertTriangle }
  )

  if (isSupervisor) {
    items.push({ name: 'User Management', href: '/admin/users', icon: UserCog })
  }

  return items
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const bottomNavItems = getBottomNavItems(session?.user?.role)
  const moreItems = getMoreItems(session?.user?.role)

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 lg:hidden">
        <div className="flex items-center justify-around h-16 px-2 safe-area-bottom">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full min-w-0 px-1',
                  'transition-colors duration-200'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 mb-1 transition-colors',
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium leading-tight truncate max-w-full',
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {item.name}
                </span>
              </Link>
            )
          })}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center w-full h-full min-w-0 px-1',
              'transition-colors duration-200'
            )}
          >
            <MoreHorizontal className="h-5 w-5 mb-1 text-slate-500 dark:text-slate-400" />
            <span className="text-[10px] font-medium leading-tight text-slate-500 dark:text-slate-400">
              More
            </span>
          </button>
        </div>
      </div>

      {/* More Modal */}
      <Dialog open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 rounded-t-2xl fixed bottom-0 left-0 right-0 top-auto rounded-b-none max-h-[70vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="text-lg font-semibold">More Options</DialogTitle>
            <button
              onClick={() => setIsMoreOpen(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>
          <div className="space-y-1">
            {moreItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMoreOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
