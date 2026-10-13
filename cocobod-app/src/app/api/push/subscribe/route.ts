import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { endpoint, keys } = await request.json()

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }

    // Check if subscription already exists for this user
    const existing = await prisma.pushSubscription.findFirst({
      where: { userId: session.user.id },
    })

    if (existing) {
      // Update existing subscription
      await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: { endpoint, p256dh: keys.p256dh, auth: keys.auth },
      })
    } else {
      // Create new subscription
      await prisma.pushSubscription.create({
        data: {
          userId: session.user.id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
