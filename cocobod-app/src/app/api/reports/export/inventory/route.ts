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

    const equipment = await prisma.equipment.findMany({
      where: dateFilter,
      include: { category: true },
      orderBy: { itemName: 'asc' }
    })

    // Generate CSV
    const headers = [
      'Item Code',
      'Item Name',
      'Category',
      'Total Quantity',
      'Available',
      'Issued',
      'Damaged',
      'Missing',
      'Default Condition',
      'Storage Location',
      'Remarks'
    ]

    const rows = equipment.map(item => [
      item.itemCode,
      item.itemName,
      item.category?.name || 'Unknown',
      item.totalQuantity.toString(),
      item.availableQuantity.toString(),
      item.issuedQuantity.toString(),
      item.damagedQuantity.toString(),
      item.missingQuantity.toString(),
      item.defaultCondition,
      item.storageLocation || '',
      item.remarks || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="equipment-inventory-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error generating inventory report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
