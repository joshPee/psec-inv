import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const guardId = searchParams.get('guardId')

    const where: Record<string, unknown> = {}
    if (guardId) where.guardId = guardId

    const issues = await prisma.equipmentIssue.findMany({
      where,
      include: {
        guard: true,
        custodian: { select: { id: true, fullName: true, staffId: true } },
        items: {
          include: {
            equipment: { include: { category: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
      take: 200,
    })

    return NextResponse.json(issues)
  } catch (error) {
    console.error('Error fetching issues:', error)
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 })
  }
}
