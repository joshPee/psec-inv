import { prisma } from '@/lib/prisma'
import { ReportsClient } from './ReportsClient'
import { Suspense } from 'react'

async function getReportData(startDate?: string, endDate?: string) {
  const dateFilter: any = {}
  if (startDate && endDate) {
    dateFilter.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    }
  }

  const [equipment, guards, issues, movements, categories] = await Promise.all([
    prisma.equipment.findMany({ include: { category: true } }),
    prisma.guard.findMany(),
    prisma.equipmentIssue.findMany({
      where: dateFilter,
      include: { guard: true, custodian: true }
    }),
    prisma.equipmentMovement.findMany({
      where: dateFilter,
      take: 100
    }),
    prisma.equipmentCategory.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ])

  // Calculate category statistics
  const categoryStats = categories.map(category => {
    const categoryEquipment = equipment.filter(e => e.categoryId === category.id)
    const totalDamaged = categoryEquipment.reduce((sum, e) => sum + e.damagedQuantity, 0)
    const totalMissing = categoryEquipment.reduce((sum, e) => sum + e.missingQuantity, 0)
    const totalIssued = categoryEquipment.reduce((sum, e) => sum + e.issuedQuantity, 0)
    const totalItems = categoryEquipment.reduce((sum, e) => sum + e.totalQuantity, 0)

    return {
      ...category,
      totalItems,
      totalDamaged,
      totalMissing,
      totalIssued,
      damageRate: totalItems > 0 ? ((totalDamaged / totalItems) * 100).toFixed(1) : '0',
      lossRate: totalItems > 0 ? ((totalMissing / totalItems) * 100).toFixed(1) : '0',
      issueRate: totalItems > 0 ? ((totalIssued / totalItems) * 100).toFixed(1) : '0',
    }
  })

  return { equipment, guards, issues, movements, categoryStats }
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const data = await getReportData(resolvedSearchParams.startDate, resolvedSearchParams.endDate)

  return (
    <Suspense fallback={<div>Loading reports...</div>}>
      <ReportsClient
        categoryStats={data.categoryStats}
        initialStartDate={resolvedSearchParams.startDate}
        initialEndDate={resolvedSearchParams.endDate}
      />
    </Suspense>
  )
}
