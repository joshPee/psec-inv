// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

    // Generate PDF
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(18)
    doc.text('Equipment Movements Report', 14, 22)
    
    // Date range subtitle
    doc.setFontSize(10)
    doc.setTextColor(100)
    if (startDate || endDate) {
      const dateRange = `Date Range: ${startDate || 'All'} to ${endDate || 'All'}`
      doc.text(dateRange, 14, 30)
    }
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36)
    doc.setTextColor(0)

    // Table data
    const tableData = movements.map(movement => [
      new Date(movement.createdAt).toLocaleDateString(),
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
    ]) as any[]

    // Generate table
    // @ts-ignore
    autoTable(doc, {
      startY: 45,
      head: ['Date', 'Action', 'Code', 'Name', 'Category', 'Guard', 'Guard ID', 'Custodian', 'Qty', 'Condition', 'Remarks'],
      body: tableData,
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    })

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="equipment-movements-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error exporting movements to PDF:', error)
    return NextResponse.json(
      { error: 'Failed to export movements to PDF' },
      { status: 500 }
    )
  }
}
