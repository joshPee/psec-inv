import { prisma } from '@/lib/prisma'
import GuardPortalClient from './GuardPortalClient'

async function getGuardBookings(guardId: string) {
  try {
    const bookings = await prisma.equipmentBooking.findMany({
      where: { guardId },
      include: {
        equipment: { include: { category: true } },
        decidedBy: { select: { id: true, fullName: true, staffId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const issues = await prisma.equipmentIssue.findMany({
      where: { guardId },
      include: {
        items: {
          include: {
            equipment: { include: { category: true } },
          },
        },
        custodian: { select: { id: true, fullName: true, staffId: true } },
      },
      orderBy: { issuedAt: 'desc' },
      take: 50,
    })

    // Serialize dates
    const serializedBookings = bookings.map(booking => ({
      ...booking,
      requestedFor: booking.requestedFor.toISOString(),
      decidedAt: booking.decidedAt?.toISOString() || null,
      expiresAt: booking.expiresAt?.toISOString() || null,
      createdAt: booking.createdAt.toISOString(),
    }))

    const serializedIssues = issues.map(issue => ({
      ...issue,
      issuedAt: issue.issuedAt.toISOString(),
      expectedReturnDate: issue.expectedReturnDate?.toISOString() || null,
      items: issue.items.map(item => ({
        ...item,
        returnedAt: item.returnedAt?.toISOString() || null,
      })),
    }))

    return { bookings: serializedBookings, issues: serializedIssues }
  } catch (error) {
    console.error('Database connection error:', error)
    return { bookings: [], issues: [] }
  }
}

async function getAvailableEquipment() {
  try {
    const equipment = await prisma.equipment.findMany({
      where: { availableQuantity: { gt: 0 } },
      include: { category: true },
      orderBy: { itemName: 'asc' },
    })
    return equipment
  } catch (error) {
    console.error('Database connection error:', error)
    return []
  }
}

export default async function GuardPortalPage() {
  // This is a client-side authenticated page, so we'll fetch data on the client
  const equipment = await getAvailableEquipment()

  return (
    <GuardPortalClient 
      availableEquipment={equipment}
    />
  )
}
