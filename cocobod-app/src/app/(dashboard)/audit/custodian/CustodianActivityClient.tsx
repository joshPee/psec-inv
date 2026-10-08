'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldCheck, TrendingUp, RotateCcw, Calendar, Search, Activity, ChevronDown, ChevronUp, Monitor } from 'lucide-react'

interface Movement {
  id: string
  action: string
  quantity: number
  createdAt: string
  equipment: { itemName: string; itemCode: string }
  guard: { fullName: string; badgeId: string } | null
  dutyPoint: string | null
  remarks: string | null
}

interface CustodianData {
  id: string
  fullName: string
  staffId: string
  username: string
  stats: {
    issuesIssued: number
    returnsProcessed: number
    bookingsFulfilled: number
  }
  recentMovements: Movement[]
}

export default function CustodianActivityClient({ activityData }: { activityData: CustodianData[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCustodians, setExpandedCustodians] = useState<Set<string>>(new Set())

  const filteredData = activityData.filter(custodian =>
    custodian.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    custodian.staffId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    custodian.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function toggleExpand(custodianId: string) {
    const newExpanded = new Set(expandedCustodians)
    if (newExpanded.has(custodianId)) {
      newExpanded.delete(custodianId)
    } else {
      newExpanded.add(custodianId)
    }
    setExpandedCustodians(newExpanded)
  }

  function getActionColor(action: string) {
    switch (action) {
      case 'ISSUED': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
      case 'RETURNED': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
      case 'BOOKED': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300'
      case 'DAMAGED': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
      case 'MISSING': return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const totalIssuesIssued = activityData.reduce((sum, c) => sum + c.stats.issuesIssued, 0)
  const totalReturnsProcessed = activityData.reduce((sum, c) => sum + c.stats.returnsProcessed, 0)
  const totalBookingsFulfilled = activityData.reduce((sum, c) => sum + c.stats.bookingsFulfilled, 0)

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(167, 139, 250, 0.2) 0%, transparent 60%)' }} />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/30 text-violet-200 border border-violet-400/30">
                Audit Operations
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
              <Monitor className="h-7 w-7 text-violet-400" />
              Custodian Activity Monitor
            </h1>
            <p className="text-sm text-slate-300 mt-1">Real-time oversight of custodian operations</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Issues Today</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalIssuesIssued}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Returns Today</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalReturnsProcessed}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <RotateCcw className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Bookings Fulfilled Today</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalBookingsFulfilled}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search by name, staff ID, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Custodian Cards */}
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400">
            No custodians found
          </div>
        ) : (
          filteredData.map((custodian) => (
            <Card 
              key={custodian.id} 
              className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                        {custodian.fullName}
                      </CardTitle>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {custodian.staffId || custodian.username}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(custodian.id)}
                    className="dark:hover:bg-slate-800"
                  >
                    {expandedCustodians.has(custodian.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{custodian.stats.issuesIssued}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Issues</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{custodian.stats.returnsProcessed}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Returns</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{custodian.stats.bookingsFulfilled}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bookings</p>
                  </div>
                </div>

                {expandedCustodians.has(custodian.id) && (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Recent Movements
                    </h4>
                    {custodian.recentMovements.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
                    ) : (
                      <div className="space-y-2">
                        {custodian.recentMovements.map((movement) => (
                          <div key={movement.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getActionColor(movement.action)}`}>
                                  {movement.action}
                                </span>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                  {movement.equipment.itemName}
                                </p>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                <span>Qty: {movement.quantity}</span>
                                <span>Guard: {movement.guard?.fullName || 'N/A'}</span>
                                {movement.dutyPoint && <span>Duty: {movement.dutyPoint}</span>}
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(movement.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
