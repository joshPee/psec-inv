import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddEquipmentForm } from './AddEquipmentForm'
import { PageHeader } from '@/components/ui/page-header'

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
