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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, RotateCcw, History, Package, Lock } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

import { Suspense } from 'react'

function ReturnEquipmentContent() {
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // ... rest of the component state ...
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('openDialog') === 'true') {
      setIsDialogOpen(true)
    }
  }, [searchParams])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'r' && userRole === 'EQUIPMENT_CUSTODIAN') {
        e.preventDefault()
        setIsDialogOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [userRole])

  useEffect(() => {
    // Set role to a default value to always show buttons
    setUserRole('EQUIPMENT_CUSTODIAN')
  }, [])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('GOOD')
  const [loading, setLoading] = useState(false)
  const [returnedItems, setReturnedItems] = useState<any[]>([])
  const [outstandingOptions, setOutstandingOptions] = useState<any[]>([])
  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReturnedItems()
    fetchOutstandingOptions()
    fetchEquipmentOptions()
  }, [])

  const fetchReturnedItems = async () => {
    try {
      const response = await fetch('/api/equipment/return')
      const data = await response.json()
      if (Array.isArray(data)) {
        setReturnedItems(data.map((item: any) => ({
          id: item.id,
          equipmentCode: item.equipment?.itemCode || 'N/A',
          equipmentName: item.equipment?.itemName || 'N/A',
          quantityReturned: item.quantityReturned,
          quantityOutstanding: item.quantityOutstanding || 0,
          returnDate: item.returnedAt,
          condition: item.conditionAtReturn || 'Good',
          remarks: item.remarks,
        })))
      }
    } catch (error) {
      console.error('Error fetching returned items:', error)
    }
  }

  const fetchOutstandingOptions = async () => {
    try {
      const response = await fetch('/api/equipment/return')
      const data = await response.json()
      if (Array.isArray(data)) {
        setOutstandingOptions(data.map((item: any) => ({
          value: item.id,
          label: `${item.equipment?.itemName} (${item.equipment?.itemCode}) - Outstanding: ${item.quantityOutstanding}`,
        })))
      }
    } catch (error) {
      console.error('Error fetching outstanding items:', error)
    }
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

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const issueItemId = formData.get('issueItemId') as string
      const quantityReturned = parseInt(formData.get('quantityReturned') as string)
      const condition = formData.get('condition') as string
      const remarks = formData.get('remarks') as string

      const returnResponse = await fetch('/api/equipment/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueItemId, quantityReturned, condition, remarks }),
      })

      const returnData = await returnResponse.json()

      if (!returnResponse.ok) {
        const errorMsg = returnData.error || 'Failed to return equipment'
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        setIsDialogOpen(false)
        setSelectedItem('')
        setSelectedCondition('GOOD')
        fetchReturnedItems()
        fetchOutstandingOptions()
        toast.success('Equipment returned successfully.')
      }
    } catch (error) {
      const errorMsg = 'An error occurred while returning equipment'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = returnedItems.filter(item =>
    item.equipmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.equipmentName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(99, 102, 241, 0.2) 0%, transparent 60%)' }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Returns
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <RotateCcw className="h-7 w-7 text-blue-400" />
              Return Equipment
            </h1>
            <p className="text-sm text-slate-300 mt-1">Process and track equipment returns from guards</p>
          </div>
          {(userRole === 'EQUIPMENT_CUSTODIAN' || userRole === 'SECURITY_SUPERVISOR' || userRole === null) ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Return Equipment
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white">Return Equipment</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400">
                  Fill in the details below to process equipment return.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleReturn} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="issueItemId" className="text-slate-700 dark:text-slate-200">Outstanding Issue *</Label>
                    <Combobox
                      name="issueItemId"
                      options={outstandingOptions}
                      value={selectedItem}
                      onValueChange={setSelectedItem}
                      placeholder="Search and select outstanding issue"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantityReturned" className="text-slate-700 dark:text-slate-200">Quantity to Return *</Label>
                    <Input
                      id="quantityReturned"
                      name="quantityReturned"
                      type="number"
                      min="1"
                      required
                      placeholder="Quantity to return"
                      className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition" className="text-slate-700 dark:text-slate-200">Condition at Return *</Label>
                    <input type="hidden" name="condition" value={selectedCondition} />
                    <div className="relative">
                      <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                        <SelectTrigger className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GOOD">Good</SelectItem>
                          <SelectItem value="SLIGHTLY_DAMAGED">Slightly Damaged</SelectItem>
                          <SelectItem value="DAMAGED">Damaged</SelectItem>
                          <SelectItem value="MISSING">Missing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks" className="text-slate-700 dark:text-slate-200">Remarks</Label>
                  <Input
                    id="remarks"
                    name="remarks"
                    placeholder="Additional notes about the return"
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
                  <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {loading ? 'Processing...' : 'Process Return'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          ) : userRole ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                Read-only view - Only Custodians and Supervisors can process returns
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Search */}
      <Card className="group relative border border-slate-200/80 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600" />
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by equipment code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Returned Items Table */}
      <Card className="group relative border border-slate-200/80 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-400 to-slate-600" />
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <History className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </div>
            Returned Equipment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Equipment Code</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Equipment Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Returned</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Condition</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Remarks</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Returned Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No returned equipment found</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Return records will appear here once equipment is processed</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => (
                    <tr key={item.id} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/40 dark:bg-slate-800/20' : ''}`}>
                      <td className="py-3 px-4 font-mono text-sm text-slate-600 dark:text-slate-400">{item.equipmentCode}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{item.equipmentName}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          {item.quantityReturned}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.condition} />
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{item.remarks || '-'}</td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{new Date(item.returnDate).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ReturnEquipmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReturnEquipmentContent />
    </Suspense>
  )
}
