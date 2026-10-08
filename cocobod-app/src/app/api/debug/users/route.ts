import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        staffId: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      count: users.length,
      users
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
