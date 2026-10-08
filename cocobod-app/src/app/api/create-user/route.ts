import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, fullName, staffId, role, email } = body

    // Allow creating with defaults if not provided
    const finalUsername = username || 'admin'
    const finalPassword = password || 'admin123'
    const finalFullName = fullName || 'System Administrator'
    const finalStaffId = staffId || 'STAFF001'
    const finalRole = role || 'SECURITY_SUPERVISOR'
    const finalEmail = email || `${finalUsername}@psec-inv.com`

    console.log('Creating user:', { username: finalUsername, fullName: finalFullName, staffId: finalStaffId })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: finalUsername }
    })

    if (existingUser) {
      console.log('User already exists:', existingUser.username)
      return NextResponse.json(
        { error: 'User with this username already exists', existingUser: { username: existingUser.username, fullName: existingUser.fullName } },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(finalPassword, 10)
    console.log('Password hashed successfully')

    // Create user
    const user = await prisma.user.create({
      data: {
        username: finalUsername,
        passwordHash,
        fullName: finalFullName,
        staffId: finalStaffId,
        role: finalRole,
        email: finalEmail,
        isActive: true
      }
    })

    console.log('User created successfully:', user.username)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        staffId: user.staffId,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET to create default admin user
export async function GET() {
  try {
    console.log('Creating default admin user...')

    const username = 'admin'
    const password = 'admin123'
    const fullName = 'System Administrator'
    const staffId = 'STAFF001'
    const role = 'SECURITY_SUPERVISOR'
    const email = 'admin@psec-inv.com'

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      console.log('Admin user already exists')
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        user: {
          username: existingUser.username,
          fullName: existingUser.fullName,
          staffId: existingUser.staffId,
          role: existingUser.role
        }
      })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        fullName,
        staffId,
        role,
        email,
        isActive: true
      }
    })

    console.log('Default admin user created')
    return NextResponse.json({
      success: true,
      message: 'Default admin user created',
      user: {
        username: user.username,
        fullName: user.fullName,
        staffId: user.staffId,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error creating default user:', error)
    return NextResponse.json(
      { error: 'Failed to create default user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
