import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ActiveIssuedClient from './ActiveIssuedClient'

async function getActiveIssuedItems() {
  try {
    const activeIssueItems = await prisma.equipmentIssueItem.findMany({
      where: {
        quantityOutstanding: { gt: 0 },
      },
      include: {
        equipment: {
          include: {
            category: true,
          },
        },
        issue: {
          include: {
            guard: true,
            custodian: true,
          },
        },
      },
      orderBy: {
        issue: {
          issuedAt: 'desc',
        },
      },
    })

    // Serialize dates for client component
    const serializedItems = activeIssueItems.map(item => ({
      ...item,
      issue: {
        ...item.issue,
        issuedAt: item.issue.issuedAt.toISOString(),
        expectedReturnDate: item.issue.expectedReturnDate?.toISOString() || null,
      },
    }))

    return serializedItems
  } catch (error) {
    console.error('Database connection error:', error)
    return []
  }
}

export default async function ActiveIssuedItemsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  const activeItems = await getActiveIssuedItems()

  return <ActiveIssuedClient activeItems={activeItems} userRole={session.user.role} />
}
