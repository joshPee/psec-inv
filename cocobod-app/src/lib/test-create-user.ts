import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testCreateUser() {
  try {
    const hashedPassword = await bcrypt.hash('Test123', 10)

    const user = await prisma.user.create({
      data: {
        fullName: 'Test User',
        staffId: 'TEST001',
        username: 'testuser',
        email: 'testuser@psec-inv.com',
        passwordHash: hashedPassword,
        role: 'EQUIPMENT_CUSTODIAN',
        isActive: true,
      },
    })

    console.log('✅ User created successfully:', user.fullName)
    console.log('Email:', user.email)
  } catch (error: any) {
    console.error('❌ Error creating user:', error.message)
    if (error.code === 'P2002') {
      console.error('Unique constraint violation:', error.meta?.target)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testCreateUser()
