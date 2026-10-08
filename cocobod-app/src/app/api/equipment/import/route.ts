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
        if (!rowData.item_name || !rowData.item_code || !rowData.category_id) {
          errors.push(`Row ${importedCount + 1}: Missing required fields (item_name, item_code, category_id)`)
          continue
        }

        // Check if equipment already exists
        const existingEquipment = await prisma.equipment.findUnique({
          where: { itemCode: rowData.item_code }
        })

        if (existingEquipment) {
          errors.push(`Row ${importedCount + 1}: Equipment with code ${rowData.item_code} already exists`)
          continue
        }

        // Create equipment
        await prisma.equipment.create({
          data: {
            itemName: rowData.item_name,
            itemCode: rowData.item_code,
            categoryId: rowData.category_id,
            totalQuantity: parseInt(rowData.quantity) || 0,
            availableQuantity: parseInt(rowData.quantity) || 0,
            defaultCondition: rowData.condition || 'GOOD',
            storageLocation: rowData.storage_location || null,
            lowStockThreshold: rowData.low_stock_threshold ? parseInt(rowData.low_stock_threshold) : 0,
            remarks: rowData.remarks || null,
          }
        })

        importedCount++
      } catch (error) {
        console.error('Error importing equipment:', error)
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
