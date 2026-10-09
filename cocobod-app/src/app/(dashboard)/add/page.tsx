import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddEquipmentForm } from './AddEquipmentForm'

async function getCategories() {
  try {
    return await prisma.equipmentCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function AddEquipmentPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

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

      {/* Interactive Form with Toast Feedback and Pending State */}
      <AddEquipmentForm categories={categories} />

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
