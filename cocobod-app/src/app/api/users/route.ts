import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        id: { not: session.user.id }
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        role: true,
        staffId: true
      },
      orderBy: { fullName: 'asc' }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ users: [] })
  }
}
