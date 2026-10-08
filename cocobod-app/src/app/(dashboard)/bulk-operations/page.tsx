'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'
import { Plus, Trash2, Package, ArrowRight, Layers, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export default function BulkOperationsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'issue' | 'return'>('issue')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Issue form state
  const [selectedGuard, setSelectedGuard] = useState('')
  const [issueItems, setIssueItems] = useState<any[]>([])
  const [guardOptions, setGuardOptions] = useState<any[]>([])
  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([])

  // Return form state
  const [returnItems, setReturnItems] = useState<any[]>([])
  const [outstandingOptions, setOutstandingOptions] = useState<any[]>([])

  useEffect(() => {
    fetchGuardOptions()
    fetchEquipmentOptions()
    fetchOutstandingOptions()
  }, [])

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

  const fetchEquipmentOptions = async () => {
    try {
      const response = await fetch('/api/equipment')
      const data = await response.json()
      if (Array.isArray(data)) {
        setEquipmentOptions(data.map((eq: any) => ({
          value: eq.id,
          label: `${eq.itemName} (${eq.itemCode}) - Available: ${eq.availableQuantity}`,
          available: eq.availableQuantity,
        })))
      }
    } catch (error) {
      console.error('Error fetching equipment:', error)
    }
  }

  const fetchOutstandingOptions = async () => {
    try {
      const response = await fetch('/api/equipment/return')
      const data = await response.json()
      if (Array.isArray(data)) {
        setOutstandingOptions(data.map((item: any) => ({
          value: item.id,
          label: `${item.equipmentName} - Outstanding: ${item.quantityOutstanding}`,
          equipmentName: item.equipmentName,
          quantityOutstanding: item.quantityOutstanding,
        })))
      }
    } catch (error) {
      console.error('Error fetching outstanding items:', error)
    }
  }

  const addIssueItem = () => {
    setIssueItems([...issueItems, { equipmentId: '', quantity: 1, condition: 'GOOD', remarks: '' }])
  }

  const removeIssueItem = (index: number) => {
    setIssueItems(issueItems.filter((_, i) => i !== index))
  }

  const updateIssueItem = (index: number, field: string, value: any) => {
    const updated = [...issueItems]
    updated[index] = { ...updated[index], [field]: value }
    setIssueItems(updated)
  }

  const addReturnItem = () => {
    setReturnItems([...returnItems, { issueItemId: '', quantityReturned: 1, condition: 'GOOD', remarks: '' }])
  }

  const removeReturnItem = (index: number) => {
    setReturnItems(returnItems.filter((_, i) => i !== index))
  }

  const updateReturnItem = (index: number, field: string, value: any) => {
    const updated = [...returnItems]
    updated[index] = { ...updated[index], [field]: value }
    setReturnItems(updated)
  }

  const handleBulkIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!selectedGuard || issueItems.length === 0) {
      const msg = 'Please select a guard and add at least one item'
      setError(msg)
      toast.error(msg)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/equipment/bulk-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardId: selectedGuard,
          items: issueItems,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to perform bulk issue'
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        const successMsg = `Successfully issued ${data.itemsIssued} items`
        setSuccess(successMsg)
        toast.success(successMsg)
        setSelectedGuard('')
        setIssueItems([])
        setTimeout(() => setSuccess(''), 4000)
      }
    } catch (error) {
      const errorMsg = 'An error occurred while performing bulk issue'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkReturn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (returnItems.length === 0) {
      const errorMsg = 'Please add at least one item to return'
      setError(errorMsg)
      toast.error(errorMsg)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/equipment/bulk-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returns: returnItems }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to perform bulk return'
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        const successMsg = `Successfully returned ${data.itemsReturned} items`
        setSuccess(successMsg)
        toast.success(successMsg)
        setReturnItems([])
        fetchOutstandingOptions()
        setTimeout(() => setSuccess(''), 4000)
      }
    } catch (error) {
      const errorMsg = 'An error occurred while performing bulk return'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className={`relative overflow-hidden rounded-2xl p-6 md:p-8 text-white shadow-lg transition-all duration-500 ${
        activeTab === 'issue'
          ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700'
          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold mb-3 border border-white/20">
              <Layers className="h-3.5 w-3.5" />
              <span>Batch Operations Hub</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              {activeTab === 'issue' ? 'Bulk Equipment Issuance' : 'Bulk Equipment Return'}
            </h1>
            <p className="mt-1 text-sm md:text-base text-white/90 max-w-xl">
              {activeTab === 'issue'
                ? 'Assign multiple security equipment items to a single security personnel in one streamlined batch.'
                : 'Reconcile and accept multiple outstanding equipment items simultaneously back into inventory.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-black/20 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
            <button
              type="button"
              onClick={() => setActiveTab('issue')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'issue'
                  ? 'bg-white text-emerald-700 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              Bulk Issue
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('return')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'return'
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Bulk Return
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-sm">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === 'issue' ? (
        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Issue Batch Configuration
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select the recipient guard and specify line items to deploy
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                {issueItems.length} {issueItems.length === 1 ? 'item' : 'items'} queued
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleBulkIssue} className="space-y-6">
              <div className="space-y-2 max-w-xl">
                <Label htmlFor="guard" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Guard / Personnel *
                </Label>
                <Combobox
                  name="guard"
                  options={guardOptions}
                  value={selectedGuard}
                  onValueChange={(value: string) => setSelectedGuard(value)}
                  placeholder="Search and select security guard"
                  required
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Line Items to Issue
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addIssueItem}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 rounded-lg shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Equipment
                  </Button>
                </div>

                {issueItems.length === 0 ? (
                  <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                    <Package className="h-8 w-8 mx-auto text-slate-400 mb-2 opacity-60" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No items added yet. Click &quot;Add Equipment&quot; above to add lines to this batch.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {issueItems.map((item, index) => (
                      <div
                        key={index}
                        className="group relative rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-850/60 p-4 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold mt-1">
                            {index + 1}
                          </span>

                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 flex-1">
                            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                              <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                Equipment *
                              </Label>
                              <Combobox
                                options={equipmentOptions}
                                value={item.equipmentId}
                                onValueChange={(value: string) => updateIssueItem(index, 'equipmentId', value)}
                                placeholder="Select item"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                Quantity *
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateIssueItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                className="h-9 text-xs dark:bg-slate-800 dark:text-white rounded-lg"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                Condition
                              </Label>
                              <select
                                className="w-full h-9 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={item.condition}
                                onChange={(e) => updateIssueItem(index, 'condition', e.target.value)}
                              >
                                <option value="GOOD">Good</option>
                                <option value="SLIGHTLY_DAMAGED">Slightly Damaged</option>
                                <option value="DAMAGED">Damaged</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                Remarks
                              </Label>
                              <Input
                                value={item.remarks}
                                onChange={(e) => updateIssueItem(index, 'remarks', e.target.value)}
                                placeholder="Optional notes"
                                className="h-9 text-xs dark:bg-slate-800 dark:text-white rounded-lg"
                              />
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeIssueItem(index)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                            title="Remove Line"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="submit"
                  disabled={loading || issueItems.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto px-8 font-semibold shadow-md transition-all"
                >
                  {loading ? 'Processing Issuance...' : `Confirm & Issue ${issueItems.length} Items`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Return Batch Configuration
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select outstanding items to return to storage
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                {returnItems.length} {returnItems.length === 1 ? 'item' : 'items'} queued
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleBulkReturn} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Outstanding Items to Return
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addReturnItem}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 rounded-lg shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Return Line
                  </Button>
                </div>

                {returnItems.length === 0 ? (
                  <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                    <ArrowRight className="h-8 w-8 mx-auto text-slate-400 mb-2 opacity-60" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No returns queued. Click &quot;Add Return Line&quot; above to select outstanding items.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {returnItems.map((item, index) => (
                      <div
                        key={index}
                        className="group relative rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-850/60 p-4 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold mt-1">
                            {index + 1}
                          </span>

                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 flex-1">
                            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                              <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                Outstanding Record *
                              </Label>
                              <Combobox
                                options={outstandingOptions}
                                value={item.issueItemId}
                                onValueChange={(value: string) => updateReturnItem(index, 'issueItemId', value)}
                                placeholder="Select outstanding item"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                Qty to Return *
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantityReturned}
                                onChange={(e) => updateReturnItem(index, 'quantityReturned', parseInt(e.target.value) || 1)}
                                className="h-9 text-xs dark:bg-slate-800 dark:text-white rounded-lg"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                Condition
                              </Label>
                              <select
                                className="w-full h-9 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={item.condition}
                                onChange={(e) => updateReturnItem(index, 'condition', e.target.value)}
                              >
                                <option value="GOOD">Good / Functional</option>
                                <option value="SLIGHTLY_DAMAGED">Slightly Damaged</option>
                                <option value="DAMAGED">Damaged</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                Remarks
                              </Label>
                              <Input
                                value={item.remarks}
                                onChange={(e) => updateReturnItem(index, 'remarks', e.target.value)}
                                placeholder="Optional notes"
                                className="h-9 text-xs dark:bg-slate-800 dark:text-white rounded-lg"
                              />
                            </div>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeReturnItem(index)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                            title="Remove Line"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="submit"
                  disabled={loading || returnItems.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto px-8 font-semibold shadow-md transition-all"
                >
                  {loading ? 'Processing Returns...' : `Confirm & Return ${returnItems.length} Items`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
