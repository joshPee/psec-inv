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
import { Eye, Edit, ArrowRight, History, MoreVertical, Plus, CheckCircle, X, Package, RefreshCw, Minus } from 'lucide-react'

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

  return (
    <div className="space-y-6">

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(20, 184, 166, 0.3) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(45, 212, 191, 0.2) 0%, transparent 60%)' }} />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/30 text-teal-200 border border-teal-400/30">
                Master Catalog
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
              <Package className="h-7 w-7 text-teal-400" />
              Equipment Inventory
            </h1>
            <p className="text-sm text-slate-300 mt-1">Manage all equipment in the system</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm">
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
      </div>

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

      {/* Filters */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const search = formData.get('search') as string
            const category = formData.get('category') as string
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (category) params.set('category', category)
            router.push(`/inventory?${params.toString()}`)
          }} className="flex flex-col sm:flex-row gap-3">
            <Input
              name="search"
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-full sm:max-w-sm border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <select
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Categories</option>
              {categories.filter(c => c.isActive).map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">Filter</Button>
          </form>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Equipment Inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Item Code</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Item Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Available</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Issued</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Damaged</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Missing</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {localEquipment.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No equipment found
                    </td>
                  </tr>
                ) : (
                  localEquipment.map((item) => {
                    const status = item.availableQuantity > 0 ? 'Available' :
                                   item.reservedQuantity > 0 ? 'Reserved' :
                                   item.issuedQuantity > 0 ? 'Issued' :
                                   item.damagedQuantity > 0 ? 'Damaged' : 'Missing'

                    const isLowStock = item.lowStockThreshold && item.availableQuantity <= item.lowStockThreshold

                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          isLowStock ? 'bg-amber-50 dark:bg-amber-950/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono text-sm text-slate-600 dark:text-slate-400">{item.itemCode}</td>
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                          {item.itemName}
                          {isLowStock && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                              Low Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.category?.name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">{item.totalQuantity}</td>
                        <td className={`py-3 px-4 font-semibold ${isLowStock ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {item.availableQuantity}
                          {item.lowStockThreshold && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
                              (min: {item.lowStockThreshold})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">{item.issuedQuantity}</td>
                        <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">{item.damagedQuantity}</td>
                        <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">{item.missingQuantity}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={status} />
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
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
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openIssueDialog(item.id)} className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <ArrowRight className="h-4 w-4 mr-2 text-slate-400" />
                                Issue Equipment
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openAdjustDialog(item.id)} className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <RefreshCw className="h-4 w-4 mr-2 text-slate-400" />
                                Adjust Stock
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <Link href={`/inventory/${item.id}/history`}>
                                  <History className="h-4 w-4 mr-2 text-slate-400" />
                                  View History
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
