'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, Package, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { useToast } from '@/components/ui/toast'

interface Category {
  id: string
  name: string
}

interface AddClientProps {
  categories: Category[]
}

export function AddClient({ categories }: AddClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const itemName = (form.elements.namedItem('itemName') as HTMLInputElement).value
    const categoryId = (form.elements.namedItem('categoryId') as HTMLSelectElement).value
    const itemCode = (form.elements.namedItem('itemCode') as HTMLInputElement).value
    const quantity = (form.elements.namedItem('quantity') as HTMLInputElement).value
    const condition = (form.elements.namedItem('condition') as HTMLSelectElement).value
    const storageLocation = (form.elements.namedItem('storageLocation') as HTMLInputElement).value
    const remarks = (form.elements.namedItem('remarks') as HTMLInputElement).value

    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName,
          categoryId,
          itemCode,
          quantity: parseInt(quantity),
          condition,
          storageLocation,
          remarks,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create equipment')
        toast.error(data.error || 'Failed to create equipment')
        setLoading(false)
        return
      }

      toast.success(`${itemName} added to inventory successfully`)
      router.push('/inventory?success=true')
      router.refresh()
    } catch (err) {
      const msg = 'Network error. Please check your connection.'
      setError(msg)
      toast.error(msg)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Modern Hero Header */}
      <PageHeader
        icon={PlusCircle}
        badge="New Inventory Entry"
        title="Add Equipment"
        description="Register and provision new security equipment and assets into the central database."
        color="emerald"
        stats={[
          { label: 'Active Categories', value: categories.length },
        ]}
        actions={
          <Link href="/inventory">
            <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Inventory
            </Button>
          </Link>
        }
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
          <div>
            <p className="font-medium text-red-900 dark:text-red-200">Error</p>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <Card className="group relative border border-slate-200/80 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600" />
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            Equipment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="itemName" className="text-slate-700 dark:text-slate-200 text-xs font-medium">Item Name *</Label>
                <Input
                  id="itemName"
                  name="itemName"
                  required
                  placeholder="e.g., 9mm Pistol"
                  className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemCode" className="text-slate-700 dark:text-slate-200 text-xs font-medium">Item Code *</Label>
                <Input
                  id="itemCode"
                  name="itemCode"
                  required
                  placeholder="e.g., WPN-001"
                  className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId" className="text-slate-700 dark:text-slate-200 text-xs font-medium">Category *</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                >
                  <option value="">Select category</option>
                  {categories.length === 0 ? (
                    <option value="" disabled>No categories available</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
                {categories.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">No categories found. Please create categories first.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-slate-700 dark:text-slate-200 text-xs font-medium">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  required
                  placeholder="e.g., 20"
                  className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition" className="text-slate-700 dark:text-slate-200 text-xs font-medium">Default Condition *</Label>
                <select
                  id="condition"
                  name="condition"
                  required
                  defaultValue="GOOD"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                >
                  <option value="GOOD">Good</option>
                  <option value="SLIGHTLY_DAMAGED">Slightly Damaged</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="MISSING">Missing</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storageLocation" className="text-slate-700 dark:text-slate-200 text-xs font-medium">Storage Location</Label>
                <Input
                  id="storageLocation"
                  name="storageLocation"
                  placeholder="e.g., Armory A"
                  className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks" className="text-slate-700 dark:text-slate-200 text-xs font-medium">Remarks</Label>
              <Input
                id="remarks"
                name="remarks"
                placeholder="Additional notes about the equipment"
                className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all duration-200 active:scale-[0.98]"
                onClick={() => console.log('Button clicked')}
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                {loading ? 'Adding...' : 'Add Equipment'}
              </Button>
              <Link href="/inventory">
                <Button type="button" variant="outline" className="dark:border-slate-700 dark:hover:bg-slate-800">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Database Connection Warning */}
      {categories.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-200">No Categories Available</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">Please create categories in System Settings before adding equipment.</p>
          </div>
        </div>
      )}
    </div>
  )
}
