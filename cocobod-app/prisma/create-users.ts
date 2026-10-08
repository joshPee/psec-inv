import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating initial users...')

  // Create Security Supervisor
  const supervisorPassword = await bcrypt.hash('admin123', 10)
  const supervisor = await prisma.user.create({
    data: {
      fullName: 'System Administrator',
      staffId: 'ADMIN001',
      username: 'admin@pcc.org',
      passwordHash: supervisorPassword,
      role: 'SECURITY_SUPERVISOR',
      isActive: true,
    },
  })

  // Create Equipment Custodian
  const custodianPassword = await bcrypt.hash('custodian123', 10)
  const custodian = await prisma.user.create({
    data: {
      fullName: 'Equipment Custodian',
      staffId: 'CUST001',
      username: 'custodian@pcc.org',
      passwordHash: custodianPassword,
      role: 'EQUIPMENT_CUSTODIAN',
      isActive: true,
    },
  })

  console.log('Users created successfully!')
  console.log('===========================================')
  console.log('SECURITY SUPERVISOR:')
  console.log('  Username: admin@pcc.org')
  console.log('  Password: admin123')
  console.log('  Staff ID: ADMIN001')
  console.log('')
  console.log('EQUIPMENT CUSTODIAN:')
  console.log('  Username: custodian@pcc.org')
  console.log('  Password: custodian123')
  console.log('  Staff ID: CUST001')
  console.log('===========================================')
  console.log('Please change these passwords after first login!')
}

main()
  .catch((e) => {
    console.error('Error creating users:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
