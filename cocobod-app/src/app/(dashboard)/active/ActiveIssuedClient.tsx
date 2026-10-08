'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, ArrowLeft, Search, Shield, Package, Clock, CheckCircle2, RotateCcw, AlertTriangle, CalendarClock, Filter } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { StatusBadge } from '@/components/ui/status-badge'

interface ActiveIssuedClientProps {
  activeItems: any[]
  userRole: string
}

// Shift boundary definitions (can be customized based on organization)
const DAY_SHIFT_START = 6 // 6 AM
const DAY_SHIFT_END = 18 // 6 PM
const NIGHT_SHIFT_START = 18 // 6 PM
const NIGHT_SHIFT_END = 6 // 6 AM (next day)

// Time-based overdue threshold in hours (configurable)
const OVERDUE_THRESHOLD_HOURS = 12

function getCurrentShift(): 'DAY' | 'NIGHT' {
  const hour = new Date().getHours()
  return hour >= DAY_SHIFT_START && hour < DAY_SHIFT_END ? 'DAY' : 'NIGHT'
}

function isShiftOverdue(item: any): boolean {
  const issueShift = item.issue?.shift
  const issuedAt = new Date(item.issue?.issuedAt)
  const currentHour = new Date().getHours()

  if (!issueShift) return false

  // If issued on DAY shift and current time is NIGHT shift, it's overdue
  if (issueShift === 'DAY' && currentHour >= NIGHT_SHIFT_START) {
    return true
  }

  // If issued on NIGHT shift and current time is DAY shift, it's overdue
  if (issueShift === 'NIGHT' && currentHour >= DAY_SHIFT_START && currentHour < DAY_SHIFT_END) {
    // Only if it was issued on the previous night (not today's night shift)
    const issuedHour = issuedAt.getHours()
    if (issuedHour >= NIGHT_SHIFT_START) {
      // Issued last night, now it's day - overdue
      return true
    }
  }

  return false
}

function isTimeOverdue(item: any): boolean {
  const issuedAt = new Date(item.issue?.issuedAt)
  const now = new Date()
  const hoursSinceIssue = (now.getTime() - issuedAt.getTime()) / (1000 * 60 * 60)

  // Check if past expected return date if set
  if (item.issue?.expectedReturnDate) {
    const expectedReturn = new Date(item.issue.expectedReturnDate)
    if (now > expectedReturn) {
      return true
    }
  }

  // Otherwise, use time threshold
  return hoursSinceIssue > OVERDUE_THRESHOLD_HOURS
}

function isOverdue(item: any): boolean {
  // Item is overdue if either shift-based or time-based check is true
  return isShiftOverdue(item) || isTimeOverdue(item)
}

