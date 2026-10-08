import { prisma } from '@/lib/prisma'
import CustodianActivityClient from './CustodianActivityClient'

async function getCustodianActivity() {
  try {
    const custodians = await prisma.user.findMany({
      where: { role: 'EQUIPMENT_CUSTODIAN', isActive: true },
      select: {
        id: true,
        fullName: true,
        staffId: true,
        username: true,
      },
      orderBy: { fullName: 'asc' },
    })

    // Get activity data for each custodian
    const activityData = await Promise.all(
      custodians.map(async (custodian) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const [issuesIssued, returnsProcessed, bookingsFulfilled, movements] = await Promise.all([
          prisma.equipmentIssue.count({
            where: {
              custodianId: custodian.id,
              issuedAt: { gte: today },
            },
          }),
          prisma.equipmentIssueItem.count({
            where: {
              issue: { custodianId: custodian.id },
              returnedAt: { gte: today },
            },
          }),
          prisma.equipmentBooking.count({
            where: {
              decidedById: custodian.id,
              status: 'FULFILLED',
              decidedAt: { gte: today },
            },
          }),
          prisma.equipmentMovement.findMany({
            where: {
              movedById: custodian.id,
              createdAt: { gte: today },
            },
            include: {
              equipment: { select: { itemName: true, itemCode: true } },
              guard: { select: { fullName: true, badgeId: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          }),
        ])

        return {
          ...custodian,
          stats: {
            issuesIssued,
            returnsProcessed,
            bookingsFulfilled,
          },
          recentMovements: movements.map(m => ({
            ...m,
            createdAt: m.createdAt.toISOString(),
          })),
        }
      })
    )

    return activityData
  } catch (error) {
    console.error('Database connection error:', error)
    return []
  }
}

export default async function CustodianActivityPage() {
  const activityData = await getCustodianActivity()

  return (
    <CustodianActivityClient 
      activityData={activityData}
    />
  )
}
