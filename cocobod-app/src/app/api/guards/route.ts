import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const guards = await prisma.guard.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        fullName: 'asc',
      },
    })

    return NextResponse.json(guards)
  } catch (error) {
    console.error('Error fetching guards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guards' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { fullName, badgeId, staffId, contact, team, shift } = data

    if (!fullName || !badgeId) {
      return NextResponse.json(
        { error: 'Full name and badge ID are required' },
        { status: 400 }
      )
    }

    const guard = await prisma.guard.create({
      data: {
        fullName,
        badgeId,
        staffId: staffId || null,
        contact: contact || null,
        team: team || null,
        shift: shift || null,
        status: 'ACTIVE',
      },
    })

    return NextResponse.json(guard, { status: 201 })
  } catch (error: any) {
    console.error('Error creating guard:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A guard with this Badge ID or Staff ID already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create guard' },
      { status: 500 }
    )
  }
}
