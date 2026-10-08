import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetDatabase() {
  console.log('Starting database reset...')
  
  try {
    // Delete all records in order of dependencies
    await prisma.damagedEquipmentRecord.deleteMany()
    console.log('✓ Deleted damaged equipment records')
    
    await prisma.missingEquipmentRecord.deleteMany()
    console.log('✓ Deleted missing equipment records')
    
    await prisma.equipmentMovement.deleteMany()
    console.log('✓ Deleted equipment movements')
    
    await prisma.equipmentIssueItem.deleteMany()
    console.log('✓ Deleted equipment issue items')
    
    await prisma.equipmentIssue.deleteMany()
    console.log('✓ Deleted equipment issues')
    
    await prisma.equipment.deleteMany()
    console.log('✓ Deleted equipment')
    
    await prisma.equipmentCategory.deleteMany()
    console.log('✓ Deleted equipment categories')
    
    await prisma.guard.deleteMany()
    console.log('✓ Deleted guards')
    
    await prisma.notification.deleteMany()
    console.log('✓ Deleted notifications')
    
    // Keep users (admin accounts) but reset if needed
    // await prisma.user.deleteMany()
    // console.log('✓ Deleted users')
    
    console.log('\n✅ Database reset completed successfully!')
    console.log('Note: User accounts were preserved. To reset users, uncomment the user deletion line.')
  } catch (error) {
    console.error('❌ Error resetting database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
