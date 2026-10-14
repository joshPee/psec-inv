'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'
import { 
  Eye, Edit, ArrowRight, History, MoreVertical, Plus, CheckCircle, X, 
  Package, RefreshCw, Minus, Download, ArrowUpDown, ArrowUp, ArrowDown, 
  Search, AlertTriangle, Layers, Filter 
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

type StatusFilterType = 'ALL' | 'AVAILABLE' | 'LOW_STOCK' | 'DEPLETED' | 'ISSUED'
type SortKey = 'itemCode' | 'itemName' | 'category' | 'totalQuantity' | 'availableQuantity' | 'issuedQuantity'

function StockDistributionBar({ item }: { item: any }) {
  const total = item.totalQuantity || 0
  if (total === 0) {
    return <span className="text-xs text-slate-400">0 units</span>
  }

  const avail = item.availableQuantity || 0
  const issued = item.issuedQuantity || 0
  const damaged = item.damagedQuantity || 0
  const missing = item.missingQuantity || 0

  const availPct = Math.round((avail / total) * 100)
  const issuedPct = Math.round((issued / total) * 100)
  const damagedPct = Math.round((damaged / total) * 100)
  const missingPct = Math.max(0, 100 - availPct - issuedPct - damagedPct)

  return (
    <div className="w-full min-w-[120px] max-w-[150px] space-y-1">
      <div
        className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex"
        title={`Available: ${avail} (${availPct}%) | Issued: ${issued} (${issuedPct}%) | Damaged: ${damaged} | Missing: ${missing}`}
      >
        {availPct > 0 && (
          <div
            style={{ width: `${availPct}%` }}
            className="bg-emerald-500 h-full transition-all"
          />
        )}
        {issuedPct > 0 && (
          <div
            style={{ width: `${issuedPct}%` }}
            className="bg-blue-500 h-full transition-all"
          />
        )}
        {damagedPct > 0 && (
          <div
            style={{ width: `${damagedPct}%` }}
            className="bg-amber-500 h-full transition-all"
          />
        )}
        {missingPct > 0 && (
          <div
            style={{ width: `${missingPct}%` }}
            className="bg-rose-500 h-full transition-all"
          />
        )}
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {avail} avail
        </span>
        <span className="text-slate-400 font-mono">
          {total} total
        </span>
      </div>
    </div>
  )
}

export default function InventoryClient({ equipment, categories, initialSearch, initialCategory, showSuccessToast }: { equipment: any[], categories: any[], initialSearch?: string, initialCategory?: string, showSuccessToast?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false)
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [selectedEquipmentForIssue, setSelectedEquipmentForIssue] = useState<any>(null)
  const [selectedEquipmentForAdjust, setSelectedEquipmentForAdjust] = useState<any>(null)
  const [localEquipment, setLocalEquipment] = useState(equipment)
  const [guards, setGuards] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState(initialSearch || '')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '')
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('itemName')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setLocalEquipment(equipment)
  }, [equipment])

  useEffect(() => {
    fetch('/api/guards')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setGuards(data)
      })
      .catch((err) => console.error('Error loading guards:', err))
  }, [])

  useEffect(() => {
    if (showSuccessToast) {
      toast.success('Equipment added successfully.')
    }
  }, [showSuccessToast, toast])

  async function handleAddEquipment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const itemName = formData.get('itemName') as string
    const categoryId = formData.get('categoryId') as string
    const itemCode = formData.get('itemCode') as string
    const quantity = parseInt(formData.get('quantity') as string)
    const condition = formData.get('condition') as string
    const storageLocation = formData.get('storageLocation') as string
    const remarks = formData.get('remarks') as string

    console.log('Form data:', { itemName, itemNameLength: itemName?.length, itemCode, categoryId })

    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName,
          categoryId,
          itemCode,
          quantity,
          condition: condition || 'GOOD',
          storageLocation,
          remarks,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to add equipment.')
        return
      }

      setLocalEquipment((prev) => [data, ...prev])
      setIsAddDialogOpen(false)
      toast.success('Equipment added to database successfully.')
      router.refresh()
    } catch (error) {
      console.error('Error adding equipment:', error)
      toast.error('Network error occurred while creating equipment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleIssueEquipment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const equipmentId = formData.get('equipmentId') as string
    const guardId = formData.get('guardId') as string
    const quantity = parseInt(formData.get('quantity') as string)
    const condition = formData.get('condition') as string
    const shift = formData.get('shift') as string
    const dutyPoint = formData.get('dutyPoint') as string
    const remarks = formData.get('remarks') as string

    if (!guardId) {
      toast.error('Please select a guard to issue equipment to.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/equipment/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId,
          guardId,
          quantity,
          condition,
          shift,
          dutyPoint,
          remarks,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to issue equipment.')
        return
      }

      toast.success('Equipment issued to guard successfully.')
      setIsIssueDialogOpen(false)
      setSelectedEquipmentForIssue(null)
      router.refresh()
    } catch (error) {
      console.error('Error issuing equipment:', error)
      toast.error('Failed to issue equipment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function openIssueDialog(equipmentId: string) {
    setSelectedEquipmentForIssue(localEquipment.find(e => e.id === equipmentId))
    setIsIssueDialogOpen(true)
  }

  function openAdjustDialog(equipmentId: string) {
    setSelectedEquipmentForAdjust(localEquipment.find(e => e.id === equipmentId))
    setIsAdjustDialogOpen(true)
  }

  async function handleAdjustStock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const adjustmentType = formData.get('adjustmentType') as string
    const quantity = parseInt(formData.get('quantity') as string)
    const reason = formData.get('reason') as string

    if (!selectedEquipmentForAdjust) return

    try {
      const response = await fetch('/api/equipment/adjust-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: selectedEquipmentForAdjust.id,
          adjustmentType,
          quantity,
          reason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to adjust stock.')
        return
      }

      // Update local state
      setLocalEquipment((prev: any[]) =>
        prev.map((item) =>
          item.id === selectedEquipmentForAdjust.id
            ? { ...item, ...data.updatedEquipment }
            : item
        )
      )

      setIsAdjustDialogOpen(false)
      setSelectedEquipmentForAdjust(null)
      toast.success('Stock adjusted successfully.')
      router.refresh()
    } catch (error) {
      console.error('Error adjusting stock:', error)
      toast.error('Failed to adjust stock.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  function exportFilteredToCSV() {
    if (displayedEquipment.length === 0) {
      toast.error('No equipment to export.')
      return
    }

    const headers = [
      'Item Code',
      'Item Name',
      'Category',
      'Total Quantity',
      'Available',
      'Issued',
      'Damaged',
      'Missing',
      'Status',
      'Condition',
      'Storage Location',
      'Remarks',
    ]

    const rows = displayedEquipment.map((item) => {
      const status = item.availableQuantity > 0 ? 'Available' :
                     item.reservedQuantity > 0 ? 'Reserved' :
                     item.issuedQuantity > 0 ? 'Issued' :
                     item.damagedQuantity > 0 ? 'Damaged' : 'Missing'

      return [
        item.itemCode || '',
        item.itemName || '',
        item.category?.name || 'Unknown',
        item.totalQuantity || 0,
        item.availableQuantity || 0,
        item.issuedQuantity || 0,
        item.damagedQuantity || 0,
        item.missingQuantity || 0,
        status,
        item.defaultCondition || '',
        item.storageLocation || '',
        item.remarks || '',
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\r\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `cocobod-inventory-${new Date().toISOString().split('T')[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${displayedEquipment.length} items to CSV.`)
  }

  const stats = {
    total: localEquipment.length,
    available: localEquipment.filter((e) => (e.availableQuantity || 0) > 0).length,
    lowStock: localEquipment.filter((e) =>
      Boolean(e.lowStockThreshold && e.lowStockThreshold > 0 && e.availableQuantity <= e.lowStockThreshold)
    ).length,
    depleted: localEquipment.filter((e) => (e.availableQuantity || 0) === 0).length,
    issued: localEquipment.filter((e) => (e.issuedQuantity || 0) > 0).length,
  }

  const displayedEquipment = localEquipment
    .filter((item) => {
      if (statusFilter === 'AVAILABLE' && (item.availableQuantity || 0) <= 0) return false
      if (statusFilter === 'LOW_STOCK') {
        const isLow = Boolean(
          item.lowStockThreshold &&
          item.lowStockThreshold > 0 &&
          item.availableQuantity <= item.lowStockThreshold
        )
        if (!isLow) return false
      }
      if (statusFilter === 'DEPLETED' && (item.availableQuantity || 0) > 0) return false
      if (statusFilter === 'ISSUED' && (item.issuedQuantity || 0) <= 0) return false

      if (selectedCategory && item.category?.name !== selectedCategory) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = item.itemName?.toLowerCase().includes(q)
        const matchCode = item.itemCode?.toLowerCase().includes(q)
        const matchLoc = item.storageLocation?.toLowerCase().includes(q)
        const matchCat = item.category?.name?.toLowerCase().includes(q)
        if (!matchName && !matchCode && !matchLoc && !matchCat) return false
      }

      return true
    })
    .sort((a, b) => {
      let valA: any
      let valB: any

      if (sortKey === 'category') {
        valA = a.category?.name || ''
        valB = b.category?.name || ''
      } else {
        valA = a[sortKey] ?? ''
        valB = b[sortKey] ?? ''
      }

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(String(valB))
        return sortDirection === 'asc' ? cmp : -cmp
      } else {
        const cmp = valA > valB ? 1 : valA < valB ? -1 : 0
        return sortDirection === 'asc' ? cmp : -cmp
      }
    })

  const renderSortHeader = (label: string, key: SortKey, className = '') => (
    <th
      onClick={() => toggleSort(key)}
      className={`py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        {sortKey === key ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-30 hover:opacity-75" />
        )}
      </div>
    </th>
  )

  return (
    <div className="space-y-6">

      {/* Modern Page Header */}
      <PageHeader
        icon={Package}
        title="Equipment Inventory"
        subtitle="Master catalog tracking active stock levels, deployment custody, and operational readiness."
        badge="Master Catalog"
        color="teal"
        stats={[
          { label: 'Total Catalog', value: stats.total },
          { label: 'In Stock', value: stats.available, highlight: true },
          { label: 'Low Stock', value: stats.lowStock, highlight: stats.lowStock > 0 },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={exportFilteredToCSV}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium shadow-sm transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-md transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">Add New Equipment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddEquipment} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="itemName" className="text-slate-700 dark:text-slate-200">Item Name *</Label>
                  <Input
                    id="itemName"
                    name="itemName"
                    required
                    placeholder="e.g., 9mm Pistol"
                    className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemCode" className="text-slate-700 dark:text-slate-200">Item Code *</Label>
                  <Input
                    id="itemCode"
                    name="itemCode"
                    required
                    placeholder="e.g., WPN-001"
                    className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId" className="text-slate-700 dark:text-slate-200">Category *</Label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select category</option>
                    {categories.filter(c => c.isActive).map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-slate-700 dark:text-slate-200">Quantity *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    required
                    placeholder="e.g., 20"
                    className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold" className="text-slate-700 dark:text-slate-200">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    type="number"
                    min="0"
                    placeholder="e.g., 5"
                    className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Alert when available quantity falls below this value</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition" className="text-slate-700 dark:text-slate-200">Default Condition *</Label>
                  <select
                    id="condition"
                    name="condition"
                    required
                    defaultValue="GOOD"
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="GOOD">Good</option>
                    <option value="SLIGHTLY_DAMAGED">Slightly Damaged</option>
                    <option value="DAMAGED">Damaged</option>
                    <option value="MISSING">Missing</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storageLocation" className="text-slate-700 dark:text-slate-200">Storage Location</Label>
                  <Input
                    id="storageLocation"
                    name="storageLocation"
                    placeholder="e.g., Armory A"
                    className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks" className="text-slate-700 dark:text-slate-200">Remarks</Label>
                <Input
                  id="remarks"
                  name="remarks"
                  placeholder="Additional notes about the equipment"
                  className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isSubmitting ? 'Saving to Database...' : 'Add Equipment'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="dark:border-slate-700 dark:hover:bg-slate-800">Cancel</Button>
              </div>
            </form>
            </DialogContent>
          </Dialog>
        </div>
      }
    />

      {/* Issue Equipment Dialog */}
      <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">Issue Equipment to Guard</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleIssueEquipment} className="space-y-4">
            <input type="hidden" name="equipmentId" value={selectedEquipmentForIssue?.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="guardId" className="text-slate-700 dark:text-slate-200">Select Guard *</Label>
                <select
                  id="guardId"
                  name="guardId"
                  required
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Choose Guard --</option>
                  {guards.map((guard) => (
                    <option key={guard.id} value={guard.id}>
                      {guard.fullName} ({guard.badgeId || guard.staffId || 'Active Guard'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-slate-700 dark:text-slate-200">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  max={selectedEquipmentForIssue?.availableQuantity}
                  required
                  placeholder="Quantity to issue"
                  className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition" className="text-slate-700 dark:text-slate-200">Condition at Issue *</Label>
                <select
                  id="condition"
                  name="condition"
                  required
                  defaultValue="GOOD"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="GOOD">Good</option>
                  <option value="SLIGHTLY_DAMAGED">Slightly Damaged</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shift" className="text-slate-700 dark:text-slate-200">Shift *</Label>
                <select
                  id="shift"
                  name="shift"
                  required
                  defaultValue="DAY"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="DAY">Day</option>
                  <option value="NIGHT">Night</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="dutyPoint" className="text-slate-700 dark:text-slate-200">Duty Point</Label>
                <Input
                  id="dutyPoint"
                  name="dutyPoint"
                  placeholder="e.g., Main Gate, Perimeter, Control Room"
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

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isSubmitting ? 'Recording Transaction...' : 'Issue Equipment'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsIssueDialogOpen(false)} className="dark:border-slate-700 dark:hover:bg-slate-800">Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">Adjust Stock Quantity</DialogTitle>
          </DialogHeader>
          {selectedEquipmentForAdjust && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Item:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedEquipmentForAdjust.itemName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Code:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedEquipmentForAdjust.itemCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Total:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {selectedEquipmentForAdjust.totalQuantity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Available:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedEquipmentForAdjust.availableQuantity}
                </span>
              </div>
            </div>
          )}
          <form onSubmit={handleAdjustStock} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adjustmentType" className="text-slate-700 dark:text-slate-200">Adjustment Type *</Label>
              <select
                id="adjustmentType"
                name="adjustmentType"
                required
                className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="RESTOCK">Restock (Add Units)</option>
                <option value="WRITE_OFF">Write-Off (Reduce Units)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-slate-700 dark:text-slate-200">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                required
                placeholder="Number of units to adjust"
                className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-slate-700 dark:text-slate-200">Reason *</Label>
              <Input
                id="reason"
                name="reason"
                required
                placeholder="e.g., New procurement, Damaged in storage, Inventory correction"
                className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isSubmitting ? 'Processing...' : 'Adjust Stock'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsAdjustDialogOpen(false)} className="dark:border-slate-700 dark:hover:bg-slate-800">Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Interactive Quick Status Pills & Search Filter */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Items
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                statusFilter === 'ALL' ? 'bg-white/20 dark:bg-slate-900/20' : 'bg-slate-200 dark:bg-slate-700'
              }`}>
                {stats.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('AVAILABLE')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'AVAILABLE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
              }`}
            >
              <CheckCircle className="h-3 w-3" />
              In Stock
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                statusFilter === 'AVAILABLE' ? 'bg-emerald-700 text-white' : 'bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
              }`}>
                {stats.available}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('LOW_STOCK')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'LOW_STOCK'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40'
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              Low Stock Alert
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                statusFilter === 'LOW_STOCK' ? 'bg-amber-600 text-white' : 'bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
              }`}>
                {stats.lowStock}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('DEPLETED')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'DEPLETED'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40'
              }`}
            >
              <Minus className="h-3 w-3" />
              Depleted (0)
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                statusFilter === 'DEPLETED' ? 'bg-rose-700 text-white' : 'bg-rose-200/60 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
              }`}>
                {stats.depleted}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('ISSUED')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'ISSUED'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'
              }`}
            >
              Active Issued
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                statusFilter === 'ISSUED' ? 'bg-blue-700 text-white' : 'bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
              }`}>
                {stats.issued}
              </span>
            </button>
          </div>

          {/* Search and Category Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                name="search"
                placeholder="Instant search by name, code, storage location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <select
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-64"
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.filter(c => c.isActive).map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {(searchQuery || selectedCategory || statusFilter !== 'ALL') && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('')
                  setStatusFilter('ALL')
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Equipment Inventory
              </CardTitle>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {displayedEquipment.length} {displayedEquipment.length === 1 ? 'item' : 'items'}
                {displayedEquipment.length !== localEquipment.length && ` (filtered from ${localEquipment.length})`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 mr-2 font-mono">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Avail
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Issued
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Damaged
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> Missing
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={exportFilteredToCSV}
                className="text-xs font-medium border-slate-200 dark:border-slate-700 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                <Download className="h-3.5 w-3.5 mr-1.5 text-teal-600 dark:text-teal-400" />
                Export CSV ({displayedEquipment.length})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  {renderSortHeader('Item Code', 'itemCode', 'min-w-[110px]')}
                  {renderSortHeader('Item Name', 'itemName', 'min-w-[250px]')}
                  {renderSortHeader('Category', 'category', 'min-w-[140px]')}
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider min-w-[150px]">
                    Stock Distribution
                  </th>
                  {renderSortHeader('Total', 'totalQuantity', 'min-w-[80px]')}
                  {renderSortHeader('Available', 'availableQuantity', 'min-w-[100px]')}
                  {renderSortHeader('Issued', 'issuedQuantity', 'min-w-[80px]')}
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider min-w-[80px]">
                    Damaged
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider min-w-[80px]">
                    Missing
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider min-w-[110px]">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider min-w-[140px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedEquipment.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        <p className="font-medium text-slate-700 dark:text-slate-300">No equipment matches your filters</p>
                        <p className="text-xs text-slate-400">Try adjusting your search terms or status pill selection.</p>
                        {(searchQuery || selectedCategory || statusFilter !== 'ALL') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSearchQuery('')
                              setSelectedCategory('')
                              setStatusFilter('ALL')
                            }}
                            className="mt-2 text-xs"
                          >
                            Reset All Filters
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedEquipment.map((item) => {
                    const status = item.availableQuantity > 0 ? 'Available' :
                                   item.reservedQuantity > 0 ? 'Reserved' :
                                   item.issuedQuantity > 0 ? 'Issued' :
                                   item.damagedQuantity > 0 ? 'Damaged' : 'Missing'

                    const isLowStock = Boolean(
                      item.lowStockThreshold &&
                      item.lowStockThreshold > 0 &&
                      item.availableQuantity <= item.lowStockThreshold
                    )

                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          isLowStock ? 'bg-amber-50/60 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {item.itemCode}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span>{item.itemName}</span>
                            {isLowStock ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                Low Stock
                              </span>
                            ) : null}
                          </div>
                          {item.storageLocation && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
                              📍 {item.storageLocation}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {item.category?.name || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <StockDistributionBar item={item} />
                        </td>
                        <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold whitespace-nowrap">
                          {item.totalQuantity}
                        </td>
                        <td className={`py-3 px-4 font-semibold whitespace-nowrap ${
                          isLowStock
                            ? 'text-amber-600 dark:text-amber-400'
                            : item.availableQuantity === 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {item.availableQuantity}
                          {item.lowStockThreshold > 0 && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-1 font-normal">
                              (min: {item.lowStockThreshold})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold whitespace-nowrap">
                          {item.issuedQuantity}
                        </td>
                        <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold whitespace-nowrap">
                          {item.damagedQuantity}
                        </td>
                        <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold whitespace-nowrap">
                          {item.missingQuantity}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={status} />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {/* Quick 1-Click Issue Button */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openIssueDialog(item.id)}
                              disabled={item.availableQuantity <= 0}
                              title={item.availableQuantity <= 0 ? 'No available units to issue' : 'Issue equipment to guard'}
                              className="h-8 px-2 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50 disabled:opacity-40"
                            >
                              <ArrowRight className="h-3.5 w-3.5 sm:mr-1" />
                              <span className="hidden xl:inline">Issue</span>
                            </Button>

                            {/* Quick Stock Adjust Button */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openAdjustDialog(item.id)}
                              title="Restock or Write-Off"
                              className="h-8 px-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              <RefreshCw className="h-3.5 w-3.5 sm:mr-1" />
                              <span className="hidden xl:inline">Stock</span>
                            </Button>

                            {/* 3-Dot Dropdown for full options */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                                  <Link href={`/inventory/${item.id}`}>
                                    <Eye className="h-4 w-4 mr-2 text-slate-400" />
                                    View Details & History
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                                  <Link href={`/inventory/${item.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2 text-slate-400" />
                                    Edit Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openIssueDialog(item.id)} className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                                  <ArrowRight className="h-4 w-4 mr-2 text-slate-400" />
                                  Issue to Guard
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openAdjustDialog(item.id)} className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                                  <RefreshCw className="h-4 w-4 mr-2 text-slate-400" />
                                  Adjust Stock Level
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                                  <Link href={`/inventory/${item.id}/history`}>
                                    <History className="h-4 w-4 mr-2 text-slate-400" />
                                    Movement History
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
