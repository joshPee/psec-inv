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

    const guards = await prisma.guard.findMany({
      where: dateFilter,
      include: {
        issues: {
          include: {
            items: {
              include: {
                equipment: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { fullName: 'asc' }
    })

    // Generate CSV
    const headers = [
      'Guard ID',
      'Full Name',
      'Badge ID',
      'Staff ID',
      'Contact',
      'Status',
      'Team',
      'Shift',
      'Total Issues',
      'Active Issues',
      'Total Items Issued',
      'Total Items Returned'
    ]

    const rows = guards.map(guard => {
      const totalIssues = guard.issues.length
      const activeIssues = guard.issues.filter(i => i.status === 'ISSUED').length
      const totalIssued = guard.issues.reduce((sum, issue) => 
        sum + issue.items.reduce((itemSum, item) => itemSum + item.quantityIssued, 0), 0)
      const totalReturned = guard.issues.reduce((sum, issue) => 
        sum + issue.items.reduce((itemSum, item) => itemSum + item.quantityReturned, 0), 0)

      return [
        guard.id,
        guard.fullName,
        guard.badgeId,
        guard.staffId || '',
        guard.contact || '',
        guard.status,
        guard.team || '',
        guard.shift || '',
        totalIssues.toString(),
        activeIssues.toString(),
        totalIssued.toString(),
        totalReturned.toString()
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="guards-report-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error generating guards report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
