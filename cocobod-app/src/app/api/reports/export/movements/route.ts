import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const movements = await prisma.equipmentMovement.findMany({
      where: dateFilter,
      include: {
        equipment: {
          include: {
            category: true
          }
        },
        guard: true,
        movedBy: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Generate CSV
    const headers = [
      'Movement ID',
      'Equipment Name',
      'Item Code',
      'Category',
      'Guard Name',
      'Guard Badge ID',
      'Moved By',
      'Action',
      'Quantity',
      'Condition',
      'Duty Point',
      'Remarks',
      'Created At'
    ]

    const rows = movements.map(movement => [
      movement.id,
      movement.equipment.itemName,
      movement.equipment.itemCode,
      movement.equipment.category?.name || 'Unknown',
      movement.guard?.fullName || '',
      movement.guard?.badgeId || '',
      movement.movedBy.fullName,
      movement.action,
      movement.quantity.toString(),
      movement.condition || '',
      movement.dutyPoint || '',
      movement.remarks || '',
      movement.createdAt.toISOString().split('T')[0]
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="equipment-movements-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error generating movements report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
