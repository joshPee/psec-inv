import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import GuardProfileClient from './GuardProfileClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

async function getGuardData(guardId: string) {
  try {
    const guard = await prisma.guard.findUnique({
      where: { id: guardId },
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
        damaged: {
          include: {
            equipment: { include: { category: true } },
            recordedBy: { select: { id: true, fullName: true, staffId: true } },
          },
          orderBy: { recordedAt: 'desc' },
        },
        missing: {
          include: {
            equipment: { include: { category: true } },
            recordedBy: { select: { id: true, fullName: true, staffId: true } },
          },
          orderBy: { recordedAt: 'desc' },
        },
      },
    })

    if (!guard) {
      return null
    }

    // Serialize dates
    return {
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
      damaged: guard.damaged.map(record => ({
        ...record,
        recordedAt: record.recordedAt.toISOString(),
      })),
      missing: guard.missing.map(record => ({
        ...record,
        recordedAt: record.recordedAt.toISOString(),
      })),
    }
  } catch (error) {
    console.error('Error fetching guard data:', error)
    return null
  }
}

export default async function GuardProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  const { id } = await params
  const guard = await getGuardData(id)

  if (!guard) {
    notFound()
  }

  return (
    <GuardProfileClient 
      guard={guard}
      userRole={session.user.role}
    />
  )
}
