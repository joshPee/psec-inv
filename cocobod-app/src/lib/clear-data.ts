import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearData() {
  console.log('Starting data cleanup (keeping Guards)...')

  try {
    // Delete in order respecting foreign key constraints
    console.log('Deleting EquipmentIssueItem...')
    await prisma.equipmentIssueItem.deleteMany({})

    console.log('Deleting EquipmentIssue...')
    await prisma.equipmentIssue.deleteMany({})

    console.log('Deleting EquipmentBooking...')
    await prisma.equipmentBooking.deleteMany({})

    console.log('Deleting EquipmentMovement...')
    await prisma.equipmentMovement.deleteMany({})

    console.log('Deleting DamagedEquipmentRecord...')
    await prisma.damagedEquipmentRecord.deleteMany({})

    console.log('Deleting MissingEquipmentRecord...')
    await prisma.missingEquipmentRecord.deleteMany({})

    console.log('Deleting Equipment...')
    await prisma.equipment.deleteMany({})

    console.log('Deleting EquipmentCategory...')
    await prisma.equipmentCategory.deleteMany({})

    console.log('Deleting Notification...')
    await prisma.notification.deleteMany({})

    console.log('Deleting Users...')
    await prisma.user.deleteMany({})

    console.log('✅ Data cleanup complete! Guards have been preserved.')
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearData()
