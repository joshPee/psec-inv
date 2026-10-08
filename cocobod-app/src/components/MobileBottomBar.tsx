'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ArrowRight, 
  RotateCcw, 
  Plus, 
  FileText, 
  Package, 
  ShieldCheck, 
  Settings,
  AlertTriangle,
  LayoutDashboard
} from 'lucide-react'

export function MobileBottomBar({ 
  isSidebarOpen, 
  isSupervisor 
}: { 
  isSidebarOpen: boolean
  isSupervisor: boolean 
}) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      // Vanish immediately when scrolling occurs
      setIsVisible(false)

      // Clear pending timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Reappear smoothly when scrolling stops (after 200ms of inactivity)
      scrollTimeoutRef.current = setTimeout(() => {
        setIsVisible(true)
      }, 200)
    }

    // Capture phase ensures we capture scroll events from <main> or any scrollable child container
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true })
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const supervisorNavItems = [
    { label: 'Dash', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Add', href: '/add', icon: Plus },
    { label: 'Items', href: '/inventory', icon: Package },
    { label: 'Damaged', href: '/records/damaged', icon: AlertTriangle },
    { label: 'Reports', href: '/reports', icon: FileText },
  ]

  const custodianNavItems = [
    { label: 'Dash', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Issue', href: '/issue', icon: ArrowRight },
    { label: 'Return', href: '/return', icon: RotateCcw },
    { label: 'Active', href: '/active', icon: ShieldCheck },
    { label: 'Reports', href: '/reports', icon: FileText },
  ]

  const navItems = isSupervisor ? supervisorNavItems : custodianNavItems

  return (
    <div
      className={`lg:hidden fixed bottom-4 inset-x-3 max-w-sm sm:max-w-md mx-auto z-40 transition-all duration-300 ease-out transform ${
        !isVisible || isSidebarOpen
          ? 'translate-y-24 opacity-0 pointer-events-none scale-95'
          : 'translate-y-0 opacity-100 pointer-events-auto scale-100'
      }`}
    >
      <nav
        aria-label="Mobile Quick Access"
        className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-full shadow-2xl shadow-slate-900/20 dark:shadow-black/60 px-2 py-1.5 flex items-center justify-around ring-1 ring-black/5 dark:ring-white/10"
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/60 rounded-full -z-10 transition-all" />
              )}
              <Icon className={`h-4 w-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5 tracking-tight leading-none">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
