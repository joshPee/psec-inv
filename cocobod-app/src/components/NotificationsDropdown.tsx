'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, AlertTriangle, ArrowRight, RefreshCw, Info, Radio, ClipboardList, Shield, X, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export function NotificationsDropdown() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0)

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    setIsOpen(false)

    if (notification.type === 'DAMAGED') {
      router.push('/records/damaged')
    } else if (notification.type === 'MISSING') {
      router.push('/records/missing')
    } else if (notification.type === 'LOW_STOCK') {
      router.push('/inventory')
    } else if (notification.type === 'ISSUE' || notification.type === 'RETURN') {
      router.push('/records/movement')
    } else if (notification.type === 'DIRECTIVE' || notification.type === 'HANDOVER') {
      router.push('/dashboard')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LOW_STOCK':
        return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
      case 'DAMAGED':
        return <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
      case 'MISSING':
        return <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
      case 'ISSUE':
        return <ArrowRight className="h-4 w-4 text-emerald-500 shrink-0" />
      case 'RETURN':
        return <RefreshCw className="h-4 w-4 text-blue-500 shrink-0" />
      case 'DIRECTIVE':
        return <Radio className="h-4 w-4 text-indigo-500 shrink-0" />
      case 'HANDOVER':
        return <ClipboardList className="h-4 w-4 text-purple-500 shrink-0" />
      default:
        return <Info className="h-4 w-4 text-slate-500 shrink-0" />
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      const data = await response.json()
      setNotifications(data.notifications || [])
      const newUnreadCount = data.unreadCount || 0
      setUnreadCount(newUnreadCount)

      // Play sound and show alert if new unread notifications arrived
      if (newUnreadCount > previousUnreadCount && previousUnreadCount > 0) {
        playNotificationSound()
        showBrowserNotification(data.notifications[0])
      }
      setPreviousUnreadCount(newUnreadCount)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3')
      audio.play().catch(() => {
        // Fallback: browser may block autoplay
        console.log('Audio play blocked by browser')
      })
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }

  const showBrowserNotification = (notification: Notification) => {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/pcc.png'
      })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission()
    }
  }

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, markAsRead: true })
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`/api/notifications?notificationId=${notificationId}`, {
        method: 'DELETE'
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const clearAllNotifications = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to clear all notifications?')) {
      return
    }
    try {
      await fetch('/api/notifications?clearAll=true', {
        method: 'DELETE'
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error clearing notifications:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 transition-all duration-200 transform hover:scale-105"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="w-[calc(100vw-2rem)] sm:w-96 max-h-[30rem] overflow-hidden flex flex-col p-0 shadow-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-semibold">
          <span className="text-sm">Notifications</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  markAllAsRead()
                }}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        </DropdownMenuLabel>
        <div className="overflow-y-auto flex-1 p-1 divide-y divide-slate-100 dark:divide-slate-800/60">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors focus:bg-slate-50 dark:focus:bg-slate-800 group ${
                  !notification.read ? 'bg-slate-50/80 dark:bg-slate-800/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="mt-0.5 shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {notification.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 mt-1.5">
                  {!notification.read && (
                    <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                  )}
                  <button
                    onClick={(e) => deleteNotification(notification.id, e)}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    <X className="h-3.5 w-3.5 text-slate-400 hover:text-rose-500" />
                  </button>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
