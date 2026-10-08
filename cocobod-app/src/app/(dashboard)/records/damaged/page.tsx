'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  AlertTriangle, 
  Search, 
  Plus, 
  Download, 
  FileText, 
  CheckCircle, 
  Archive, 
  RotateCcw,
  ShieldAlert,
  Calendar,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'

import { Suspense } from 'react'

function DamagedItemsContent() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('openDialog') === 'true') {
      setIsDialogOpen(true)
    }
  }, [searchParams])
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false)
  const [resolveTarget, setResolveTarget] = useState<any>(null)
  const [resolveAction, setResolveAction] = useState<'RESOLVED' | 'ARCHIVED'>('RESOLVED')
  const [restoreStock, setRestoreStock] = useState(true)
  const [resolveLoading, setResolveLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedEquipment, setSelectedEquipment] = useState('')
  const [selectedGuard, setSelectedGuard] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('SLIGHTLY_DAMAGED')
  const [loading, setLoading] = useState(false)
  const [damagedRecords, setDamagedRecords] = useState<any[]>([])
  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([])
  const [guardOptions, setGuardOptions] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDamagedRecords()
    fetchEquipmentOptions()
    fetchGuardOptions()
  }, [startDate, endDate])

  const fetchDamagedRecords = async () => {
    try {
      let url = '/api/records/damaged'
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url)
      const data = await response.json()
      if (Array.isArray(data)) {
        setDamagedRecords(data.map((record: any) => ({
          id: record.id,
          equipmentCode: record.equipment?.itemCode || 'N/A',
          equipmentName: record.equipment?.itemName || 'N/A',
          guardName: record.guard?.fullName || 'N/A',
          guardId: record.guard?.staffId || 'N/A',
          quantity: record.quantity,
          condition: record.condition,
          recordedAt: record.recordedAt,
          recorderName: record.recordedBy?.fullName || 'N/A',
          remarks: record.remarks,
          status: record.status || 'ACTIVE',
        })))
      }
    } catch (error) {
      console.error('Error fetching damaged records:', error)
    }
  }

  const handleExportCSV = () => {
    let url = '/api/reports/damaged/export'
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (params.toString()) url += `?${params.toString()}`
    window.open(url, '_blank')
  }

  const handleExportPDF = () => {
    let url = '/api/reports/damaged/export-pdf'
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (params.toString()) url += `?${params.toString()}`
    window.open(url, '_blank')
  }

  const fetchEquipmentOptions = async () => {
    try {
      const response = await fetch('/api/equipment')
      const data = await response.json()
      if (Array.isArray(data)) {
        setEquipmentOptions(data.map((eq: any) => ({
          value: eq.id,
          label: `${eq.itemName} (${eq.itemCode}) - Available: ${eq.availableQuantity}`,
        })))
      }
    } catch (error) {
      console.error('Error fetching equipment:', error)
    }
  }

  const fetchGuardOptions = async () => {
    try {
      const response = await fetch('/api/guards')
      const data = await response.json()
      if (Array.isArray(data)) {
        setGuardOptions(data.map((guard: any) => ({
          value: guard.id,
          label: `${guard.fullName} (${guard.staffId})`,
        })))
      }
    } catch (error) {
      console.error('Error fetching guards:', error)
    }
  }

  const handleRecordDamage = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const equipmentId = formData.get('equipmentId') as string
      const guardId = formData.get('guardId') as string
      const quantity = parseInt(formData.get('quantity') as string)
      const condition = formData.get('condition') as string
      const remarks = formData.get('remarks') as string

      const response = await fetch('/api/records/damaged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentId, guardId, quantity, condition, remarks }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to record damage'
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        setIsDialogOpen(false)
        setSelectedEquipment('')
        setSelectedGuard('')
        setSelectedCondition('SLIGHTLY_DAMAGED')
        fetchDamagedRecords()
        fetchEquipmentOptions()
        toast.success('Damaged item recorded successfully.')
      }
    } catch (error) {
      const errorMsg = 'An error occurred while recording damage'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const openResolveDialog = (record: any, action: 'RESOLVED' | 'ARCHIVED') => {
    setResolveTarget(record)
    setResolveAction(action)
    setRestoreStock(action === 'RESOLVED')
    setIsResolveDialogOpen(true)
  }

  const handleResolveRecord = async () => {
    if (!resolveTarget) return
    setResolveLoading(true)

    try {
      const response = await fetch(`/api/records/damaged/${resolveTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: resolveAction,
          restoreStock: resolveAction === 'RESOLVED' ? restoreStock : false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to update record')
      } else {
        toast.success(
          resolveAction === 'RESOLVED'
            ? `Record resolved${restoreStock ? ' and stock restored' : ''}.`
            : 'Record archived successfully.'
        )
        setIsResolveDialogOpen(false)
        setResolveTarget(null)
        fetchDamagedRecords()
        fetchEquipmentOptions()
      }
    } catch (error) {
      toast.error('An error occurred while updating the record')
    } finally {
      setResolveLoading(false)
    }
  }

  // Summary counts
  const stats = useMemo(() => {
    const active = damagedRecords.filter((r) => r.status === 'ACTIVE')
    const resolved = damagedRecords.filter((r) => r.status === 'RESOLVED')
    const archived = damagedRecords.filter((r) => r.status === 'ARCHIVED')
    const activeUnits = active.reduce((sum, r) => sum + (r.quantity || 0), 0)

    return {
      activeCount: active.length,
      activeUnits,
      resolvedCount: resolved.length,
      archivedCount: archived.length,
      totalCount: damagedRecords.length,
    }
  }, [damagedRecords])

  const filteredRecords = useMemo(() => {
    return damagedRecords.filter((record) => {
      // Status filter
      if (statusFilter !== 'ALL' && record.status !== statusFilter) {
        return false
      }
      // Search query
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        record.equipmentName.toLowerCase().includes(q) ||
        record.equipmentCode.toLowerCase().includes(q) ||
        record.guardName.toLowerCase().includes(q) ||
        record.guardId.toLowerCase().includes(q) ||
        (record.remarks && record.remarks.toLowerCase().includes(q))
      )
    })
  }, [damagedRecords, searchQuery, statusFilter])

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-100 text-xs font-semibold mb-3 border border-white/20">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Equipment Incident Log</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Damaged Equipment Records
            </h1>
            <p className="mt-1 text-sm md:text-base text-amber-100/90 max-w-xl">
              Monitor, audit, and reconcile damaged security gear. Track repairs and restore functional items to active stock.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all"
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-rose-700 hover:bg-rose-50 shadow-md font-semibold transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Damage
                </Button>
              </DialogTrigger>
              <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                        Record Equipment Damage
                      </DialogTitle>
                      <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs">
                        Log damaged items returned by or assigned to security personnel.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <form onSubmit={handleRecordDamage} className="space-y-4 pt-2">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="equipmentId" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Equipment *
                      </Label>
                      <Select
                        value={selectedEquipment}
                        onValueChange={(value: string) => setSelectedEquipment(value)}
                      >
                        <SelectTrigger className="w-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                          <SelectValue placeholder="Select equipment..." />
                        </SelectTrigger>
                        <SelectContent>
                          {equipmentOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input type="hidden" name="equipmentId" value={selectedEquipment} required />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="guardId" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Assigned Guard / Custodian *
                      </Label>
                      <Select
                        value={selectedGuard}
                        onValueChange={(value: string) => setSelectedGuard(value)}
                      >
                        <SelectTrigger className="w-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                          <SelectValue placeholder="Select guard..." />
                        </SelectTrigger>
                        <SelectContent>
                          {guardOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input type="hidden" name="guardId" value={selectedGuard} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="quantity" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Quantity Damaged *
                        </Label>
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          min="1"
                          required
                          placeholder="e.g. 1"
                          className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white rounded-lg"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="condition" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Severity / Condition *
                        </Label>
                        <Select
                          value={selectedCondition}
                          onValueChange={(value: string) => setSelectedCondition(value)}
                        >
                          <SelectTrigger className="w-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SLIGHTLY_DAMAGED">Slightly Damaged</SelectItem>
                            <SelectItem value="DAMAGED">Damaged</SelectItem>
                            <SelectItem value="MISSING">Missing</SelectItem>
                          </SelectContent>
                        </Select>
                        <input type="hidden" name="condition" value={selectedCondition} required />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="remarks" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Damage Notes / Reason
                      </Label>
                      <Input
                        id="remarks"
                        name="remarks"
                        placeholder="e.g. Cracked screen during patrol, broken strap..."
                        className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white rounded-lg"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-3 py-2.5 rounded-xl text-xs font-medium">
                      {error}
                    </div>
                  )}

                  <DialogFooter className="pt-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm"
                    >
                      {loading ? 'Recording...' : 'Record Damage'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-950/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Overview Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Incidents */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
          className={`cursor-pointer group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-md ${
            statusFilter === 'ACTIVE'
              ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/20'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/80 dark:border-slate-800/80 hover:border-rose-300 dark:hover:border-rose-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Issues
            </span>
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.activeCount}
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              ({stats.activeUnits} units)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Requires repair or reconciliation</p>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-xl" />
        </div>

        {/* Resolved Items */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'RESOLVED' ? 'ALL' : 'RESOLVED')}
          className={`cursor-pointer group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-md ${
            statusFilter === 'RESOLVED'
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-500/20'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Repaired / Resolved
            </span>
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.resolvedCount}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              resolved
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Fixed & restocked into inventory</p>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-xl" />
        </div>

        {/* Archived Records */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'ARCHIVED' ? 'ALL' : 'ARCHIVED')}
          className={`cursor-pointer group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-md ${
            statusFilter === 'ARCHIVED'
              ? 'bg-slate-100/90 dark:bg-slate-800/60 border-slate-400 dark:border-slate-600 ring-2 ring-slate-500/20'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Archived / Written-off
            </span>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <Archive className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.archivedCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              written off
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Decommissioned or beyond repair</p>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-400 rounded-l-xl" />
        </div>

        {/* Total Records */}
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={`cursor-pointer group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-md ${
            statusFilter === 'ALL'
              ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 ring-2 ring-blue-500/20'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200/80 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Logged
            </span>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalCount}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              all-time
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {statusFilter === 'ALL' ? 'Showing all records' : 'Click to show all'}
          </p>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl" />
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
        <CardContent className="pt-5 pb-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 items-end">
            <div className="space-y-1.5 lg:col-span-4">
              <Label htmlFor="search" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Search by equipment, code, or guard..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="space-y-1.5 lg:col-span-3">
              <Label htmlFor="startDate" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                From Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="space-y-1.5 lg:col-span-3">
              <Label htmlFor="endDate" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                To Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="lg:col-span-2 flex gap-2">
              <Button
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                  setSearchQuery('')
                  setStatusFilter('ALL')
                }}
                variant="outline"
                className="w-full border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Damaged Records Table Card */}
      <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Equipment Damage Records
              </CardTitle>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
              </span>
              {statusFilter !== 'ALL' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  Status: {statusFilter}
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredRecords.length === 0 ? (
            <div className="py-16 text-center">
              <div className="inline-flex p-4 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 mb-3 ring-8 ring-amber-50/50 dark:ring-amber-950/20">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">No damage records found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery || startDate || endDate || statusFilter !== 'ALL'
                  ? 'No records match your active search filters. Try clearing or widening the date range.'
                  : 'All security equipment is in operational standing. No damaged items are currently logged.'}
              </p>
              {(searchQuery || startDate || endDate || statusFilter !== 'ALL') && (
                <Button
                  onClick={() => {
                    setStartDate('')
                    setEndDate('')
                    setSearchQuery('')
                    setStatusFilter('ALL')
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-4 border-slate-200 dark:border-slate-700"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-800/50">
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Equipment</th>
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Assigned Guard</th>
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Quantity</th>
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Condition</th>
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Recorded By</th>
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Remarks</th>
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {new Date(record.recordedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">
                          {record.equipmentName}
                        </div>
                        <div className="inline-block font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mt-0.5">
                          {record.equipmentCode}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-900 dark:text-white text-sm font-medium">
                          {record.guardName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {record.guardId}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                          {record.quantity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={record.condition} />
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                        {record.recorderName}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-[180px] truncate" title={record.remarks}>
                        {record.remarks || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {record.status === 'ACTIVE' ? (
                          <div className="flex gap-1.5 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/50 rounded-lg shadow-sm font-medium"
                              onClick={() => openResolveDialog(record, 'RESOLVED')}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Resolve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg font-medium"
                              onClick={() => openResolveDialog(record, 'ARCHIVED')}
                            >
                              <Archive className="h-3.5 w-3.5 mr-1" />
                              Archive
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No action</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolve / Archive Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className={`p-2 rounded-xl ${
                resolveAction === 'RESOLVED'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}>
                {resolveAction === 'RESOLVED' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Archive className="h-5 w-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  {resolveAction === 'RESOLVED' ? 'Resolve Damaged Record' : 'Archive Damaged Record'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  {resolveAction === 'RESOLVED'
                    ? 'Mark this item as repaired/reconciled and optionally return to inventory.'
                    : 'Decommission and write-off this item permanently.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {resolveTarget && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 my-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 text-xs">Equipment:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{resolveTarget.equipmentName}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 text-xs">Assigned Guard:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{resolveTarget.guardName}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 text-xs">Quantity Affected:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{resolveTarget.quantity} units</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 text-xs">Reported Condition:</span>
                <StatusBadge status={resolveTarget.condition} />
              </div>
            </div>
          )}

          {resolveAction === 'RESOLVED' && (
            <div className="flex items-start gap-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
              <input
                type="checkbox"
                id="restoreStock"
                checked={restoreStock}
                onChange={(e) => setRestoreStock(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="restoreStock" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <span className="font-semibold text-slate-900 dark:text-white block">Restore to available inventory</span>
                <span className="text-slate-500 dark:text-slate-400 block mt-0.5">
                  Restores {resolveTarget?.quantity} unit(s) back into active stock (e.g. item was successfully repaired or returned undamaged).
                </span>
              </label>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResolveDialogOpen(false)}
              className="border-slate-200 dark:border-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolveRecord}
              disabled={resolveLoading}
              className={
                resolveAction === 'RESOLVED'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm'
                  : 'bg-slate-700 hover:bg-slate-800 text-white font-medium'
              }
            >
              {resolveLoading
                ? 'Processing...'
                : resolveAction === 'RESOLVED'
                ? 'Confirm & Resolve'
                : 'Confirm & Archive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function DamagedItemsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DamagedItemsContent />
    </Suspense>
  )
}
