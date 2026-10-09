'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import { DashboardSidebar } from '@/components/DashboardSidebar'
import { DashboardTopBar } from '@/components/DashboardTopBar'
import { MobileBottomNav } from '@/components/MobileBottomNav'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const router = useRouter()
  const isSupervisor = session?.user?.role === 'SECURITY_SUPERVISOR'

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+B - Navigate to Bookings
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault()
        router.push('/bookings')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 pt-16 lg:pt-6 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
      {/* Mobile Bottom Nav - Visible only on mobile */}
      <MobileBottomNav />
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SessionProvider>
  )
}
