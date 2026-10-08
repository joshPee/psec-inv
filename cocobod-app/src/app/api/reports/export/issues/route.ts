import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.issuedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const issues = await prisma.equipmentIssue.findMany({
      where: dateFilter,
      include: {
        guard: true,
        custodian: true,
        items: {
          include: {
            equipment: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    })

    // Generate CSV
    const headers = [
      'Issue ID',
      'Guard Name',
      'Guard Badge ID',
      'Custodian',
      'Shift',
      'Duty Point',
      'Expected Return Date',
      'Status',
      'Issued At',
      'Item Name',
      'Item Code',
      'Category',
      'Quantity Issued',
      'Quantity Returned',
      'Quantity Outstanding',
      'Condition at Issue',
      'Condition at Return',
      'Returned At'
    ]

    const rows: string[][] = []
    issues.forEach(issue => {
      issue.items.forEach(item => {
        rows.push([
          issue.id,
          issue.guard.fullName,
          issue.guard.badgeId,
          issue.custodian.fullName,
          issue.shift || '',
          issue.dutyPoint || '',
          issue.expectedReturnDate?.toISOString().split('T')[0] || '',
          issue.status,
          issue.issuedAt.toISOString().split('T')[0],
          item.equipment.itemName,
          item.equipment.itemCode,
          item.equipment.category?.name || 'Unknown',
          item.quantityIssued.toString(),
          item.quantityReturned.toString(),
          item.quantityOutstanding.toString(),
          item.conditionAtIssue,
          item.conditionAtReturn || '',
          item.returnedAt?.toISOString().split('T')[0] || ''
        ])
      })
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="equipment-issues-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error generating issues report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
