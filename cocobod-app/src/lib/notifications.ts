import { prisma } from '@/lib/prisma'

export type NotificationType = 
  | 'LOW_STOCK' 
  | 'DAMAGED' 
  | 'MISSING' 
  | 'ISSUE' 
  | 'RETURN' 
  | 'SYSTEM' 
  | 'DIRECTIVE' 
  | 'HANDOVER'

export async function createNotification(
  userId: string,
  type: NotificationType | string,
  title: string,
  message: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
      }
    })
  } catch (error) {
    console.error('Error creating notification:', error)
  }
}

export async function notifyLowStock(equipmentName: string, currentStock: number) {
  // Notify all security supervisors and custodians
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ['SECURITY_SUPERVISOR', 'EQUIPMENT_CUSTODIAN']
      }
    }
  })

  for (const user of users) {
    await createNotification(
      user.id,
      'LOW_STOCK',
      'Low Stock Alert',
      `${equipmentName} is running low on stock. Current quantity: ${currentStock}`
    )
  }
}

export async function notifyBookingRequest(guardName: string, equipmentName: string, quantity: number) {
  // Notify all custodians
  const users = await prisma.user.findMany({
    where: {
      role: 'EQUIPMENT_CUSTODIAN'
    }
  })

  for (const user of users) {
    await createNotification(
      user.id,
      'SYSTEM',
      'New Booking Request',
      `${guardName} has requested ${quantity}x ${equipmentName}`
    )
  }
}

export async function notifyDamagedRecord(equipmentName: string, guardName: string, quantity: number) {
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ['SECURITY_SUPERVISOR', 'EQUIPMENT_CUSTODIAN']
      }
    }
  })

  for (const user of users) {
    await createNotification(
      user.id,
      'DAMAGED',
      'Equipment Damaged',
      `${quantity}x ${equipmentName} was reported damaged by ${guardName}`
    )
  }
}

export async function notifyMissingRecord(equipmentName: string, guardName: string, quantity: number) {
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ['SECURITY_SUPERVISOR', 'EQUIPMENT_CUSTODIAN']
      }
    }
  })

  for (const user of users) {
    await createNotification(
      user.id,
      'MISSING',
      'Equipment Missing',
      `${quantity}x ${equipmentName} was reported missing by ${guardName}`
    )
  }
}

export async function notifyIssue(guardName: string, equipmentName: string, quantity: number) {
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ['SECURITY_SUPERVISOR', 'EQUIPMENT_CUSTODIAN']
      }
    }
  })

  for (const user of users) {
    await createNotification(
      user.id,
      'ISSUE',
      'Equipment Issued',
      `${quantity}x ${equipmentName} was issued to ${guardName}`
    )
  }
}

export async function notifyReturn(guardName: string, equipmentName: string, quantity: number) {
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ['SECURITY_SUPERVISOR', 'EQUIPMENT_CUSTODIAN']
      }
    }
  })

  for (const user of users) {
    await createNotification(
      user.id,
      'RETURN',
      'Equipment Returned',
      `${quantity}x ${equipmentName} was returned by ${guardName}`
    )
  }
}

export async function notifyBookingExpired(guardName: string, equipmentName: string, quantity: number) {
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ['SECURITY_SUPERVISOR', 'EQUIPMENT_CUSTODIAN']
      }
    }
  })

  for (const user of users) {
    await createNotification(
      user.id,
      'SYSTEM',
      'Booking Expired',
      `Booking for ${quantity}x ${equipmentName} by ${guardName} has expired`
    )
  }
}

export async function notifyDirective(
  supervisorName: string,
  title: string,
  priority: string,
  message: string
) {
  const custodians = await prisma.user.findMany({
    where: { role: 'EQUIPMENT_CUSTODIAN', isActive: true }
  })

  for (const custodian of custodians) {
    await createNotification(
      custodian.id,
      'DIRECTIVE',
      `[${priority}] Directive: ${title}`,
      `Supervisor ${supervisorName}: ${message}`
    )
  }
}

export async function notifyHandover(
  custodianName: string,
  shift: string,
  summary: string
) {
  const supervisors = await prisma.user.findMany({
    where: { role: 'SECURITY_SUPERVISOR', isActive: true }
  })

  for (const supervisor of supervisors) {
    await createNotification(
      supervisor.id,
      'HANDOVER',
      `Shift Handover Log (${shift})`,
      `Custodian ${custodianName} logged: ${summary}`
    )
  }
}

export async function notifyRecordResolved(
  recordType: 'Damaged' | 'Missing',
  equipmentName: string,
  resolvedBy: string,
  status: string,
  restoredStock: boolean
) {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ['SECURITY_SUPERVISOR', 'EQUIPMENT_CUSTODIAN'] },
      isActive: true,
    }
  })

  for (const user of users) {
    await createNotification(
      user.id,
      'SYSTEM',
      `${recordType} Record ${status}`,
      `${equipmentName} marked as ${status} by ${resolvedBy}.${restoredStock ? ' Units restored to available stock.' : ''}`
    )
  }
}