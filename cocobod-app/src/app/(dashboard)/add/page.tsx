import { prisma } from '@/lib/prisma'
import { Condition } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { PlusCircle, Package, ArrowLeft, AlertCircle } from 'lucide-react'

async function getCategories() {
  try {
    return await prisma.equipmentCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

async function addEquipment(formData: FormData): Promise<void> {
  'use server'

  const itemName = formData.get('itemName') as string
  const categoryId = formData.get('categoryId') as string
  const itemCode = formData.get('itemCode') as string
  const quantity = parseInt(formData.get('quantity') as string)
  const conditionStr = (formData.get('condition') as string) || 'GOOD'
  const storageLocation = formData.get('storageLocation') as string
  const remarks = formData.get('remarks') as string

  console.log('=== ADD EQUIPMENT SERVER ACTION ===')
  console.log('Data:', { itemName, categoryId, itemCode, quantity, condition: conditionStr, storageLocation, remarks })

  if (!itemName || !categoryId || !itemCode || isNaN(quantity) || quantity <= 0) {
    console.error('Missing or invalid required fields')
    return
  }

  let success = false

  try {
    const category = await prisma.equipmentCategory.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      console.error('Category not found:', categoryId)
      return
    }

    console.log('Category found:', category.name)

    const validCondition = (['GOOD', 'SLIGHTLY_DAMAGED', 'DAMAGED', 'MISSING'].includes(conditionStr) 
      ? conditionStr 
      : 'GOOD') as Condition

    const equipment = await prisma.equipment.create({
      data: {
        itemName,
        categoryId,
        itemCode,
        totalQuantity: quantity,
        availableQuantity: quantity,
        issuedQuantity: 0,
        damagedQuantity: 0,
        missingQuantity: 0,
        defaultCondition: validCondition,
        storageLocation,
        remarks,
      },
    })

    console.log('Equipment created successfully:', equipment.id, equipment.itemName, equipment.totalQuantity)

    revalidatePath('/dashboard')
    revalidatePath('/inventory')
    success = true
  } catch (error) {
    console.error('Error creating equipment:', error)
    return
  }

  if (success) {
    redirect('/inventory?success=true')
  }
}

export default async function AddEquipmentPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      {/* Page Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(52, 211, 153, 0.2) 0%, transparent 60%)' }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                New Entry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <PlusCircle className="h-7 w-7 text-emerald-400" />
              Add Equipment
            </h1>
            <p className="text-sm text-slate-300 mt-1">Register new equipment into the inventory system</p>
          </div>
          <Link href="/inventory">
            <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Inventory
            </Button>
          </Link>
        </div>
      </div>

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
          <form action={addEquipment} className="space-y-5">
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
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all duration-200 active:scale-[0.98]">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Equipment
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
