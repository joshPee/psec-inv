import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateVapidKey = process.env.VAPID_PRIVATE_KEY

if (!publicVapidKey || !privateVapidKey) {
  console.warn('VAPID keys not configured. Push notifications will not work.')
}

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(
    'mailto:admin@psec-inv.com',
    publicVapidKey,
    privateVapidKey
  )
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
}

interface PushSubscription {
  endpoint: string
  p256dh: string
  auth: string
}

export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    })

    if (subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`)
      return
    }

    const notifications = subscriptions.map((subscription: any) => {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      }

      return webpush.sendNotification(pushSubscription, JSON.stringify(payload))
    })

    await Promise.allSettled(notifications)
  } catch (error) {
    console.error('Error sending push notification:', error)
  }
}

export async function sendPushNotificationToAll(
  payload: PushNotificationPayload
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany()

    if (subscriptions.length === 0) {
      console.log('No push subscriptions found')
      return
    }

    const notifications = subscriptions.map((subscription: any) => {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      }

      return webpush.sendNotification(pushSubscription, JSON.stringify(payload))
    })

    await Promise.allSettled(notifications)
  } catch (error) {
    console.error('Error sending push notification to all:', error)
  }
}

export async function sendOverdueAlert(overdueCount: number) {
  await sendPushNotificationToAll({
    title: 'Overdue Equipment Alert',
    body: `${overdueCount} equipment item(s) are overdue for return`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: { type: 'OVERDUE', count: overdueCount },
  })
}

export async function sendBookingAlert(guardName: string, equipmentName: string) {
  await sendPushNotificationToAll({
    title: 'New Booking Request',
    body: `${guardName} has requested ${equipmentName}`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: { type: 'BOOKING', guardName, equipmentName },
  })
}

export async function sendLowStockAlert(itemName: string, available: number) {
  await sendPushNotificationToAll({
    title: 'Low Stock Alert',
    body: `${itemName} is running low (${available} available)`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: { type: 'LOW_STOCK', itemName, available },
  })
}
