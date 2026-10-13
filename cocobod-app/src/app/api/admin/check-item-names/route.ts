import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const equipment = await prisma.equipment.findMany({
      select: {
        id: true,
        itemName: true,
        itemCode: true,
      },
      orderBy: { itemName: 'asc' },
    })

    const itemsWithIssues = equipment.filter(item => 
      item.itemName.includes('0') || 
      item.itemName.endsWith(' ') ||
      item.itemName.startsWith(' ')
    )

    return NextResponse.json({
      total: equipment.length,
      itemsWithIssues,
      allItems: equipment.map(item => ({
        name: item.itemName,
        code: item.itemCode,
        hasTrailingSpace: item.itemName.endsWith(' '),
        hasLeadingSpace: item.itemName.startsWith(' '),
        containsZero: item.itemName.includes('0'),
      }))
    })
  } catch (error) {
    console.error('Error checking item names:', error)
    return NextResponse.json(
      { error: 'Failed to check item names' },
      { status: 500 }
    )
  }
}