export default function ActiveIssuedClient({ activeItems, userRole }: ActiveIssuedClientProps) {
  const { toast } = useToast()
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false)
  const [selectedItemForReturn, setSelectedItemForReturn] = useState<any>(null)
  const [localActiveItems, setLocalActiveItems] = useState(activeItems)
  const [searchQuery, setSearchQuery] = useState('')
  const [shiftFilter, setShiftFilter] = useState<'ALL' | 'DAY' | 'NIGHT'>('ALL')
  const [showShiftHandover, setShowShiftHandover] = useState(false)
  const [showOverdueOnly, setShowOverdueOnly] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'previous-shift'>('all')
  const isCustodian = userRole === 'EQUIPMENT_CUSTODIAN'
  const isSupervisor = userRole === 'SECURITY_SUPERVISOR'

  async function returnEquipment(formData: FormData) {
    const itemId = formData.get('itemId') as string
    const quantityReturned = parseInt(formData.get('quantityReturned') as string)
    const condition = formData.get('condition') as string
    const remarks = formData.get('remarks') as string

    try {
      const response = await fetch('/api/equipment/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueItemId: itemId, quantityReturned, condition, remarks }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to return equipment')
        return
      }

      // Refresh the list
      const refreshedResponse = await fetch('/api/equipment/issue')
      const refreshedData = await refreshedResponse.json()
      
      if (Array.isArray(refreshedData)) {
        const enrichedItems = await Promise.all(
          refreshedData.flatMap((issue: any) =>
            issue.items.map(async (item: any) => {
              const equipment = await fetch(`/api/equipment`).then(res => res.json())
              const eq = equipment.find((e: any) => e.id === item.equipmentId)
              return {
                ...item,
                equipment: eq,
                issue: issue,
              }
            })
          )
        )
        setLocalActiveItems(enrichedItems.filter((item: any) => item.quantityOutstanding > 0))
      }

      toast.success('Equipment returned successfully.')
      setIsReturnDialogOpen(false)
      setSelectedItemForReturn(null)
    } catch (error) {
      toast.error('An error occurred while returning equipment')
    }
  }

  function openReturnDialog(itemId: string) {
    setSelectedItemForReturn(localActiveItems.find(i => i.id === itemId))
    setIsReturnDialogOpen(true)
  }

  const stats = useMemo(() => {
    const totalLines = localActiveItems.length
    const totalOutstandingUnits = localActiveItems.reduce((sum, item) => sum + (item.quantityOutstanding || 0), 0)
    const partiallyReturnedCount = localActiveItems.filter(
      item => item.quantityOutstanding < item.quantityIssued
    ).length

    const currentShift = getCurrentShift()
    const shiftOverdueCount = localActiveItems.filter(item => {
      const issueShift = item.issue?.shift
      if (!issueShift) return false
      return issueShift !== currentShift
    }).length

    const overdueCount = localActiveItems.filter(item => isOverdue(item)).length

    return { totalLines, totalOutstandingUnits, partiallyReturnedCount, shiftOverdueCount, overdueCount, currentShift }
  }, [localActiveItems])

  const filteredItems = useMemo(() => {
    let items = localActiveItems

    // Apply tab-based filters
    if (activeTab === 'overdue') {
      items = items.filter(item => isOverdue(item))
    } else if (activeTab === 'previous-shift') {
      const currentShift = getCurrentShift()
      items = items.filter(item => item.issue?.shift && item.issue?.shift !== currentShift)
    }

    // Apply shift filter
    if (shiftFilter !== 'ALL') {
      items = items.filter(item => item.issue?.shift === shiftFilter)
    }

    // Apply shift handover filter (show only items from previous shift)
    if (showShiftHandover) {
      const currentShift = getCurrentShift()
      items = items.filter(item => item.issue?.shift && item.issue?.shift !== currentShift)
    }

    // Apply overdue filter
    if (showOverdueOnly) {
      items = items.filter(item => isOverdue(item))
    }

    // Apply search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter((item) => {
        const guardName = item.issue?.guard?.fullName || ''
        const guardId = item.issue?.guard?.staffId || ''
        const itemName = item.equipment?.itemName || ''
        const itemCode = item.equipment?.itemCode || ''
        const dutyPoint = item.issue?.dutyPoint || ''
        return (
          guardName.toLowerCase().includes(q) ||
          guardId.toLowerCase().includes(q) ||
          itemName.toLowerCase().includes(q) ||
          itemCode.toLowerCase().includes(q) ||
          dutyPoint.toLowerCase().includes(q)
        )
      })
    }

    return items
  }, [localActiveItems, searchQuery, shiftFilter, showShiftHandover, showOverdueOnly, activeTab])

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs font-semibold mb-3 border border-white/20">
              <Shield className="h-3.5 w-3.5" />
              <span>Custody Tracking</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Active Issued Items
            </h1>
            <p className="mt-1 text-sm md:text-base text-blue-100/90 max-w-xl">
              Real-time oversight of security equipment currently assigned and deployed across duty posts.
            </p>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-950/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Overview Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Issued Assignments
            </span>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalLines}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              active assignments
            </span>
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl" />
        </div>

        <div className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Units Deployed
            </span>
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalOutstandingUnits}
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              units in field
            </span>
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl" />
        </div>

        <div className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Partially Returned
            </span>
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.partiallyReturnedCount}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              in progress
            </span>
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-xl" />
        </div>

        <div className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Overdue Items
            </span>
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.overdueCount}
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              need attention
            </span>
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-xl" />
        </div>

        <div className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Current Shift
            </span>
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CalendarClock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.currentShift}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              active shift
            </span>
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-xl" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          onClick={() => {
            setActiveTab('all')
            setShowOverdueOnly(false)
            setShowShiftHandover(false)
          }}
          className="dark:border-slate-700"
        >
          <Package className="h-4 w-4 mr-2" />
          All Items
          <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            {stats.totalLines}
          </span>
        </Button>
        <Button
          variant={activeTab === 'overdue' ? 'default' : 'outline'}
          onClick={() => {
            setActiveTab('overdue')
            setShowOverdueOnly(true)
            setShowShiftHandover(false)
          }}
          className={`dark:border-slate-700 ${activeTab === 'overdue' ? 'bg-rose-600 hover:bg-rose-700' : ''}`}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Overdue
          <span className="ml-2 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {stats.overdueCount}
          </span>
        </Button>
        <Button
          variant={activeTab === 'previous-shift' ? 'default' : 'outline'}
          onClick={() => {
            setActiveTab('previous-shift')
            setShowShiftHandover(true)
            setShowOverdueOnly(false)
          }}
          className={`dark:border-slate-700 ${activeTab === 'previous-shift' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
        >
          <CalendarClock className="h-4 w-4 mr-2" />
          Previous Shift
          <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            {stats.shiftOverdueCount}
          </span>
        </Button>
      </div>

      {/* Overdue Alert */}
      {stats.overdueCount > 0 && (
        <div className="relative overflow-hidden rounded-xl border border-rose-200/80 dark:border-rose-800/80 bg-rose-50/80 dark:bg-rose-950/40 backdrop-blur-sm p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                  {stats.overdueCount} overdue item(s)
                </p>
                <p className="text-xs text-rose-700 dark:text-rose-400">
                  Equipment past expected return time or shift boundary
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              className={`border-rose-300 dark:border-rose-700 text-xs ${
                showOverdueOnly ? 'bg-rose-200 dark:bg-rose-900' : ''
              }`}
            >
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              {showOverdueOnly ? 'Show All' : 'View Only'}
            </Button>
          </div>
        </div>
      )}

      {/* Shift Handover Alert */}
      {stats.shiftOverdueCount > 0 && (
        <div className="relative overflow-hidden rounded-xl border border-amber-200/80 dark:border-amber-800/80 bg-amber-50/80 dark:bg-amber-950/40 backdrop-blur-sm p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  {stats.shiftOverdueCount} items from previous shift
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Equipment issued during {stats.currentShift === 'DAY' ? 'night' : 'day'} shift not yet returned
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShiftHandover(!showShiftHandover)}
              className={`border-amber-300 dark:border-amber-700 text-xs ${
                showShiftHandover ? 'bg-amber-200 dark:bg-amber-900' : ''
              }`}
            >
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              {showShiftHandover ? 'Show All' : 'View Only'}
            </Button>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Filter by guard name, staff ID, item name, code, or duty point..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white rounded-lg text-sm"
              />
            </div>
            <Select value={shiftFilter} onValueChange={(value: any) => setShiftFilter(value)}>
              <SelectTrigger className="w-[140px] border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white rounded-lg text-sm">
                <SelectValue placeholder="Shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Shifts</SelectItem>
                <SelectItem value="DAY">Day Shift</SelectItem>
                <SelectItem value="NIGHT">Night Shift</SelectItem>
              </SelectContent>
            </Select>
            {(searchQuery || shiftFilter !== 'ALL' || showShiftHandover || showOverdueOnly || activeTab !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setShiftFilter('ALL')
                  setShowShiftHandover(false)
                  setShowOverdueOnly(false)
                  setActiveTab('all')
                }}
                className="border-slate-200 dark:border-slate-700 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Equipment Table Card */}
      <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Currently Deployed Equipment
            </CardTitle>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              {filteredItems.length} active
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center">
              <div className="inline-flex p-4 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mb-3 ring-8 ring-blue-50/50 dark:ring-blue-950/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">No active issued equipment</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery || shiftFilter !== 'ALL' || showShiftHandover || showOverdueOnly || activeTab !== 'all'
                  ? 'No deployed items match your filters.'
                  : 'All security equipment has been safely returned to store inventory.'}
              </p>
              {(searchQuery || shiftFilter !== 'ALL' || showShiftHandover || showOverdueOnly || activeTab !== 'all') && (
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setShiftFilter('ALL')
                    setShowShiftHandover(false)
                    setShowOverdueOnly(false)
                    setActiveTab('all')
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-4 border-slate-200 dark:border-slate-700"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-800/50">
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Guard</th>
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Equipment</th>
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Qty Out</th>
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Shift</th>
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Issued Date</th>
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Duty Point</th>
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Custodian</th>
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Status</th>
                    {isCustodian && (
                      <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-right">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredItems.map((item) => {
                    const isPartial = item.quantityOutstanding < item.quantityIssued
                    const itemIsOverdue = isOverdue(item)
                    const issueShift = item.issue?.shift

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                          itemIsOverdue ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white text-sm">
                            {item.issue?.guard?.fullName || 'Unknown'}
                          </div>
                          {item.issue?.guard?.staffId && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {item.issue.guard.staffId}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-900 dark:text-white text-sm font-medium">
                            {item.equipment?.itemName || 'Unknown'}
                          </div>
                          <span className="inline-block font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded mt-0.5">
                            {item.equipment?.itemCode || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                            {item.quantityOutstanding} / {item.quantityIssued}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            issueShift === 'DAY'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-800'
                          }`}>
                            {issueShift || '—'}
                          </span>
                          {itemIsOverdue && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                                <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                                Overdue
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {new Date(item.issue?.issuedAt || Date.now()).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {item.issue?.dutyPoint || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                          {item.issue?.custodian?.fullName || 'Unknown'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isPartial
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                          }`}>
                            {isPartial ? 'PARTIALLY RETURNED' : 'ISSUED'}
                          </span>
                        </td>
                        {isCustodian && (
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              size="sm"
                              onClick={() => openReturnDialog(item.id)}
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-sm"
                            >
                              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                              Return
                            </Button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Equipment Dialog - Only for Custodians */}
      {isCustodian && (
        <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
          <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <ArrowLeft className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Return Equipment from Guard
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Process full or partial return of gear back to stores.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {selectedItemForReturn && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Guard:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedItemForReturn.issue?.guard?.fullName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Equipment:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedItemForReturn.equipment?.itemName} ({selectedItemForReturn.equipment?.itemCode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Outstanding:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {selectedItemForReturn.quantityOutstanding} units
                  </span>
                </div>
              </div>
            )}

            <form action={returnEquipment} className="space-y-4 pt-2">
              <input type="hidden" name="itemId" value={selectedItemForReturn?.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="quantityReturned" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Quantity to Return *
                  </Label>
                  <Input
                    id="quantityReturned"
                    name="quantityReturned"
                    type="number"
                    min="1"
                    max={selectedItemForReturn?.quantityOutstanding}
                    defaultValue={selectedItemForReturn?.quantityOutstanding}
                    required
                    placeholder="Quantity"
                    className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="condition" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Condition at Return *
                  </Label>
                  <select
                    id="condition"
                    name="condition"
                    required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="GOOD">Good</option>
                    <option value="SLIGHTLY_DAMAGED">Slightly Damaged</option>
                    <option value="DAMAGED">Damaged</option>
                    <option value="MISSING">Missing</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="remarks" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Remarks
                </Label>
                <Input
                  id="remarks"
                  name="remarks"
                  placeholder="Additional notes (optional)"
                  className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white rounded-lg"
                />
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReturnDialogOpen(false)}
                  className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                >
                  Process Return
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
