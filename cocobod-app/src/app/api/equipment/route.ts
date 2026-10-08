import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const equipment = await prisma.equipment.findMany({
      include: {
        category: true,
      },
      orderBy: {
        itemName: 'asc',
      },
    })

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Error fetching equipment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemName, categoryId, itemCode, quantity, condition, storageLocation, remarks, lowStockThreshold } = body

    console.log('POST /api/equipment - Received data:', { itemName, categoryId, itemCode, quantity, condition, storageLocation, remarks, lowStockThreshold })

    const qty = parseInt(String(quantity), 10)
    if (!itemName || !categoryId || !itemCode || isNaN(qty) || qty <= 0) {
      console.error('Missing or invalid required fields')
      return NextResponse.json(
        { error: 'Missing or invalid required fields. Name, Category, Item Code, and positive Quantity are required.' },
        { status: 400 }
      )
    }

    // Check duplicate item code
    const existing = await prisma.equipment.findUnique({
      where: { itemCode },
    })

    if (existing) {
      return NextResponse.json(
        { error: `An equipment with item code "${itemCode}" already exists.` },
        { status: 409 }
      )
    }

    // Verify category exists
    const category = await prisma.equipmentCategory.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      console.error('Category not found:', categoryId)
      return NextResponse.json(
        { error: 'Selected category not found' },
        { status: 404 }
      )
    }

    console.log('Category found:', category.name)

    const validCondition = ['GOOD', 'SLIGHTLY_DAMAGED', 'DAMAGED', 'MISSING'].includes(condition)
      ? condition
      : 'GOOD'

    const threshold = lowStockThreshold ? parseInt(String(lowStockThreshold), 10) : null

    const equipment = await prisma.equipment.create({
      data: {
        itemName,
        categoryId,
        itemCode,
        totalQuantity: qty,
        availableQuantity: qty,
        issuedQuantity: 0,
        damagedQuantity: 0,
        missingQuantity: 0,
        defaultCondition: validCondition as any,
        storageLocation: storageLocation || null,
        remarks: remarks || null,
        lowStockThreshold: threshold || 0,
      },
      include: {
        category: true,
      },
    })

    console.log('Equipment created successfully in DB:', equipment.id, equipment.itemName)

    return NextResponse.json(equipment, { status: 201 })
  } catch (error: any) {
    console.error('Error creating equipment:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create equipment' },
      { status: 500 }
    )
  }
}
