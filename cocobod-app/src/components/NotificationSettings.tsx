'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Bell, BellOff, CheckCircle, XCircle } from 'lucide-react'
import {
  requestNotificationPermission,
  registerServiceWorker,
  subscribeToPushNotifications,
  getPushSubscription,
} from '@/lib/push-notifications'

export function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator)
    setPermission(Notification.permission)
    registerServiceWorker()
    checkSubscription()
  }, [])

  async function checkSubscription() {
    const subscription = await getPushSubscription()
    setIsSubscribed(!!subscription)
  }

  async function handleSubscribe() {
    setIsLoading(true)
    try {
      const success = await subscribeToPushNotifications()
      if (success) {
        setPermission('granted')
        await checkSubscription()
      }
    } catch (error) {
      console.error('Failed to subscribe:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRequestPermission() {
    setIsLoading(true)
    try {
      const newPermission = await requestNotificationPermission()
      setPermission(newPermission)
      if (newPermission === 'granted') {
        await handleSubscribe()
      }
    } catch (error) {
      console.error('Failed to request permission:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">Push Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <BellOff className="h-5 w-5" />
            <p className="text-sm">Push notifications are not supported in this browser.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="push-notifications">Enable Push Notifications</Label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receive alerts for overdue equipment, bookings, and low stock
            </p>
          </div>
          <div className="flex items-center gap-2">
            {permission === 'granted' && isSubscribed ? (
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : permission === 'denied' ? (
              <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            ) : null}
            {!isSubscribed ? (
              <Button
                size="sm"
                onClick={handleRequestPermission}
                disabled={isLoading || permission === 'denied'}
              >
                {isLoading ? 'Enabling...' : 'Enable'}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled
              >
                Enabled
              </Button>
            )}
          </div>
        </div>

        {permission === 'denied' && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
            <p className="text-xs text-rose-700 dark:text-rose-400">
              Push notifications are blocked. Please enable them in your browser settings.
            </p>
          </div>
        )}

        {isSubscribed && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              You will receive push notifications for important updates.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
