import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function addUsers() {
  console.log('Adding real users with email format...')

  try {
    // Sample real users - replace with actual names and emails
    const users = [
      {
        fullName: 'Kwame Mensah',
        staffId: 'STF001',
        username: 'kwame.mensah',
        email: 'kwame.mensah@psec-inv.com',
        password: 'Password123',
        role: 'SECURITY_SUPERVISOR' as const,
      },
      {
        fullName: 'Ama Serwaa',
        staffId: 'STF002',
        username: 'ama.serwaa',
        email: 'ama.serwaa@psec-inv.com',
        password: 'Password123',
        role: 'EQUIPMENT_CUSTODIAN' as const,
      },
      {
        fullName: 'Kofi Agyeman',
        staffId: 'STF003',
        username: 'kofi.agyeman',
        email: 'kofi.agyeman@psec-inv.com',
        password: 'Password123',
        role: 'EQUIPMENT_CUSTODIAN' as const,
      },
      {
        fullName: 'Efua Dufie',
        staffId: 'STF004',
        username: 'efua.dufie',
        email: 'efua.dufie@psec-inv.com',
        password: 'Password123',
        role: 'EQUIPMENT_CUSTODIAN' as const,
      },
    ]

    for (const userData of users) {
      const passwordHash = await bcrypt.hash(userData.password, 10)

      const user = await prisma.user.create({
        data: {
          fullName: userData.fullName,
          staffId: userData.staffId,
          username: userData.username,
          email: userData.email,
          passwordHash: passwordHash,
          role: userData.role,
          isActive: true,
        },
      })

      console.log(`✅ Created user: ${user.fullName} (${user.email})`)
    }

    console.log('\n✅ All users added successfully!')
    console.log('\nLogin credentials:')
    console.log('Default password for all users: Password123')
    console.log('\nUsers can change their password after first login.')
  } catch (error) {
    console.error('❌ Error adding users:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addUsers()
