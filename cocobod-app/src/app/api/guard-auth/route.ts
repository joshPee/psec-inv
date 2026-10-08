import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { badgeId } = body

    if (!badgeId) {
      return NextResponse.json({ error: 'Badge ID is required' }, { status: 400 })
    }

    const guard = await prisma.guard.findUnique({
      where: { badgeId },
      select: {
        id: true,
        fullName: true,
        badgeId: true,
        staffId: true,
        status: true,
        team: true,
        shift: true,
      }
    })

    if (!guard) {
      return NextResponse.json({ error: 'Invalid badge ID' }, { status: 401 })
    }

    if (guard.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Guard account is inactive' }, { status: 403 })
    }

    // Create a simple session for the guard
    const response = NextResponse.json({ 
      success: true,
      guard: {
        id: guard.id,
        fullName: guard.fullName,
        badgeId: guard.badgeId,
        staffId: guard.staffId,
        team: guard.team,
        shift: guard.shift,
      }
    })

    // Set a simple cookie for guard session
    response.cookies.set('guard-session', JSON.stringify({
      guardId: guard.id,
      badgeId: guard.badgeId,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return response
  } catch (error) {
    console.error('Guard auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('guard-session')
  
  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false })
  }

  try {
    const session = JSON.parse(sessionCookie.value)
    
    const guard = await prisma.guard.findUnique({
      where: { id: session.guardId },
      select: {
        id: true,
        fullName: true,
        badgeId: true,
        staffId: true,
        status: true,
        team: true,
        shift: true,
      }
    })

    if (!guard || guard.status !== 'ACTIVE') {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({ 
      authenticated: true,
      guard: {
        id: guard.id,
        fullName: guard.fullName,
        badgeId: guard.badgeId,
        staffId: guard.staffId,
        team: guard.team,
        shift: guard.shift,
      }
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('guard-session')
  return response
}
