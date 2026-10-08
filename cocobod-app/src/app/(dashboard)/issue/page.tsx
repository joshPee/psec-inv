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
import { Plus, Search, ShieldAlert, Lock, ArrowRight } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

import { Suspense } from 'react'

function IssueEquipmentContent() {
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
      if (e.ctrlKey && e.key === 'i' && userRole === 'EQUIPMENT_CUSTODIAN') {
        e.preventDefault()
        setIsDialogOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [userRole])

  useEffect(() => {
    // Fetch user role
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => {
        if (data.role) {
          setUserRole(data.role)
        }
      })
      .catch(console.error)
  }, [])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEquipment, setSelectedEquipment] = useState('')
  const [selectedGuard, setSelectedGuard] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('GOOD')
  const [selectedShift, setSelectedShift] = useState('DAY')
  const [loading, setLoading] = useState(false)
  const [issuedItems, setIssuedItems] = useState<any[]>([])
  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([])
  const [guardOptions, setGuardOptions] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchIssuedItems()
    fetchEquipmentOptions()
    fetchGuardOptions()
  }, [])

  const fetchIssuedItems = async () => {
    try {
      const response = await fetch('/api/equipment/issue')
      const data = await response.json()
      if (Array.isArray(data)) {
        setIssuedItems(data.map((issue: any) => ({
          id: issue.id,
          equipmentCode: issue.items?.[0]?.equipment?.itemCode || 'N/A',
          equipmentName: issue.items?.[0]?.equipment?.itemName || 'N/A',
          quantity: issue.items?.[0]?.quantityIssued || 0,
          issuedDate: issue.issuedAt,
          condition: issue.items?.[0]?.conditionAtIssue || 'Good',
          shift: issue.shift || 'DAY',
          dutyPoint: issue.dutyPoint || '—',
          custodianName: issue.custodian?.fullName || 'N/A',
          guardName: issue.guard ? `${issue.guard.fullName} (${issue.guard.staffId})` : 'N/A',
        })))
      }
    } catch (error) {
      console.error('Error fetching issued items:', error)
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

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const equipmentId = selectedEquipment || (formData.get('equipmentId') as string)
      const guardId = selectedGuard || (formData.get('guardId') as string)
      const quantity = parseInt(formData.get('quantity') as string)
      const condition = selectedCondition || (formData.get('condition') as string)
      const shift = selectedShift || (formData.get('shift') as string)
      const dutyPoint = (formData.get('dutyPoint') as string) || ''
      const remarks = (formData.get('remarks') as string) || ''

      if (!equipmentId) {
        setError('Please select an equipment item.')
        setLoading(false)
        return
      }

      if (!guardId) {
        setError('Please select a security guard.')
        setLoading(false)
        return
      }

      if (!quantity || quantity < 1) {
        setError('Please enter a valid quantity greater than 0.')
        setLoading(false)
        return
      }

      const response = await fetch('/api/equipment/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentId, guardId, quantity, condition, shift, dutyPoint, remarks }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to issue equipment'
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        setIsDialogOpen(false)
        setSelectedEquipment('')
        setSelectedGuard('')
        setSelectedCondition('GOOD')
        setSelectedShift('DAY')
        fetchIssuedItems()
        fetchEquipmentOptions()
        toast.success('Equipment issued successfully.')
      }
    } catch (error) {
      const errorMsg = 'An error occurred while issuing equipment'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = issuedItems.filter(item =>
    item.equipmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.guardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.custodianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.dutyPoint.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(52, 211, 153, 0.2) 0%, transparent 60%)' }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                Equipment Distribution
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <ArrowRight className="h-7 w-7 text-emerald-400" />
              Issue Equipment
            </h1>
            <p className="text-sm text-slate-300 mt-1">View and manage equipment issued to staff</p>
          </div>
          {userRole === 'EQUIPMENT_CUSTODIAN' ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Issue Equipment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-slate-900 dark:text-white">Issue Equipment</DialogTitle>
                  <DialogDescription className="text-slate-500 dark:text-slate-400">
                    Fill in the details below to issue equipment.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleIssue} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="equipmentId" className="text-slate-700 dark:text-slate-300">Equipment *</Label>
                  <Combobox
                    name="equipmentId"
                    options={equipmentOptions}
                    value={selectedEquipment}
                    onValueChange={setSelectedEquipment}
                    placeholder="Search and select equipment..."
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="guardId" className="text-slate-700 dark:text-slate-300">Issued To (Security Guard / Officer) *</Label>
                  <Combobox
                    name="guardId"
                    options={guardOptions}
                    value={selectedGuard}
                    onValueChange={setSelectedGuard}
                    placeholder="Search and select security guard..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-slate-700 dark:text-slate-300">Quantity *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    required
                    placeholder="Quantity to issue"
                    className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition" className="text-slate-700 dark:text-slate-300">Condition at Issue *</Label>
                  <input type="hidden" name="condition" value={selectedCondition} />
                  <div className="relative">
                    <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                      <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GOOD">Good</SelectItem>
                        <SelectItem value="SLIGHTLY_DAMAGED">Slightly Damaged</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shift" className="text-slate-700 dark:text-slate-300">Shift *</Label>
                  <input type="hidden" name="shift" value={selectedShift} />
                  <div className="relative">
                    <Select value={selectedShift} onValueChange={setSelectedShift}>
                      <SelectTrigger className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAY">Day</SelectItem>
                        <SelectItem value="NIGHT">Night</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="dutyPoint" className="text-slate-700 dark:text-slate-300">Duty Point</Label>
                  <Input
                    id="dutyPoint"
                    name="dutyPoint"
                    placeholder="e.g., Main Gate, Perimeter, Control Room"
                    className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks" className="text-slate-700 dark:text-slate-300">Remarks</Label>
                <textarea
                  id="remarks"
                  name="remarks"
                  placeholder="Additional notes (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  {loading ? 'Issuing...' : 'Issue Equipment'}
                </Button>
              </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : userRole === 'SECURITY_SUPERVISOR' ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                Read-only view - Only Custodians can issue equipment
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Search */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-2.5" />
            <Input
              placeholder="Search by equipment code, name, guard, or custodian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Issued Items Table */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Issued Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Equipment Code</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Equipment Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Issued To</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Custodian</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Condition</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Shift</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Duty Point</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Issued Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No issued equipment found
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm text-slate-600 dark:text-slate-300">{item.equipmentCode}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{item.equipmentName}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{item.guardName}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.custodianName}</td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">{item.quantity}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.condition} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.shift} />
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.dutyPoint}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <div className="flex flex-col">
                          <span>{new Date(item.issuedDate).toLocaleDateString()}</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{new Date(item.issuedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
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

export default function IssueEquipmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IssueEquipmentContent />
    </Suspense>
  )
}
