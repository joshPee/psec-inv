import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        staffId: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    })

    console.log('Current users in database:')
    console.log(JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
