'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { PlusCircle, Package, Loader2 } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface AddEquipmentFormProps {
  categories: Category[]
}

export function AddEquipmentForm({ categories }: AddEquipmentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    itemName: '',
    itemCode: '',
    categoryId: '',
    quantity: '',
    condition: 'GOOD',
    storageLocation: '',
    remarks: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const qty = parseInt(formData.quantity, 10)
    if (!formData.itemName.trim() || !formData.itemCode.trim() || !formData.categoryId || isNaN(qty) || qty <= 0) {
      toast.error('Please fill in all required fields with valid values.')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: formData.itemName.trim(),
          itemCode: formData.itemCode.trim().toUpperCase(),
          categoryId: formData.categoryId,
          quantity: qty,
          condition: formData.condition,
          storageLocation: formData.storageLocation.trim() || null,
          remarks: formData.remarks.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create equipment')
      }

      toast.success(`"${formData.itemName}" added successfully!`)
      router.push('/inventory?success=true')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while creating equipment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="group relative border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm overflow-hidden rounded-2xl">
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
                disabled={submitting}
                value={formData.itemName}
                onChange={handleChange}
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
                disabled={submitting}
                value={formData.itemCode}
                onChange={handleChange}
                placeholder="e.g., WPN-001"
                className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono uppercase focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-slate-700 dark:text-slate-200 text-xs font-medium">Category *</Label>
              <select
                id="categoryId"
                name="categoryId"
                required
                disabled={submitting}
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
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
                disabled={submitting}
                value={formData.quantity}
                onChange={handleChange}
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
                disabled={submitting}
                value={formData.condition}
                onChange={handleChange}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
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
                disabled={submitting}
                value={formData.storageLocation}
                onChange={handleChange}
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
              disabled={submitting}
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Additional notes about the equipment"
              className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all duration-200 active:scale-[0.98]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Equipment...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Equipment
                </>
              )}
            </Button>
            <Link href="/inventory">
              <Button type="button" variant="outline" disabled={submitting} className="dark:border-slate-700 dark:hover:bg-slate-800">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
