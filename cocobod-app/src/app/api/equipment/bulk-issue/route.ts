import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyIssue, notifyLowStock } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user?.role !== 'EQUIPMENT_CUSTODIAN') {
      return NextResponse.json(
        { error: 'Forbidden: Only Equipment Custodians are authorized to perform equipment transactions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { guardId, items } = body

    if (!guardId) {
      return NextResponse.json(
        { error: 'Guard is required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    // Validate each item
    for (const item of items) {
      if (!item.equipmentId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Each item must have equipmentId and valid quantity' },
          { status: 400 }
        )
      }
    }

    // Create equipment issue record
    const issue = await prisma.equipmentIssue.create({
      data: {
        guardId,
        custodianId: session.user.id,
        remarks: `Bulk issue of ${items.length} items`,
      }
    })

    // Create issue items and update equipment quantities
    const results = await prisma.$transaction(async (tx) => {
      const issueItems = []

      for (const item of items) {
        // Check equipment availability
        const equipment = await tx.equipment.findUnique({
          where: { id: item.equipmentId }
        })

        if (!equipment) {
          throw new Error(`Equipment not found: ${item.equipmentId}`)
        }

        if (equipment.availableQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${equipment.itemName}. Available: ${equipment.availableQuantity}, Requested: ${item.quantity}`)
        }

        // Create issue item
        const issueItem = await tx.equipmentIssueItem.create({
          data: {
            issueId: issue.id,
            equipmentId: item.equipmentId,
            quantityIssued: item.quantity,
            quantityOutstanding: item.quantity,
            conditionAtIssue: item.condition || 'GOOD',
            remarks: item.remarks || '',
          }
        })

        // Update equipment quantities
        await tx.equipment.update({
          where: { id: item.equipmentId },
          data: {
            issuedQuantity: { increment: item.quantity },
            availableQuantity: { decrement: item.quantity },
          }
        })

        // Create movement record
        await tx.equipmentMovement.create({
          data: {
            equipmentId: item.equipmentId,
            guardId,
            movedById: session.user.id,
            action: 'ISSUED',
            quantity: item.quantity,
            condition: item.condition || 'GOOD',
            remarks: `Bulk issue - ${item.remarks || ''}`,
          }
        })

        issueItems.push({
          ...issueItem,
          equipmentName: equipment.itemName,
          remainingStock: equipment.availableQuantity - item.quantity,
          lowStockThreshold: equipment.lowStockThreshold
        })
      }

      return issueItems
    })

    // Fetch guard info for notifications
    const guard = await prisma.guard.findUnique({ where: { id: guardId } })
    if (guard) {
      for (const item of results) {
        notifyIssue(guard.fullName, item.equipmentName, item.quantityIssued).catch(console.error)
        if (item.remainingStock <= item.lowStockThreshold) {
          notifyLowStock(item.equipmentName, item.remainingStock).catch(console.error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      issueId: issue.id,
      itemsIssued: results.length,
      items: results
    })
  } catch (error: any) {
    console.error('Error in bulk issue:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to perform bulk issue' },
      { status: 500 }
    )
  }
}
