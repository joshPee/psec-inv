'use client'

import { useState, useEffect } from 'react'
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
import { Combobox } from '@/components/ui/combobox'
import { Search, AlertCircle, Plus, Download, FileText, CheckCircle, Archive, TriangleAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'

import { Suspense } from 'react'

function MissingItemsContent() {
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
  const [selectedEquipment, setSelectedEquipment] = useState('')
  const [selectedGuard, setSelectedGuard] = useState('')
  const [loading, setLoading] = useState(false)
  const [missingRecords, setMissingRecords] = useState<any[]>([])
  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([])
  const [guardOptions, setGuardOptions] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMissingRecords()
    fetchEquipmentOptions()
    fetchGuardOptions()
  }, [startDate, endDate])

  const fetchMissingRecords = async () => {
    try {
      let url = '/api/records/missing'
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url)
      const data = await response.json()
      if (Array.isArray(data)) {
        setMissingRecords(data.map((record: any) => ({
          id: record.id,
          equipmentCode: record.equipment?.itemCode || 'N/A',
          equipmentName: record.equipment?.itemName || 'N/A',
          guardName: record.guard?.fullName || 'N/A',
          guardId: record.guard?.staffId || 'N/A',
          quantity: record.quantity,
          recordedAt: record.recordedAt,
          recorderName: record.recordedBy?.fullName || 'N/A',
          remarks: record.remarks,
          status: record.status || 'REPORTED',
        })))
      }
    } catch (error) {
      console.error('Error fetching missing records:', error)
    }
  }

  const handleExportCSV = () => {
    let url = '/api/reports/missing/export'
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (params.toString()) url += `?${params.toString()}`
    window.open(url, '_blank')
  }

  const handleExportPDF = () => {
    let url = '/api/reports/missing/export-pdf'
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

  const handleRecordMissing = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const equipmentId = selectedEquipment
      const guardId = selectedGuard
      const quantity = parseInt(formData.get('quantity') as string)
      const remarks = formData.get('remarks') as string

      const response = await fetch('/api/records/missing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentId, guardId, quantity, remarks }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to record missing item'
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        setIsDialogOpen(false)
        setSelectedEquipment('')
        setSelectedGuard('')
        fetchMissingRecords()
        fetchEquipmentOptions()
        toast.success('Missing item recorded successfully.')
      }
    } catch (error) {
      const errorMsg = 'An error occurred while recording missing item'
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
      const response = await fetch(`/api/records/missing/${resolveTarget.id}`, {
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
        fetchMissingRecords()
        fetchEquipmentOptions()
      }
    } catch (error) {
      toast.error('An error occurred while updating the record')
    } finally {
      setResolveLoading(false)
    }
  }

  const filteredRecords = missingRecords.filter((record) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      record.equipmentName.toLowerCase().includes(q) ||
      record.equipmentCode.toLowerCase().includes(q) ||
      record.guardName.toLowerCase().includes(q) ||
      record.guardId.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(244, 63, 94, 0.3) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(251, 146, 60, 0.2) 0%, transparent 60%)' }} />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/30 text-rose-100 border border-rose-400/30">
                Loss Tracking
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
              <TriangleAlert className="h-7 w-7 text-rose-200" />
              Missing Items
            </h1>
            <p className="text-sm text-rose-100/90 mt-1">Track and record missing equipment</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleExportPDF} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Missing
                </Button>
              </DialogTrigger>
              <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">Record Missing Equipment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleRecordMissing} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="equipmentId" className="text-slate-700 dark:text-slate-200">Equipment *</Label>
                  <Combobox
                    name="equipmentId"
                    required
                    options={equipmentOptions}
                    value={selectedEquipment}
                    onValueChange={(value: string) => setSelectedEquipment(value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardId" className="text-slate-700 dark:text-slate-200">Guard *</Label>
                  <Combobox
                    name="guardId"
                    required
                    options={guardOptions}
                    value={selectedGuard}
                    onValueChange={(value: string) => setSelectedGuard(value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-slate-700 dark:text-slate-200">Quantity *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    required
                    placeholder="Quantity missing"
                    className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks" className="text-slate-700 dark:text-slate-200">Remarks</Label>
                <Input
                  id="remarks"
                  name="remarks"
                  placeholder="Additional notes"
                  className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="dark:border-slate-700 dark:hover:bg-slate-800">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
                  {loading ? 'Recording...' : 'Record Missing'}
                </Button>
              </DialogFooter>
              </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="search" className="text-slate-700 dark:text-slate-200">Search</Label>
              <Input
                id="search"
                placeholder="Search by equipment or guard..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="startDate" className="text-slate-700 dark:text-slate-200">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="endDate" className="text-slate-700 dark:text-slate-200">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <Button
              onClick={() => {
                setStartDate('')
                setEndDate('')
                setSearchQuery('')
              }}
              variant="outline"
              className="border-slate-200 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Missing Records Card */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Active Missing Records</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No active missing records</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                    <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Equipment</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Guard</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Recorded By</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Remarks</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {new Date(record.recordedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">{record.equipmentName}</div>
                        <div className="text-xs font-mono text-slate-500">{record.equipmentCode}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-900 dark:text-white">{record.guardName}</div>
                        <div className="text-xs font-mono text-slate-500">{record.guardId}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">{record.quantity}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{record.recorderName}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{record.remarks || '-'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {record.status === 'ACTIVE' && (
                          <div className="flex gap-1.5 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
                              onClick={() => openResolveDialog(record, 'RESOLVED')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                              onClick={() => openResolveDialog(record, 'ARCHIVED')}
                            >
                              <Archive className="h-3 w-3 mr-1" />
                              Archive
                            </Button>
                          </div>
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

      {/* Resolve/Archive Confirmation Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {resolveAction === 'RESOLVED' ? 'Resolve Missing Record' : 'Archive Missing Record'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {resolveAction === 'RESOLVED'
                ? 'Mark this missing item as found. You can optionally restore the quantity back to available stock.'
                : 'Archive this record. The missing quantity will remain deducted from inventory.'}
            </DialogDescription>
          </DialogHeader>

          {resolveTarget && (
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Equipment</span>
                <span className="font-medium text-slate-900 dark:text-white">{resolveTarget.equipmentName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Guard</span>
                <span className="font-medium text-slate-900 dark:text-white">{resolveTarget.guardName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Quantity</span>
                <span className="font-semibold text-slate-900 dark:text-white">{resolveTarget.quantity}</span>
              </div>
            </div>
          )}

          {resolveAction === 'RESOLVED' && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
              <input
                type="checkbox"
                id="restoreStockMissing"
                checked={restoreStock}
                onChange={(e) => setRestoreStock(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="restoreStockMissing" className="text-sm text-slate-700 dark:text-slate-300">
                <span className="font-medium">Restore stock</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  Return {resolveTarget?.quantity} item(s) back to available inventory (item was found/recovered)
                </span>
              </label>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResolveDialogOpen(false)}
              className="dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolveRecord}
              disabled={resolveLoading}
              className={
                resolveAction === 'RESOLVED'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-600 hover:bg-slate-700 text-white'
              }
            >
              {resolveLoading
                ? 'Processing...'
                : resolveAction === 'RESOLVED'
                ? 'Resolve Record'
                : 'Archive Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function MissingItemsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MissingItemsContent />
    </Suspense>
  )
}
