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

    const body = await request.json()
    const { equipmentId, adjustmentType, quantity, reason } = body

    if (!equipmentId || !adjustmentType || !quantity || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      )
    }

    if (adjustmentType !== 'RESTOCK' && adjustmentType !== 'WRITE_OFF') {
      return NextResponse.json(
        { error: 'Invalid adjustment type' },
        { status: 400 }
      )
    }

    // Fetch current equipment
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId }
    })

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      )
    }

    // Calculate new quantities
    let updatedTotalQuantity = equipment.totalQuantity
    let updatedAvailableQuantity = equipment.availableQuantity

    if (adjustmentType === 'RESTOCK') {
      updatedTotalQuantity += quantity
      updatedAvailableQuantity += quantity
    } else if (adjustmentType === 'WRITE_OFF') {
      if (updatedAvailableQuantity < quantity) {
        return NextResponse.json(
          { error: 'Cannot write off more units than available' },
          { status: 400 }
        )
      }
      updatedTotalQuantity -= quantity
      updatedAvailableQuantity -= quantity
    }

    // Update equipment
    const updatedEquipment = await prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        totalQuantity: updatedTotalQuantity,
        availableQuantity: updatedAvailableQuantity,
      }
    })

    // Create movement record for audit trail
    await prisma.equipmentMovement.create({
      data: {
        equipmentId,
        action: 'ADJUSTED',
        quantity: adjustmentType === 'RESTOCK' ? quantity : -quantity,
        condition: adjustmentType === 'RESTOCK' ? 'GOOD' : 'DAMAGED',
        remarks: `${adjustmentType}: ${reason}`,
        movedById: session.user.id,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Stock adjusted successfully',
      updatedEquipment
    })
  } catch (error) {
    console.error('Error adjusting stock:', error)
    return NextResponse.json(
      { error: 'Failed to adjust stock' },
      { status: 500 }
    )
  }
}
