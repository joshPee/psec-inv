import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { Eye, Edit, ArrowRight, History, MoreVertical } from 'lucide-react'
import InventoryClient from './inventory/InventoryClient'
import { Suspense } from 'react'

async function getEquipment(search?: string, category?: string) {
  try {
    const where: any = {}
    
    if (search) {
      where.OR = [
        { itemName: { contains: search, mode: 'insensitive' } },
        { itemCode: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (category) {
      where.category = {
        name: category
      }
    }

    const equipment = await prisma.equipment.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { itemName: 'asc' },
    })

    const categories = await prisma.equipmentCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    return { equipment, categories }
  } catch (error) {
    console.error('Database connection error:', error)
    return { equipment: [], categories: [] }
  }
}

export default async function EquipmentInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; success?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const { equipment, categories } = await getEquipment(resolvedSearchParams.search, resolvedSearchParams.category)

  return (
    <Suspense fallback={<div>Loading inventory...</div>}>
      <InventoryClient 
        equipment={equipment} 
        categories={categories} 
        initialSearch={resolvedSearchParams.search} 
        initialCategory={resolvedSearchParams.category}
        showSuccessToast={resolvedSearchParams.success === 'true'}
      />
    </Suspense>
  )
}
