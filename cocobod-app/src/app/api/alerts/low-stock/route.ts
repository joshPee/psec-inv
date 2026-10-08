import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find all equipment at or below low stock threshold
    const lowStockItems = await prisma.equipment.findMany({
      where: {
        lowStockThreshold: {
          gt: 0,
        },
        availableQuantity: {
          lte: prisma.equipment.fields.lowStockThreshold,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        availableQuantity: 'asc',
      },
    })

    return NextResponse.json({
      count: lowStockItems.length,
      items: lowStockItems,
    })
  } catch (error) {
    console.error('Error fetching low stock alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch low stock alerts' },
      { status: 500 }
    )
  }
}
