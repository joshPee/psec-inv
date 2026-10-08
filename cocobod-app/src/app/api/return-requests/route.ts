import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { issueId, guardId } = body

    if (!issueId || !guardId) {
      return NextResponse.json({ error: 'Issue ID and Guard ID are required' }, { status: 400 })
    }

    // Verify the issue belongs to the guard
    const issue = await prisma.equipmentIssue.findUnique({
      where: { id: issueId },
      include: {
        guard: true,
        items: {
          include: {
            equipment: true,
          },
        },
      },
    })

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    if (issue.guardId !== guardId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (issue.status !== 'ISSUED') {
      return NextResponse.json({ error: 'Issue is not in ISSUED status' }, { status: 400 })
    }

    // Create a notification for custodians about the return request
    const custodians = await prisma.user.findMany({
      where: { role: 'EQUIPMENT_CUSTODIAN', isActive: true },
    })

    for (const custodian of custodians) {
      await prisma.notification.create({
        data: {
          userId: custodian.id,
          type: 'RETURN',
          title: 'Equipment Return Request',
          message: `Guard ${issue.guard.fullName} (${issue.guard.badgeId}) has requested to return equipment. Issue ID: ${issueId}`,
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Return request submitted successfully' })
  } catch (error) {
    console.error('Error submitting return request:', error)
    return NextResponse.json({ error: 'Failed to submit return request' }, { status: 500 })
  }
}
