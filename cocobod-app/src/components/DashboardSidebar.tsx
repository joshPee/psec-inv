'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  Users as UsersIcon,
  History,
  AlertTriangle,
  Search,
  FileText,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  TrendingUp,
  User,
  LogOut,
  ShieldCheck,
  PackageCheck,
  PlusCircle,
  Menu,
  X,
  Calendar,
  UserCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

function getNavigationSections(role?: string) {
  const isSupervisor = role === 'SECURITY_SUPERVISOR'
  const isCustodian = role === 'EQUIPMENT_CUSTODIAN'

  const overviewItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ]

  // Core sections for tracking inventory
  const commonSections = [
    {
      label: 'OVERVIEW',
      items: overviewItems,
    },
    {
      label: 'INVENTORY',
      items: [
        { name: 'All Items', href: '/inventory', icon: Package },
        { name: 'Categories', href: '/categories', icon: PackageCheck },
      ],
    },
    {
      label: 'PERSONNEL',
      items: [
        { name: 'Guards Portal', href: '/guards', icon: Shield },
      ],
    }
  ]

  // Custodian-only transaction section
  if (isCustodian) {
    commonSections.push({
      label: 'TRANSACTIONS',
      items: [
        { name: 'Issue Item', href: '/issue', icon: TrendingUp },
        { name: 'Return Item', href: '/return', icon: History },
      ],
    })
  }

  // Supervisor and Custodian can view active issues and records
  commonSections.push({
    label: 'TRACKING',
    items: [
      { name: 'Active Issues', href: '/active', icon: Search },
      { name: 'Movement Log', href: '/records/movement', icon: History },
      { name: 'Damaged Records', href: '/records/damaged', icon: AlertTriangle },
      { name: 'Missing Records', href: '/records/missing', icon: AlertTriangle },
    ],
  })

  // Reports section for all users
  commonSections.push({
    label: 'REPORTS',
    items: [
      { name: 'Reports & Exports', href: '/reports', icon: FileText },
    ],
  })

  // Supervisor-only management section
  if (isSupervisor) {
    commonSections.push({
      label: 'MANAGEMENT',
      items: [
        { name: 'User Management', href: '/admin/users', icon: UserCog },
      ],
    })
  }

  return commonSections
}

export function DashboardSidebar({ onMobileOpenChange, isMobileOpen: externalIsMobileOpen }: { onMobileOpenChange?: (isOpen: boolean) => void; isMobileOpen?: boolean }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [internalIsMobileOpen, setInternalIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false)

  const isMobileOpen = externalIsMobileOpen !== undefined ? externalIsMobileOpen : internalIsMobileOpen
  const sections = getNavigationSections(session?.user?.role)

  useEffect(() => {
    const checkMobile = () => {
      const isNowMobile = window.innerWidth < 1024
      setIsMobile(isNowMobile)
      if (isNowMobile && externalIsMobileOpen === undefined) {
        setInternalIsMobileOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [externalIsMobileOpen])

  useEffect(() => {
    onMobileOpenChange?.(isMobileOpen)
  }, [isMobileOpen, onMobileOpenChange])

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => {
            if (externalIsMobileOpen !== undefined) {
              onMobileOpenChange?.(false)
            } else {
              setInternalIsMobileOpen(false)
            }
          }}
        />
      )}

      <div className={cn(
        'flex flex-col sidebar-gradient border-r border-slate-200/60 dark:border-slate-800/60 transition-all duration-300 h-screen',
        isMobile ? 'fixed z-40 w-72' : 'relative',
        !isMobile && (isCollapsed ? 'w-20' : 'w-72'),
        isMobile ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
      )} suppressHydrationWarning>
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">
            <img src="/pcc.png" alt="PCC Logo" className="w-10 h-10 object-contain border border-slate-200 dark:border-slate-700 rounded-lg dark:brightness-0 dark:invert" />
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap">PSEC INV</h1>
              <p className="text-[11px] text-slate-500/80 dark:text-slate-400/80 whitespace-nowrap font-medium">Equipment Management</p>
            </div>
          )}
        </div>
        {isMobile ? (
          <button
            onClick={() => externalIsMobileOpen !== undefined ? onMobileOpenChange?.(false) : setInternalIsMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 transform hover:scale-110"
            suppressHydrationWarning
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 transform hover:scale-110",
              isCollapsed && "mx-auto"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 sidebar-scroll">
        {sections.map((section) => (
          <div key={section.label} className="mb-5">
            {!isCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.08em]">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      if (isMobile) {
                        if (externalIsMobileOpen !== undefined) {
                          onMobileOpenChange?.(false)
                        } else {
                          setInternalIsMobileOpen(false)
                        }
                      }
                    }}
                    className={cn(
                      'flex items-center px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 nav-active-indicator font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white hover:translate-x-0.5',
                      isCollapsed && 'justify-center'
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon className={cn(
                      'h-[18px] w-[18px] transition-colors',
                      !isCollapsed && 'mr-3',
                      isActive ? 'text-emerald-600 dark:text-emerald-400' : ''
                    )} />
                    {!isCollapsed && item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
    </>
  )
}
