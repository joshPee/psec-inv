import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const movements = await prisma.equipmentMovement.findMany({
      where,
      include: {
        equipment: {
          include: {
            category: true
          }
        },
        guard: true,
        movedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Generate CSV
    const headers = ['ID', 'Date', 'Action', 'Equipment Code', 'Equipment Name', 'Category', 'Guard Name', 'Guard ID', 'Custodian', 'Quantity', 'Condition', 'Remarks']
    const rows = movements.map(movement => [
      movement.id,
      movement.createdAt.toISOString(),
      movement.action,
      movement.equipment?.itemCode || 'N/A',
      movement.equipment?.itemName || 'N/A',
      movement.equipment?.category?.name || 'N/A',
      movement.guard?.fullName || 'N/A',
      movement.guard?.staffId || 'N/A',
      movement.movedBy?.fullName || 'N/A',
      movement.quantity,
      movement.condition,
      movement.remarks || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="equipment-movements-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting movements:', error)
    return NextResponse.json(
      { error: 'Failed to export movements' },
      { status: 500 }
    )
  }
}
