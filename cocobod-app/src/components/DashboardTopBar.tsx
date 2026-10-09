'use client'

import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Bell, User, LogOut, Settings, Menu, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { NotificationsDropdown } from '@/components/NotificationsDropdown'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'

export function DashboardTopBar() {
  const { data: session } = useSession()
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    const checkFormOpen = () => {
      // Detect any active modal/dialog in DOM (Radix dialog, role="dialog", or open forms)
      const openDialog = document.querySelector('[role="dialog"][data-state="open"]') ||
                         document.querySelector('[role="dialog"]') ||
                         document.querySelector('[data-radix-portal] [data-state="open"]')
      setIsFormOpen(!!openDialog)
    }

    checkFormOpen()

    const observer = new MutationObserver(checkFormOpen)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state', 'open', 'class']
    })

    return () => observer.disconnect()
  }, [])

  const getTimeBasedGreeting = () => {
    let userName = session?.user?.fullName || session?.user?.username || 'User'

    // Use shorter name if it's the full administrative title
    if (userName === 'System Administrator') {
      userName = 'Admin'
    } else {
      // Extract only the second name (last name) from full name
      const nameParts = userName.split(' ')
      if (nameParts.length > 1) {
        userName = nameParts[nameParts.length - 1]
      }
    }

    return `Hello, ${userName}`
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <>
      <header
        id="dashboard-topbar"
        data-topbar="true"
        className={cn(
          "flex h-16 items-center justify-between topbar-glass px-4 md:px-5 min-w-0 w-full sticky top-0 z-30 transition-all duration-200",
          isFormOpen && "hidden"
        )}
      >
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="lg:hidden shrink-0">
              <img src="/pcc.png" alt="PCC Logo" className="w-8 h-8 object-contain border border-slate-200 dark:border-slate-700 rounded-lg dark:brightness-0 dark:invert" />
            </div>
            <h2 className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-100">{getTimeBasedGreeting()}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          {/* Dark Mode Toggle */}
          <div className="shrink-0">
            <ThemeToggle />
          </div>

          {/* Notifications */}
          <NotificationsDropdown />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 transition-all duration-200"
                title="Profile"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-[11px] font-bold">
                  {(session?.user?.fullName || 'U').charAt(0).toUpperCase()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-slate-900 dark:text-white">
                    {session?.user?.fullName || 'User'}
                  </p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
                    {session?.user?.staffId || 'N/A'}
                  </p>
                  <p className={`text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit ${
                    session?.user?.role === 'SECURITY_SUPERVISOR'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      : session?.user?.role === 'EQUIPMENT_CUSTODIAN'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {session?.user?.role === 'SECURITY_SUPERVISOR' 
                      ? 'Supervisor' 
                      : session?.user?.role === 'EQUIPMENT_CUSTODIAN' 
                      ? 'Custodian' 
                      : 'Guard'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowSignOutDialog(true)} className="text-red-600 dark:text-red-400 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


        </div>
      </header>

      {/* Sign Out Confirmation Dialog */}
      <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Sign Out</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Are you sure you want to sign out? You will need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignOutDialog(false)} className="dark:border-slate-700 dark:hover:bg-slate-800">
              Cancel
            </Button>
            <Button onClick={handleSignOut} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
