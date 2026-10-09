'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard,
  Package,
  Shield,
  Search,
  FileText,
  PackageCheck,
  TrendingUp,
  History,
  AlertTriangle,
  UserCog,
  Plus,
  X,
  MoreHorizontal,
  Sun,
  Moon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
  const { theme, setTheme } = useTheme()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isFabOpen, setIsFabOpen] = useState(false)
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0)
  const [overdueCount, setOverdueCount] = useState(0)
  const bottomNavItems = getBottomNavItems(session?.user?.role)
  const moreItems = getMoreItems(session?.user?.role)
  const isCustodian = session?.user?.role === 'EQUIPMENT_CUSTODIAN'
  const isSupervisor = session?.user?.role === 'SECURITY_SUPERVISOR'

  // Fetch badge counts
  useEffect(() => {
    async function fetchCounts() {
      try {
        const [bookingsRes, activeRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/equipment/active')
        ])

        if (bookingsRes.ok) {
          const bookings = await bookingsRes.json()
          const pending = bookings.filter((b: any) => b.status === 'PENDING').length
          setPendingBookingsCount(pending)
        }

        if (activeRes.ok) {
          const active = await activeRes.json()
          const overdue = active.filter((a: any) => a.isOverdue).length
          setOverdueCount(overdue)
        }
      } catch (error) {
        console.error('Error fetching badge counts:', error)
      }
    }

    fetchCounts()
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleNavClick = () => {
    if (navigator.vibrate) navigator.vibrate(10)
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 lg:hidden">
        <div className="flex items-center justify-around h-16 px-2 safe-area-bottom">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            const badgeCount = item.href === '/bookings' ? pendingBookingsCount
                            : item.href === '/active' ? overdueCount
                            : 0

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full min-w-0 px-1 relative',
                  'transition-colors duration-200'
                )}
              >
                <div className="relative">
                  <item.icon
                    className={cn(
                      'h-5 w-5 mb-1 transition-colors',
                      isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                    )}
                  />
                  {badgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  )}
                </div>
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
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10)
              setIsMoreOpen(true)
            }}
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

      {/* Floating Action Button for Quick Actions */}
      <div className="fixed bottom-20 right-4 z-40 lg:hidden">
        <div className="relative">
          {isFabOpen && (
            <div className="absolute bottom-16 right-0 flex flex-col gap-2 items-end">
              {isCustodian && (
                <>
                  <Link
                    href="/issue?openDialog=true"
                    onClick={() => setIsFabOpen(false)}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg shadow-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span>Issue Item</span>
                    <TrendingUp className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/return?openDialog=true"
                    onClick={() => setIsFabOpen(false)}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg shadow-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span>Return Item</span>
                    <History className="h-4 w-4" />
                  </Link>
                </>
              )}
              {isSupervisor && (
                <Link
                  href="/add"
                  onClick={() => setIsFabOpen(false)}
                  className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg shadow-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <span>Add Equipment</span>
                  <Plus className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className={cn(
              'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300',
              isFabOpen ? 'bg-slate-500 hover:bg-slate-600' : 'bg-emerald-600 hover:bg-emerald-700'
            )}
          >
            {isFabOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Plus className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* More Modal - Bottom Sheet */}
      <Dialog open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <DialogContent
          className="fixed left-0 right-0 bottom-0 top-auto translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none max-h-[75vh] overflow-y-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 m-0 w-full max-w-none [&>[data-radix-dialog-close]]:hidden"
        >
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-4 pt-4">
            <DialogTitle className="text-lg font-semibold">More Options</DialogTitle>
            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          <div className="space-y-1 px-4 pb-4">
            {moreItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(10)
                    setIsMoreOpen(false)
                  }}
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
            {/* Theme Toggle */}
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10)
                setTheme(theme === 'dark' ? 'light' : 'dark')
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="font-medium">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
