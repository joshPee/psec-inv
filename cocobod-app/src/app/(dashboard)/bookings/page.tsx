import { prisma } from '@/lib/prisma'
import BookingsClient from './BookingsClient'

async function getBookings() {
  try {
    const bookings = await prisma.equipmentBooking.findMany({
      include: {
        guard: true,
        equipment: { include: { category: true } },
        decidedBy: { select: { id: true, fullName: true, staffId: true } },
        fulfilledIssue: { select: { id: true, issuedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    // Calculate summary statistics
    const pending = bookings.filter(b => b.status === 'PENDING').length
    const approved = bookings.filter(b => b.status === 'APPROVED').length
    const fulfilled = bookings.filter(b => b.status === 'FULFILLED').length
    const reservedStock = bookings
      .filter(b => b.status === 'PENDING' || b.status === 'APPROVED')
      .reduce((sum, b) => sum + b.quantityRequested, 0)
    
    const fulfilledToday = bookings.filter(b => {
      return b.status === 'FULFILLED' && 
             b.decidedAt && 
             new Date(b.decidedAt).toDateString() === new Date().toDateString()
    }).length

    // Convert Date objects to strings for client component
    const serializedBookings = bookings.map(booking => ({
      ...booking,
      requestedFor: booking.requestedFor.toISOString(),
      decidedAt: booking.decidedAt?.toISOString() || null,
      expiresAt: booking.expiresAt?.toISOString() || null,
      createdAt: booking.createdAt.toISOString(),
    }))

    return { bookings: serializedBookings, summary: { pending, approved, fulfilled, reservedStock, fulfilledToday } }
  } catch (error) {
    console.error('Database connection error:', error)
    return { bookings: [], summary: { pending: 0, approved: 0, fulfilled: 0, reservedStock: 0, fulfilledToday: 0 } }
  }
}

export default async function BookingsPage() {
  const { bookings, summary } = await getBookings()

  return (
    <BookingsClient 
      bookings={bookings} 
      summary={summary}
    />
  )
}
