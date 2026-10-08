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

    // Generate PDF
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(18)
    doc.text('Damaged Equipment Report', 14, 22)
    
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
    const tableData = damagedRecords.map(record => [
      record.equipment?.itemCode || 'N/A',
      record.equipment?.itemName || 'N/A',
      record.equipment?.category?.name || 'N/A',
      record.guard?.fullName || 'N/A',
      record.guard?.staffId || 'N/A',
      record.quantity,
      record.condition,
      new Date(record.recordedAt).toLocaleDateString(),
      record.recordedBy?.fullName || 'N/A',
      record.remarks || '',
    ]) as any[]

    // Generate table
    autoTable(doc, {
      startY: 45,
      head: ['Code', 'Name', 'Category', 'Guard', 'Guard ID', 'Qty', 'Condition', 'Date', 'Recorded By', 'Remarks'] as any,
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    } as any)

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="damaged-equipment-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error exporting damaged records to PDF:', error)
    return NextResponse.json(
      { error: 'Failed to export damaged records to PDF' },
      { status: 500 }
    )
  }
}
