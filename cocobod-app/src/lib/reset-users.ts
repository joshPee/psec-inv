import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetUsers() {
  console.log('Clearing all users...')

  try {
    // Delete all users
    await prisma.user.deleteMany({})
    console.log('✅ All users cleared')

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123', 10)

    const admin = await prisma.user.create({
      data: {
        fullName: 'Prah Joshua Kwame',
        staffId: 'ADMIN001',
        username: 'JoshKay',
        email: 'josh.kwame@psec-inv.com',
        passwordHash: adminPassword,
        role: 'SECURITY_SUPERVISOR',
        isActive: true,
      },
    })

    console.log('\n✅ Admin user created successfully!')
    console.log('\n=== ADMIN LOGIN CREDENTIALS ===')
    console.log(`Full Name: ${admin.fullName}`)
    console.log(`Username: ${admin.username}`)
    console.log(`Email: ${admin.email}`)
    console.log(`Staff ID: ${admin.staffId}`)
    console.log(`Password: Admin123`)
    console.log('================================\n')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

resetUsers()
