import { prisma } from '@/lib/prisma'
import GuardsClient from './GuardsClient'

async function getGuardsData() {
  try {
    const guards = await prisma.guard.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        bookings: {
          include: {
            equipment: { include: { category: true } },
            decidedBy: { select: { id: true, fullName: true, staffId: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        issues: {
          include: {
            items: {
              include: {
                equipment: { include: { category: true } },
              },
            },
            custodian: { select: { id: true, fullName: true, staffId: true } },
          },
          orderBy: { issuedAt: 'desc' },
        },
      },
      orderBy: { fullName: 'asc' },
    })

    // Serialize dates for client component
    const serializedGuards = guards.map(guard => ({
      ...guard,
      bookings: guard.bookings.map(booking => ({
        ...booking,
        requestedFor: booking.requestedFor.toISOString(),
        decidedAt: booking.decidedAt?.toISOString() || null,
        expiresAt: booking.expiresAt?.toISOString() || null,
        createdAt: booking.createdAt.toISOString(),
      })),
      issues: guard.issues.map(issue => ({
        ...issue,
        issuedAt: issue.issuedAt.toISOString(),
        expectedReturnDate: issue.expectedReturnDate?.toISOString() || null,
        items: issue.items.map(item => ({
          ...item,
          returnedAt: item.returnedAt?.toISOString() || null,
        })),
      })),
    }))

    return serializedGuards
  } catch (error) {
    console.error('Database connection error:', error)
    return []
  }
}

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function GuardsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  const guards = await getGuardsData()

  return (
    <GuardsClient 
      guards={guards}
      userRole={session.user.role}
    />
  )
}
