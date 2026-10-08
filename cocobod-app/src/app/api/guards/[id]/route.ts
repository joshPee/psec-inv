import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'SECURITY_SUPERVISOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params

    // Check if guard has active issues
    const activeIssues = await prisma.equipmentIssue.count({
      where: {
        guardId: id,
        status: 'ISSUED'
      }
    })

    if (activeIssues > 0) {
      return NextResponse.json(
        { error: 'Cannot delete guard with active issued equipment' },
        { status: 400 }
      )
    }

    // Rather than hard delete, just set status to INACTIVE so history is preserved
    await prisma.guard.update({
      where: { id },
      data: { status: 'INACTIVE' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting guard:', error)
    return NextResponse.json(
      { error: 'Failed to delete guard' },
      { status: 500 }
    )
  }
}
