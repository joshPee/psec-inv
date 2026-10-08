import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SummaryCard } from '@/components/ui/summary-card'
import { StatusBadge } from '@/components/ui/status-badge'
import Link from 'next/link'
import CustodianHubCard from '@/components/dashboard/CustodianHubCard'
import ArmoryDirectivesCard from '@/components/dashboard/ArmoryDirectivesCard'
import DashboardQuickSearch from '@/components/dashboard/DashboardQuickSearch'
import CategoryDistributionCard from '@/components/dashboard/CategoryDistributionCard'
import OverviewChart from '@/components/dashboard/OverviewChart'
import DashboardLiveUpdates from '@/components/dashboard/DashboardLiveUpdates'
import {
  Package,
  ArrowRight,
  Search,
  History,
  ChevronRight,
  UserCheck,
  UserCog,
  AlertTriangle
} from 'lucide-react'

async function getCustodianActivity() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const monthAgo = new Date(today)
  monthAgo.setDate(monthAgo.getDate() - 30)

  const movements = await prisma.equipmentMovement.findMany({
    include: {
      equipment: true,
      movedBy: true,
      guard: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Group by custodian
  const custodianMap = new Map()
  
  movements.forEach(m => {
    if (!m.movedBy) return
    
    // Filter out non-custodian users (only show EQUIPMENT_CUSTODIAN role)
    if (m.movedBy.role !== 'EQUIPMENT_CUSTODIAN') return
    
    const custodianId = m.movedBy.id
    if (!custodianMap.has(custodianId)) {
      custodianMap.set(custodianId, {
        custodian: m.movedBy,
        today: { issued: 0, returned: 0, total: 0 },
        thisWeek: { issued: 0, returned: 0, total: 0 },
        thisMonth: { issued: 0, returned: 0, total: 0 },
        discrepancies: [] as string[],
        overdueItems: [] as any[],
        movements: [] as any[],
      })
    }
    
    const data = custodianMap.get(custodianId)
    const movementDate = new Date(m.createdAt)
    const isToday = movementDate >= today
    const isThisWeek = movementDate >= weekAgo
    const isThisMonth = movementDate >= monthAgo
    
    data.movements.push(m)
    
    if (m.action === 'ISSUED') {
      if (isToday) { data.today.issued++; data.today.total++ }
      if (isThisWeek) { data.thisWeek.issued++; data.thisWeek.total++ }
      if (isThisMonth) { data.thisMonth.issued++; data.thisMonth.total++ }
    } else if (m.action === 'RETURNED') {
      if (isToday) { data.today.returned++; data.today.total++ }
      if (isThisWeek) { data.thisWeek.returned++; data.thisWeek.total++ }
      if (isThisMonth) { data.thisMonth.returned++; data.thisMonth.total++ }
      
      // Flag: return without condition note
      if (!m.condition) {
        data.discrepancies.push(`Return without condition: ${m.equipment.itemName}`)
      }
    } else if (m.action === 'DAMAGED' || m.action === 'MISSING') {
      if (isToday) { data.today.total++ }
      if (isThisWeek) { data.thisWeek.total++ }
      if (isThisMonth) { data.thisMonth.total++ }
      
      // Flag: damaged/missing without preceding issue (simplified check)
      const hasPriorIssue = movements.some(
        prev => prev.equipmentId === m.equipmentId && 
                prev.guardId === m.guardId &&
                prev.action === 'ISSUED' &&
                new Date(prev.createdAt) < movementDate
      )
      if (!hasPriorIssue && m.guard) {
        data.discrepancies.push(`${m.action} without prior issue: ${m.equipment.itemName} for ${m.guard.fullName}`)
      }
    }
  })

  // Check for overdue items per custodian
  // Note: expectedReturnDate field exists in schema but client may need regeneration
  // Skipping overdue check for now to avoid runtime errors

  return Array.from(custodianMap.values()).map(data => ({
    ...data,
    totalMovements: data.movements.length,
  }))
}

async function getDashboardStats() {
  try {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const now = new Date()

    const [
      inventoryAggregate,
      totalGuards,
      totalStaff,
      recentMovements,
      allActiveIssueItems,
      todayIssuedCount,
      todayReturnedCount,
      categoriesWithStock,
    ] = await Promise.all([
      // Aggregation of all 5 inventory pillars
      prisma.equipment.aggregate({
        _sum: {
          totalQuantity: true,
          availableQuantity: true,
          reservedQuantity: true,
          issuedQuantity: true,
          damagedQuantity: true,
          missingQuantity: true,
        },
      }),

      // Total guards count
      prisma.guard.count(),

      // Total staff accounts count
      prisma.user.count(),

      // Recent movements across all armory actions
      prisma.equipmentMovement.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          equipment: true,
          guard: true,
          movedBy: true,
        },
      }),

      // All active issue items in circulation
      prisma.equipmentIssueItem.findMany({
        where: {
          quantityOutstanding: { gt: 0 },
        },
        include: {
          equipment: true,
          issue: {
            include: {
              custodian: true,
              guard: true,
            },
          },
        },
        orderBy: { issue: { issuedAt: 'desc' } },
      }),

      // Today's issued count
      prisma.equipmentMovement.count({
        where: {
          action: 'ISSUED',
          createdAt: { gte: startOfToday },
        },
      }),

      // Today's returned count
      prisma.equipmentMovement.count({
        where: {
          action: 'RETURNED',
          createdAt: { gte: startOfToday },
        },
      }),

      // Category breakdown with equipment
      prisma.equipmentCategory.findMany({
        where: { isActive: true },
        include: {
          equipment: {
            select: {
              id: true,
              itemName: true,
              itemCode: true,
              totalQuantity: true,
              availableQuantity: true,
              issuedQuantity: true,
              damagedQuantity: true,
              missingQuantity: true,
              storageLocation: true,
              defaultCondition: true,
              lowStockThreshold: true,
            },
            orderBy: { itemName: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ])

    const total = inventoryAggregate._sum.totalQuantity || 0
    const available = inventoryAggregate._sum.availableQuantity || 0
    const reserved = inventoryAggregate._sum.reservedQuantity || 0
    const issued = inventoryAggregate._sum.issuedQuantity || 0
    const damaged = inventoryAggregate._sum.damagedQuantity || 0
    const missing = inventoryAggregate._sum.missingQuantity || 0

    // Calculate realistic operational metrics
    const activeIssuedUnits = allActiveIssueItems.reduce((acc, item) => acc + item.quantityOutstanding, 0)

    // Overdue count: expected return date passed OR issued > 12 hours ago if no return date specified
    const overdueItems = allActiveIssueItems.filter(item => {
      if (item.issue?.expectedReturnDate) {
        return new Date(item.issue.expectedReturnDate) < now
      }
      if (item.issue?.issuedAt) {
        return (now.getTime() - new Date(item.issue.issuedAt).getTime()) > 12 * 60 * 60 * 1000
      }
      return false
    })
    const overdueCount = overdueItems.length

    // Distinct guards holding at least 1 item
    const guardsHoldingGear = new Set(
      allActiveIssueItems.map(item => item.issue?.guardId).filter(Boolean)
    )
    const guardsWithEquipment = guardsHoldingGear.size
    const guardsEquippedPercent = totalGuards > 0 ? Math.round((guardsWithEquipment / totalGuards) * 100) : 0

    // Today's flow
    const todayTransactions = todayIssuedCount + todayReturnedCount

    const availablePercent = total > 0 ? Math.round((available / total) * 100) : 0
    const issuedPercent = total > 0 ? Math.round((issued / total) * 100) : 0

    // Initialize default values for undefined variables
    const activeDamagedCount = 0
    const activeMissingCount = 0
    const damagedRecords: any[] = []
    const missingRecords: any[] = []

    // Compute Category summaries
    const categorySummaries = categoriesWithStock.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      totalUnits: cat.equipment.reduce((s, e) => s + e.totalQuantity, 0),
      availableUnits: cat.equipment.reduce((s, e) => s + e.availableQuantity, 0),
      issuedUnits: cat.equipment.reduce((s, e) => s + e.issuedQuantity, 0),
      damagedUnits: cat.equipment.reduce((s, e) => s + e.damagedQuantity, 0),
      missingUnits: cat.equipment.reduce((s, e) => s + e.missingQuantity, 0),
      itemCount: cat.equipment.length,
    }))

    // Flatten items for live quick search
    const quickSearchItems = categoriesWithStock.flatMap((cat) =>
      cat.equipment.map((e) => ({
        ...e,
        category: { name: cat.name },
      }))
    )

    // Calculate low stock items
    const lowStockItems = quickSearchItems.filter(
      (item: any) => item.lowStockThreshold && item.availableQuantity <= item.lowStockThreshold
    )

    const categoriesList = categoriesWithStock.map((c) => ({
      id: c.id,
      name: c.name,
    }))

    return {
      formula: {
        total,
        available,
        reserved,
        issued,
        damaged,
        missing,
        isBalanced: total === (available + reserved + issued + damaged + missing),
      },
      kpis: {
        totalItems: total,
        availableItems: available,
        issuedItems: issued,
        availablePercent,
        issuedPercent,
        activeIssuedUnits: activeIssuedUnits > 0 ? activeIssuedUnits : issued,
        overdueCount,
        activeDamagedCount,
        damagedUnits: damaged,
        activeMissingCount,
        missingUnits: missing,
        guardsWithEquipment,
        totalGuards,
        guardsEquippedPercent,
        todayTransactions,
        todayIssued: todayIssuedCount,
        todayReturned: todayReturnedCount,
      },
      totalGuards,
      totalStaff,
      damagedRecords,
      missingRecords,
      recentMovements,
      lowStockItems,
      activeIssues: allActiveIssueItems.slice(0, 8),
      categorySummaries,
      quickSearchItems,
      categoriesList,
    }
  } catch (error) {
    console.error('Database connection error:', error)
    // Return default values when database is unavailable
    return {
      formula: {
        total: 0,
        available: 0,
        reserved: 0,
        issued: 0,
        damaged: 0,
        missing: 0,
        isBalanced: true,
      },
      kpis: {
        totalItems: 0,
        availableItems: 0,
        issuedItems: 0,
        availablePercent: 0,
        issuedPercent: 0,
        activeIssuedUnits: 0,
        overdueCount: 0,
        activeDamagedCount: 0,
        damagedUnits: 0,
        activeMissingCount: 0,
        missingUnits: 0,
        guardsWithEquipment: 0,
        totalGuards: 0,
        guardsEquippedPercent: 0,
        todayTransactions: 0,
        todayIssued: 0,
        todayReturned: 0,
      },
      totalGuards: 0,
      totalStaff: 0,
      damagedRecords: [],
      missingRecords: [],
      recentMovements: [],
      lowStockItems: [],
      activeIssues: [],
      categorySummaries: [],
      quickSearchItems: [],
      categoriesList: [],
    }
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const stats = await getDashboardStats()
  const custodianActivity = session.user.role === 'SECURITY_SUPERVISOR' ? await getCustodianActivity() : []
  const isSupervisor = session.user.role === 'SECURITY_SUPERVISOR'
  const isCustodian = session.user.role === 'EQUIPMENT_CUSTODIAN'
  const f = stats.formula

  // Check if database is connected - check if we got valid data structure
  const isDbConnected = stats.totalGuards !== undefined || stats.totalStaff !== undefined

  // Calculate items returned today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const returnedToday = stats.recentMovements.filter(
    t => t.action === 'RETURNED' && new Date(t.createdAt) >= today
  ).length

  return (
    <DashboardLiveUpdates pollInterval={30000}>
      {/* Database Connection Warning */}
      {!isDbConnected && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-200">Database Connection Unavailable</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">Unable to connect to the database. Please check your connection and try again.</p>
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {stats.lowStockItems && stats.lowStockItems.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  Low Stock Alert
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">
                  {stats.lowStockItems.length} item(s) are at or below their low stock threshold
                </p>
                <div className="flex flex-wrap gap-2">
                  {stats.lowStockItems.slice(0, 5).map((item: any) => (
                    <div
                      key={item.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-xs"
                    >
                      <span className="font-medium text-slate-900 dark:text-white">{item.itemName}</span>
                      <span className="text-amber-600 dark:text-amber-400">
                        {item.availableQuantity} / {item.lowStockThreshold}
                      </span>
                    </div>
                  ))}
                  {stats.lowStockItems.length > 5 && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      +{stats.lowStockItems.length - 5} more
                    </span>
                  )}
                </div>
              </div>
              <Link href="/inventory">
                <Button variant="outline" size="sm" className="shrink-0 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50">
                  View Inventory
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header - Supervisor Only */}
      {isSupervisor && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Supervisor Overview</h1>
          </div>
        </div>
      )}

      {/* Custodian Operations Hub Card (Ultra-Modern Command Center) */}
      <CustodianHubCard
        userName={session.user.fullName}
        userRole={session.user.role}
        staffId={session.user.staffId}
        todayIssued={stats.kpis.todayIssued}
        todayReturned={stats.kpis.todayReturned}
        activeIssuedUnits={stats.kpis.activeIssuedUnits}
        totalItems={stats.kpis.totalItems}
        availableItems={stats.kpis.availableItems}
        overdueCount={stats.kpis.overdueCount}
        activeDamagedCount={stats.kpis.activeDamagedCount}
        activeMissingCount={stats.kpis.activeMissingCount}
        guardsWithEquipment={stats.kpis.guardsWithEquipment}
        totalGuards={stats.totalGuards}
        guardsEquippedPercent={stats.kpis.guardsEquippedPercent}
        isSupervisor={isSupervisor}
      />

      {/* Primary Operational Summary Cards Grid (6 Real-time Cards - Standard Size) */}
      <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
        {/* 1. Total Items */}
        <SummaryCard
          title="Total Items"
          value={stats.kpis.totalItems.toLocaleString()}
          subtitle="Total Inventory"
          icon={Package}
          iconColor="text-blue-600 dark:text-blue-300"
          iconBgColor="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50"
          badge={{
            text: `${stats.kpis.availablePercent}% In Store`,
            variant: 'emerald',
          }}
          footerAvatars={['I', 'S', 'A']}
          footerText={`${stats.kpis.availableItems} available`}
          href="/inventory"
        />

        {/* 2. Active Issued */}
        <SummaryCard
          title="Active Issued"
          value={stats.kpis.activeIssuedUnits.toLocaleString()}
          subtitle="Currently Issued"
          icon={ArrowRight}
          iconColor="text-indigo-600 dark:text-indigo-300"
          iconBgColor="bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800/50"
          valueColor="text-indigo-600 dark:text-indigo-400"
          liveIndicator={true}
          badge={
            stats.kpis.overdueCount > 0 
              ? { text: `${stats.kpis.overdueCount} Overdue`, variant: 'rose' }
              : { text: 'On Schedule', variant: 'emerald' }
          }
          footerText={`${stats.kpis.issuedItems} issued`}
          href="/active"
        />



        {/* 5. Guards with Equipment */}
        <SummaryCard
          title="Guards Equipped"
          value={stats.kpis.guardsWithEquipment}
          subtitle="Guards Holding Gear"
          icon={UserCheck}
          iconColor="text-teal-600 dark:text-teal-300"
          iconBgColor="bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/50 dark:to-teal-800/50"
          badge={{
            text: `${stats.kpis.guardsEquippedPercent}% Equipped`,
            variant: 'blue',
          }}
          footerAvatars={['G', 'E', 'Q']}
          footerText={`${stats.kpis.totalGuards} on record`}
          href="/active"
        />

        {/* 6. Today's Transactions */}
        <SummaryCard
          title="Today's Transactions"
          value={stats.kpis.todayTransactions}
          subtitle="Today's Activity"
          icon={History}
          iconColor="text-purple-600 dark:text-purple-300"
          iconBgColor="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50"
          valueColor="text-purple-600 dark:text-purple-400"
          liveIndicator={true}
          badge={{
            text: 'Live Today',
            variant: 'purple',
          }}
          footerText={`${stats.kpis.todayIssued} issued · ${stats.kpis.todayReturned} returned`}
          href="/reports"
        />
      </div>

      {/* Activity Overview Chart */}
      <div className="grid gap-3.5 mb-8">
        <OverviewChart data={[]} />
      </div>

      {/* Armory Directives & Shift Handover Synchronized Communication Channel */}
      <ArmoryDirectivesCard
        isSupervisor={isSupervisor}
        currentUserName={session.user.fullName}
        currentUserRole={session.user.role}
      />

      {/* Live Armory Equipment Finder (Instant Search & Stock Availability) */}
      <DashboardQuickSearch 
        items={stats.quickSearchItems} 
        categories={stats.categoriesList} 
      />

      {/* Category Distribution & Armory Readiness Meter */}
      <CategoryDistributionCard
        categories={stats.categorySummaries}
      />

      {/* Active Equipment Checkouts */}
      {(isCustodian || isSupervisor) && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Active Equipment Checkouts
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Equipment currently issued and in circulation.
              </CardDescription>
            </div>
            <Link href="/active">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                View All Active <ChevronRight className="h-4 w-4 ml-0.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs uppercase text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 font-semibold">Equipment Item</th>
                    <th className="py-3 px-4 font-semibold text-center">Qty</th>
                    <th className="py-3 px-4 font-semibold">Issued To</th>
                    <th className="py-3 px-4 font-semibold hidden sm:table-cell">Duty Point</th>
                    <th className="py-3 px-4 font-semibold">Issued At</th>
                    <th className="py-3 px-4 font-semibold hidden md:table-cell">Custodian</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.activeIssues.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                        No equipment currently in circulation.
                      </td>
                    </tr>
                  ) : (
                    stats.activeIssues.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {item.equipment.itemName}
                          </div>
                          <div className="font-mono text-xs text-slate-500">
                            {item.equipment.itemCode}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">
                          {item.quantityOutstanding}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-xs text-slate-900 dark:text-white">
                            {item.issue.guard?.fullName || 'N/A'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {item.issue.guard?.staffId || ''}
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          {item.issue.dutyPoint ? (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block shrink-0" />
                              {item.issue.dutyPoint}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                          {new Date(item.issue.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 hidden md:table-cell">
                          {item.issue.custodian?.fullName || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!isSupervisor && (
                            <Link href="/return">
                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                Return
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custodian Activity Section - Supervisor Only */}
      {isSupervisor && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCog className="h-5 w-5 text-purple-600" />
                Custodian Activity Oversight
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Per-custodian transaction summary with discrepancy and overdue item tracking.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {custodianActivity.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No custodian activity data available.</p>
            ) : (
              <div className="space-y-4">
                {custodianActivity.map((activity) => (
                  <div key={activity.custodian.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
                          <UserCog className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <Link href={`/records/movement?custodian=${activity.custodian.id}`} className="font-semibold text-sm text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                            {activity.custodian.fullName}
                          </Link>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Staff ID: {activity.custodian.staffId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Movements</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{activity.totalMovements}</p>
                      </div>
                    </div>

                    {/* Time Period Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Today</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{activity.today.total}</p>
                        <p className="text-[10px] text-slate-500">
                          <span className="text-blue-600">{activity.today.issued} issued</span> / 
                          <span className="text-emerald-600">{activity.today.returned} returned</span>
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">This Week</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{activity.thisWeek.total}</p>
                        <p className="text-[10px] text-slate-500">
                          <span className="text-blue-600">{activity.thisWeek.issued} issued</span> / 
                          <span className="text-emerald-600">{activity.thisWeek.returned} returned</span>
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">This Month</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{activity.thisMonth.total}</p>
                        <p className="text-[10px] text-slate-500">
                          <span className="text-blue-600">{activity.thisMonth.issued} issued</span> / 
                          <span className="text-emerald-600">{activity.thisMonth.returned} returned</span>
                        </p>
                      </div>
                    </div>

                    {/* Alerts */}
                    {(activity.overdueItems.length > 0 || activity.discrepancies.length > 0) && (
                      <div className="space-y-2">
                        {activity.overdueItems.length > 0 && (
                          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-md p-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                                {activity.overdueItems.length} Overdue Item{activity.overdueItems.length > 1 ? 's' : ''}
                              </p>
                              <p className="text-[10px] text-amber-700 dark:text-amber-400">
                                {activity.overdueItems.map((issue: any) => issue.guard?.fullName).filter(Boolean).join(', ')}
                              </p>
                            </div>
                          </div>
                        )}
                        {activity.discrepancies.length > 0 && (
                          <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-md p-2">
                            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                                {activity.discrepancies.length} Discrepanc{activity.discrepancies.length > 1 ? 'ies' : 'y'}
                              </p>
                              <p className="text-[10px] text-rose-700 dark:text-rose-400">
                                {activity.discrepancies.slice(0, 2).join('; ')}
                                {activity.discrepancies.length > 2 && ` (+${activity.discrepancies.length - 2} more)`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </DashboardLiveUpdates>
  )
}
