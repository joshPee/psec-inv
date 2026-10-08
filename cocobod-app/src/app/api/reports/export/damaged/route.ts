import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    if (startDate || endDate) {
      where.recordedAt = {}
      if (startDate) where.recordedAt.gte = new Date(startDate)
      if (endDate) where.recordedAt.lte = new Date(endDate)
    }

    const damagedRecords = await prisma.damagedEquipmentRecord.findMany({
      where,
      include: {
        equipment: {
          include: {
            category: true
          }
        },
        guard: true,
        recordedBy: true,
      },
      orderBy: { recordedAt: 'desc' },
    })

    // Generate CSV
    const headers = ['ID', 'Equipment Code', 'Equipment Name', 'Category', 'Guard Name', 'Guard ID', 'Quantity', 'Condition', 'Recorded At', 'Recorded By', 'Remarks']
    const rows = damagedRecords.map(record => [
      record.id,
      record.equipment?.itemCode || 'N/A',
      record.equipment?.itemName || 'N/A',
      record.equipment?.category?.name || 'N/A',
      record.guard?.fullName || 'N/A',
      record.guard?.staffId || 'N/A',
      record.quantity,
      record.condition,
      record.recordedAt.toISOString(),
      record.recordedBy?.fullName || 'N/A',
      record.remarks || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="damaged-equipment-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting damaged records:', error)
    return NextResponse.json(
      { error: 'Failed to export damaged records' },
      { status: 500 }
    )
  }
}
