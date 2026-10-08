import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function addCustodian() {
  console.log('=== Add New Custodian ===\n')

  try {
    const fullName = await question('Full Name: ')
    const staffId = await question('Staff ID: ')
    const username = await question('Username: ')
    const email = await question('Email: ')
    const password = await question('Password: ')

    if (!fullName || !staffId || !username || !email || !password) {
      console.log('❌ All fields are required')
      return
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    })

    if (existingUser) {
      console.log('❌ Username or email already exists')
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        fullName,
        staffId,
        username,
        email,
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
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

addCustodian()
