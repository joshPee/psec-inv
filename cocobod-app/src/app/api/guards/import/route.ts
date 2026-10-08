import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read CSV file
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file is empty or has no data rows' },
        { status: 400 }
      )
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const dataRows = lines.slice(1)

    let importedCount = 0
    let errors: string[] = []

    for (const row of dataRows) {
      try {
        const values = row.split(',').map(v => v.trim())
        const rowData: any = {}

        headers.forEach((header, index) => {
          rowData[header] = values[index] || ''
        })

        // Validate required fields
        if (!rowData.full_name || !rowData.badge_id) {
          errors.push(`Row ${importedCount + 1}: Missing required fields (full_name, badge_id)`)
          continue
        }

        // Check if guard already exists
        const existingGuard = await prisma.guard.findUnique({
          where: { badgeId: rowData.badge_id }
        })

        if (existingGuard) {
          errors.push(`Row ${importedCount + 1}: Guard with badge ID ${rowData.badge_id} already exists`)
          continue
        }

        // Create guard
        await prisma.guard.create({
          data: {
            fullName: rowData.full_name,
            badgeId: rowData.badge_id,
            staffId: rowData.staff_id || null,
            contact: rowData.contact || null,
            team: rowData.team || null,
            shift: rowData.shift || null,
            status: rowData.status || 'ACTIVE',
          }
        })

        importedCount++
      } catch (error) {
        console.error('Error importing guard:', error)
        errors.push(`Row ${importedCount + 1}: Import failed`)
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      errors: errors.length > 0 ? errors : undefined,
      totalRows: dataRows.length
    })
  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { error: 'Bulk import failed. Please try again.' },
      { status: 500 }
    )
  }
}
