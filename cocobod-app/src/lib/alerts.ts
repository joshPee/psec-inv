import { prisma } from '@/lib/prisma'
import { createNotification } from './notifications'

export async function checkLowStockAlerts() {
  try {
    const categories = await prisma.equipmentCategory.findMany({
      where: { isActive: true },
      include: {
        equipment: true
      }
    })

    const supervisors = await prisma.user.findMany({
      where: {
        role: 'SECURITY_SUPERVISOR',
        isActive: true
      }
    })

    for (const category of categories) {
      const totalAvailable = category.equipment.reduce((sum, eq) => sum + eq.availableQuantity, 0)
      
      if (totalAvailable <= category.lowStockThreshold) {
        // Create notification for all supervisors
        for (const supervisor of supervisors) {
          await createNotification(
            supervisor.id,
            'LOW_STOCK',
            'Low Stock Alert',
            `Category "${category.name}" is running low on stock. Available: ${totalAvailable} (Threshold: ${category.lowStockThreshold})`
          )
        }
      }
    }
  } catch (error) {
    console.error('Error checking low stock alerts:', error)
  }
}
