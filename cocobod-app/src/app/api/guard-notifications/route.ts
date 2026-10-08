import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const guardId = searchParams.get('guardId')

    if (!guardId) {
      return NextResponse.json({ error: 'Guard ID is required' }, { status: 400 })
    }

    // Get guard's bookings and check for notifications
    const bookings = await prisma.equipmentBooking.findMany({
      where: { guardId },
      include: {
        equipment: { select: { itemName: true } },
        decidedBy: { select: { id: true, fullName: true, staffId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // Generate notifications from booking status changes
    const notifications = bookings
      .filter(b => b.status === 'APPROVED' || b.status === 'REJECTED')
      .map(booking => ({
        id: `booking-${booking.id}`,
        type: booking.status === 'APPROVED' ? 'BOOKING_APPROVED' : 'BOOKING_REJECTED',
        title: booking.status === 'APPROVED' ? 'Booking Approved' : 'Booking Rejected',
        message: booking.status === 'APPROVED'
          ? `Your request for ${booking.equipment.itemName} has been approved. Please proceed to the armory.`
          : `Your request for ${booking.equipment.itemName} was rejected${booking.remarks ? `: ${booking.remarks}` : ''}.`,
        read: false,
        createdAt: booking.decidedAt || booking.createdAt,
      }))

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching guard notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}
