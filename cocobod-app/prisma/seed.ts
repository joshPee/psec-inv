import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

declare const process: any

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Clear existing data
  console.log('Clearing existing data...')
  await prisma.equipmentMovement.deleteMany()
  await prisma.equipmentIssueItem.deleteMany()
  await prisma.equipmentIssue.deleteMany()
  await prisma.damagedEquipmentRecord.deleteMany()
  await prisma.missingEquipmentRecord.deleteMany()
  await prisma.equipment.deleteMany()
  await prisma.equipmentCategory.deleteMany()
  await prisma.guard.deleteMany()
  await prisma.user.deleteMany()
  await prisma.notification.deleteMany()
  console.log('Existing data cleared')

  // ============================================
  // CREATE STAFF USERS
  // ============================================
  console.log('Creating staff users...')

  // Equipment Custodian
  const custodianPassword = await bcrypt.hash('custodian123', 10)
  const custodian = await prisma.user.create({
    data: {
      fullName: 'Equipment Custodian',
      staffId: 'CUST001',
      username: 'custodian',
      email: 'custodian@pcc-vms.vercel.app',
      passwordHash: custodianPassword,
      role: 'EQUIPMENT_CUSTODIAN',
      isActive: true,
    },
  })

  // Security Supervisor
  const supervisorPassword = await bcrypt.hash('supervisor123', 10)
  const supervisor = await prisma.user.create({
    data: {
      fullName: 'Security Supervisor',
      staffId: 'SUP001',
      username: 'supervisor',
      email: 'supervisor@pcc-vms.vercel.app',
      passwordHash: supervisorPassword,
      role: 'SECURITY_SUPERVISOR',
      isActive: true,
    },
  })

  // Additional Admin User
  const adminPassword = await bcrypt.hash('Admin123', 10)
  const admin = await prisma.user.create({
    data: {
      fullName: 'Josh Kwame',
      staffId: 'SUP002',
      username: 'josh.kwame',
      email: 'josh.kwame@psec-inv.com',
      passwordHash: adminPassword,
      role: 'SECURITY_SUPERVISOR',
      isActive: true,
    },
  })

  // Additional Custodian User
  const mikePassword = await bcrypt.hash('mike@123', 10)
  const mike = await prisma.user.create({
    data: {
      fullName: 'Mike',
      staffId: 'CUST002',
      username: 'mike',
      email: 'mike@psec-inv.com',
      passwordHash: mikePassword,
      role: 'EQUIPMENT_CUSTODIAN',
      isActive: true,
    },
  })

  console.log('Staff users created:', { custodian, supervisor, admin, mike })

  // ============================================
  // CREATE EQUIPMENT CATEGORIES
  // ============================================
  console.log('Creating equipment categories...')

  const weaponsCategory = await prisma.equipmentCategory.create({
    data: {
      name: 'Weapons',
      description: 'Firearms and other weapons',
    },
  })

  const uniformsCategory = await prisma.equipmentCategory.create({
    data: {
      name: 'Uniforms',
      description: 'Security uniforms and protective gear',
    },
  })

  const communicationCategory = await prisma.equipmentCategory.create({
    data: {
      name: 'Communication',
      description: 'Radios and communication devices',
    },
  })

  const vehiclesCategory = await prisma.equipmentCategory.create({
    data: {
      name: 'Vehicles',
      description: 'Security vehicles and transport',
    },
  })

  const otherCategory = await prisma.equipmentCategory.create({
    data: {
      name: 'Other Equipment',
      description: 'Miscellaneous security equipment',
    },
  })

  console.log('Categories created:', { weaponsCategory, uniformsCategory, communicationCategory, vehiclesCategory, otherCategory })

  // ============================================
  // CREATE GUARDS FOR TRACKING (NO AUTHENTICATION)
  // ============================================
  console.log('Creating guards for equipment tracking...')

  const guardNames = [
    'Ayitey Prince',
    'Martin Korang',
    'Fortunate Erzuah',
    'Emmanuel Cudjoe',
    'Belinda Semefa',
    'Stephen Benianah',
    'Richmond Ofosu',
    'Abigail Aidoo',
    'Vida Daboro',
    'Samuel Nii',
    'Justine Dotse',
    'Derrick Mills',
    'Francis Bintel Bichutab',
    'Genevieve Akwensivie',
    'Divine Amevialor',
    'Justice Mensah',
    'Simon Peter',
    'Harrison Benard',
    'Oti Anthony',
    'Mawunyo Azumah',
    'Wilma Amuzu',
    'Godfred Adom',
    'Faustina Donkor',
    'Mariam Obeng',
    'Nathaniel Kumah',
    'Fredrick Akuffo',
    'Justice Akromah',
    'Akosua Asante Asare',
    'Emmanuel Amankwah',
    'Anita Sefakor Owusu',
    'Michael Ahiavor',
    'Ebenezer K. Arthur',
    'Kingsley Nartey',
    'Ujakpo Ebenezer',
    'Fortunate Erzuah',
    'Antwi Gabriel',
    'Agamah Gideon',
    'Obiri Ebenezer',
    'Amedu Sylvester',
    'Rejoice Kogbe',
    'Qahar Adizatu',
    'Richard Appiah',
    'Warlasi Enoch',
    'Badu Harrison',
    'Bright Osei Tutu',
    'Tetteh Justice',
    'Michael Appiah',
    'Boadu Osei Philip',
    'Asante Eric',
    'John Narh',
    'Ebenezer Yeboah',
    'Prah Joshua Kwame',
    'Isaac Owusu Awortwoe',
  ]

  const guards = []
  for (let i = 0; i < guardNames.length; i++) {
    const guardNumber = (i + 1).toString().padStart(3, '0')
    const guard = await prisma.guard.create({
      data: {
        fullName: guardNames[i],
        badgeId: `SEC-${guardNumber}`,
        staffId: `PCC-SEC-${guardNumber}`,
        status: 'ACTIVE',
        contact: `+233-200-${guardNumber}${guardNumber}${guardNumber}`,
        team: null,
        shift: null,
      },
    })
    guards.push(guard)
  }

  console.log(`Created ${guards.length} guards for tracking`)

  // Update specific guards with special roles
  await prisma.guard.updateMany({
    where: { fullName: 'Vida Daboro' },
    data: { team: 'Day Supervisor' }
  })
  await prisma.guard.updateMany({
    where: { fullName: 'Justine Dotse' },
    data: { team: 'Response Officer' }
  })
  await prisma.guard.updateMany({
    where: { fullName: 'Justice Mensah' },
    data: { team: 'Response Officer' }
  })
  await prisma.guard.updateMany({
    where: { fullName: 'Michael Ahiavor' },
    data: { team: 'Response Officer/Equipment Custodian' }
  })
  await prisma.guard.updateMany({
    where: { fullName: 'Prah Joshua Kwame' },
    data: { team: '2nd in Command' }
  })

  // ============================================
  // SAMPLE EQUIPMENT - COMMENTED OUT TO CLEAR INVENTORY
  // ============================================
  console.log('Equipment creation skipped - inventory cleared')

  console.log('Seed completed successfully!')
  console.log('===========================================')
  console.log('STAFF LOGIN CREDENTIALS:')
  console.log('===========================================')
  console.log('Security Supervisor:')
  console.log('  Username: supervisor')
  console.log('  Email: supervisor@pcc-vms.vercel.app')
  console.log('  Password: supervisor123')
  console.log('')
  console.log('Equipment Custodian:')
  console.log('  Username: custodian')
  console.log('  Email: custodian@pcc-vms.vercel.app')
  console.log('  Password: custodian123')
  console.log('')
  console.log('Admin (Security Supervisor):')
  console.log('  Username: josh.kwame')
  console.log('  Email: josh.kwame@psec-inv.com')
  console.log('  Password: Admin123')
  console.log('')
  console.log('Custodian (Equipment Custodian):')
  console.log('  Username: mike')
  console.log('  Email: mike@psec-inv.com')
  console.log('  Password: mike@123')
  console.log('=========================================')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
