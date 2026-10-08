import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing all data from database...')

  // Delete in order of dependencies (child tables first)
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

  console.log('All data cleared successfully!')
}

main()
  .catch((e) => {
    console.error('Error clearing data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
