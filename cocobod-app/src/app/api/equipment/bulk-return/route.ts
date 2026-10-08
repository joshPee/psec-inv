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

    if (session.user?.role !== 'EQUIPMENT_CUSTODIAN') {
      return NextResponse.json(
        { error: 'Forbidden: Only Equipment Custodians are authorized to perform equipment transactions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { returns } = body

    if (!Array.isArray(returns) || returns.length === 0) {
      return NextResponse.json(
        { error: 'Returns array is required' },
        { status: 400 }
      )
    }

    // Validate each return item
    for (const ret of returns) {
      if (!ret.issueItemId || !ret.quantityReturned || ret.quantityReturned <= 0) {
        return NextResponse.json(
          { error: 'Each return must have issueItemId and valid quantityReturned' },
          { status: 400 }
        )
      }
    }

    // Process returns in transaction
    const results = await prisma.$transaction(async (tx) => {
      const processedReturns = []

      for (const ret of returns) {
        // Get issue item
        const issueItem = await tx.equipmentIssueItem.findUnique({
          where: { id: ret.issueItemId },
        })

        if (!issueItem) {
          throw new Error(`Issue item not found: ${ret.issueItemId}`)
        }

        // Get issue record
        const issueRecord = await tx.equipmentIssue.findUnique({
          where: { id: issueItem.issueId },
        })

        if (!issueRecord) {
          throw new Error(`Issue record not found: ${issueItem.issueId}`)
        }

        if (issueItem.quantityOutstanding < ret.quantityReturned) {
          throw new Error(`Cannot return more than outstanding quantity for item ${issueItem.id}`)
        }

        // Update issue item
        const newOutstanding = issueItem.quantityOutstanding - ret.quantityReturned
        const isFullyReturned = newOutstanding === 0

        await tx.equipmentIssueItem.update({
          where: { id: ret.issueItemId },
          data: {
            quantityReturned: { increment: ret.quantityReturned },
            quantityOutstanding: newOutstanding,
            conditionAtReturn: ret.condition || 'GOOD',
            remarks: ret.remarks || '',
            returnedAt: new Date(),
          }
        })

        // Update equipment quantities
        await tx.equipment.update({
          where: { id: issueItem.equipmentId },
          data: {
            issuedQuantity: { decrement: ret.quantityReturned },
            availableQuantity: { increment: ret.quantityReturned },
          }
        })

        // Create movement record
        await tx.equipmentMovement.create({
          data: {
            equipmentId: issueItem.equipmentId,
            movedById: session.user.id,
            action: 'RETURNED',
            quantity: ret.quantityReturned,
            condition: ret.condition || 'GOOD',
            remarks: `Bulk return - ${ret.remarks || ''}`,
          }
        })

        processedReturns.push({
          issueItemId: ret.issueItemId,
          quantityReturned: ret.quantityReturned,
          isFullyReturned,
        })
      }

      return processedReturns
    })

    return NextResponse.json({
      success: true,
      itemsReturned: results.length,
      returns: results
    })
  } catch (error: any) {
    console.error('Error in bulk return:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to perform bulk return' },
      { status: 500 }
    )
  }
}
