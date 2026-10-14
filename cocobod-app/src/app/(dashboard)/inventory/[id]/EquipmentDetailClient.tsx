'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import {
  ArrowLeft,
  Package,
  Calendar,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  History,
  TrendingUp,
  MapPin,
  Warehouse,
} from 'lucide-react'

interface EquipmentDetailClientProps {
  equipment: any
  userRole: string
}

export default function EquipmentDetailClient({ equipment, userRole }: EquipmentDetailClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ISSUED': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
      case 'RETURNED': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
      case 'DAMAGED': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
      case 'MISSING': return 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300'
      case 'ADJUSTED': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'GOOD': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
      case 'SLIGHTLY_DAMAGED': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
      case 'DAMAGED': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
      case 'MISSING': return 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'ISSUED': return <ArrowLeft className="h-4 w-4 text-emerald-600" />
      case 'RETURNED': return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'DAMAGED': return <AlertTriangle className="h-4 w-4 text-rose-600" />
      case 'MISSING': return <XCircle className="h-4 w-4 text-orange-600" />
      case 'ADJUSTED': return <TrendingUp className="h-4 w-4 text-purple-600" />
      default: return <Clock className="h-4 w-4 text-slate-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Modern Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Inventory', href: '/inventory' },
          { label: equipment.itemName },
        ]}
      />

      {/* Contextual Hero Header */}
      <PageHeader
        icon={Package}
        badge={equipment.itemCode}
        title={equipment.itemName}
        subtitle={
          equipment.category
            ? `Category: ${equipment.category.name} • Location: ${equipment.storageLocation || 'Main Armory'}`
            : `Storage Location: ${equipment.storageLocation || 'Main Armory'}`
        }
        color="teal"
        stats={[
          { label: 'Total Units', value: equipment.totalQuantity },
          { label: 'Available', value: equipment.availableQuantity, highlight: equipment.availableQuantity > 0 },
          { label: 'Currently Issued', value: equipment.issuedQuantity },
          { label: 'Condition', value: equipment.defaultCondition || 'GOOD' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push('/inventory')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              All Inventory
            </Button>
            {equipment.availableQuantity > 0 && (
              <Link href={`/issue`}>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                  Issue Gear
                </Button>
              </Link>
            )}
          </div>
        }
      />
      {/* Tabs */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              onClick={() => setActiveTab('overview')}
              className="dark:border-slate-700"
            >
              <Package className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'outline'}
              onClick={() => setActiveTab('history')}
              className="dark:border-slate-700"
            >
              <History className="h-4 w-4 mr-2" />
              Condition Timeline
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Damaged</p>
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{equipment.damagedQuantity}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Missing</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{equipment.missingQuantity}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Reserved</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{equipment.reservedQuantity}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Low Stock Threshold</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{equipment.lowStockThreshold || 'N/A'}</p>
                </div>
              </div>
              {equipment.remarks && (
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Remarks</p>
                  <p className="text-sm text-slate-900 dark:text-white">{equipment.remarks}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {equipment.movements.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No Movement History"
                  description="This item has not been issued, returned, or transferred yet."
                  className="py-12"
                />
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800" />

                  {equipment.movements.map((movement: any, index: number) => (
                    <div key={movement.id} className="relative pl-16 pb-8 last:pb-0">
                      {/* Timeline dot */}
                      <div className="absolute left-4 top-0 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center">
                        {getActionIcon(movement.action)}
                      </div>

                      <Card className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(movement.action)}>
                                {movement.action}
                              </Badge>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(movement.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {movement.condition && (
                              <Badge className={getConditionColor(movement.condition)}>
                                {movement.condition}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500 dark:text-slate-400">Quantity</p>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                              </p>
                            </div>
                            {movement.guard && (
                              <div>
                                <p className="text-slate-500 dark:text-slate-400">Guard</p>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {movement.guard.fullName}
                                </p>
                              </div>
                            )}
                            {movement.movedBy && (
                              <div>
                                <p className="text-slate-500 dark:text-slate-400">Processed By</p>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {movement.movedBy.fullName}
                                </p>
                              </div>
                            )}
                            {movement.dutyPoint && (
                              <div>
                                <p className="text-slate-500 dark:text-slate-400">Duty Point</p>
                                <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {movement.dutyPoint}
                                </p>
                              </div>
                            )}
                          </div>

                          {movement.remarks && (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Remarks</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{movement.remarks}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
