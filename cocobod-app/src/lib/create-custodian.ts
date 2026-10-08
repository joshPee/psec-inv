import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// EDIT THESE VALUES FOR EACH NEW CUSTODIAN
const newCustodian = {
  fullName: 'New Custodian Name',
  staffId: 'STF005',
  username: 'new.custodian',
  email: 'new.custodian@psec-inv.com',
  password: 'Password123',
}

async function createCustodian() {
  console.log('Creating custodian:', newCustodian.fullName)

  try {
    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: newCustodian.username },
          { email: newCustodian.email },
        ],
      },
    })

    if (existingUser) {
      console.log('❌ Username or email already exists')
      await prisma.$disconnect()
      return
    }

    const hashedPassword = await bcrypt.hash(newCustodian.password, 10)

    const user = await prisma.user.create({
      data: {
        fullName: newCustodian.fullName,
        staffId: newCustodian.staffId,
        username: newCustodian.username,
        email: newCustodian.email,
        passwordHash: hashedPassword,
        role: 'EQUIPMENT_CUSTODIAN',
        isActive: true,
      },
    })

    console.log('\n✅ Custodian created successfully!')
    console.log(`Name: ${user.fullName}`)
    console.log(`Email: ${user.email}`)
    console.log(`Username: ${user.username}`)
    console.log(`Staff ID: ${user.staffId}`)
    console.log(`Password: ${newCustodian.password}`)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createCustodian()
