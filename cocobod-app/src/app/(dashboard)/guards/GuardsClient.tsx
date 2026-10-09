'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import {
  Shield,
  Package,
  Clock,
  CheckCircle,
  Search,
  User,
  Plus,
  Trash2,
  MapPin,
  Users,
  AlertCircle,
  ArrowLeftRight,
  CalendarClock,
  BadgeCheck,
  Layers,
  X,
  ChevronRight,
  Upload,
} from 'lucide-react'

interface IssueItem {
  id: string
  equipment: { id: string; itemName: string; itemCode: string; category: { name: string } }
  quantityIssued: number
  quantityReturned: number
  quantityOutstanding: number
  conditionAtIssue: string
  conditionAtReturn: string | null
  returnedAt: string | null
}

interface Issue {
  id: string
  custodian: { id: string; fullName: string; staffId: string }
  shift: string | null
  dutyPoint: string | null
  expectedReturnDate: string | null
  status: string
  issuedAt: string
  items: IssueItem[]
}

interface Booking {
  id: string
  equipment: { id: string; itemName: string; itemCode: string; category: { name: string } }
  quantityRequested: number
  requestedFor: string
  dutyPoint: string | null
  shift: string | null
  status: string
  decidedBy: { id: string; fullName: string; staffId: string } | null
  decidedAt: string | null
  expiresAt: string | null
  remarks: string | null
  createdAt: string
}

interface Guard {
  id: string
  fullName: string
  badgeId: string
  staffId: string | null
  contact: string | null
  status: string
  team: string | null
  shift: string | null
  photoUrl: string | null
  bookings: Booking[]
  issues: Issue[]
}

interface GuardsClientProps {
  guards: Guard[]
  userRole: string
}

export default function GuardsClient({ guards: initialGuards, userRole }: GuardsClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isSupervisor = userRole === 'SECURITY_SUPERVISOR'

  const [guards, setGuards] = useState<Guard[]>(initialGuards)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [guardToDelete, setGuardToDelete] = useState<Guard | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Add guard form state
  const [newGuard, setNewGuard] = useState({
    fullName: '',
    badgeId: '',
    staffId: '',
    contact: '',
    team: '',
    shift: '',
  })
  const [guardPhoto, setGuardPhoto] = useState<File | null>(null)
  const [guardPhotoPreview, setGuardPhotoPreview] = useState<string | null>(null)

  const filteredGuards = guards.filter(guard =>
    guard.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guard.badgeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (guard.staffId && guard.staffId.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const totalPages = Math.ceil(filteredGuards.length / itemsPerPage)
  const paginatedGuards = filteredGuards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  async function handleAddGuard(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/guards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuard),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to add guard')
        return
      }

      // Upload photo if provided
      if (guardPhoto) {
        const formData = new FormData()
        formData.append('photo', guardPhoto)
        const photoRes = await fetch(`/api/guards/${data.id}/photo`, {
          method: 'POST',
          body: formData,
        })
        if (photoRes.ok) {
          const photoData = await photoRes.json()
          data.photoUrl = photoData.photoUrl
        }
      }

      const added: Guard = { ...data, bookings: [], issues: [] }
      setGuards(prev => [...prev, added].sort((a, b) => a.fullName.localeCompare(b.fullName)))
      setIsAddDialogOpen(false)
      setNewGuard({ fullName: '', badgeId: '', staffId: '', contact: '', team: '', shift: '' })
      setGuardPhoto(null)
      setGuardPhotoPreview(null)
      toast.success(`Guard "${data.fullName}" added successfully.`)
    } catch {
      toast.error('Network error while adding guard')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setGuardPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setGuardPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleDeleteGuard() {
    if (!guardToDelete) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/guards/${guardToDelete.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to remove guard')
        return
      }
      setGuards(prev => prev.filter(g => g.id !== guardToDelete.id))
      setIsDeleteDialogOpen(false)
      setGuardToDelete(null)
      toast.success('Guard removed successfully.')
    } catch {
      toast.error('Network error while removing guard')
    } finally {
      setIsSubmitting(false)
    }
  }

  function openGuardDetail(guard: Guard) {
    router.push(`/guards/${guard.id}`)
  }

  function openDeleteConfirm(e: React.MouseEvent, guard: Guard) {
    e.stopPropagation()
    setGuardToDelete(guard)
    setIsDeleteDialogOpen(true)
  }

  const totalGuards = guards.length
  const guardsWithGear = guards.filter(g => g.issues.some(i => i.status === 'ISSUED')).length

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-slate-200 text-xs font-semibold mb-3 border border-white/20">
              <Shield className="h-3.5 w-3.5" />
              <span>Guard Registry</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Guards Portal</h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Track duty points, shifts, and equipment held by each security guard.
            </p>
          </div>
          {/* KPIs */}
          <div className="flex gap-4">
            <div className="text-center px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <p className="text-2xl font-bold">{totalGuards}</p>
              <p className="text-xs text-slate-300 mt-0.5">Active Guards</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <p className="text-2xl font-bold text-emerald-300">{guardsWithGear}</p>
              <p className="text-xs text-slate-300 mt-0.5">Holding Gear</p>
            </div>
          </div>
          {isSupervisor && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-md flex items-center gap-2 shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add Guard
            </Button>
          )}
          {isSupervisor && (
            <Button
              onClick={() => router.push('/guards/import')}
              variant="outline"
              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-950/30 font-semibold shadow-md flex items-center gap-2 shrink-0"
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
          )}
        </div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-slate-900/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name, badge ID, or staff ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10 border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white rounded-xl h-11"
        />
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredGuards.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
              <Users className="h-7 w-7 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">No guards found</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? 'Try a different search term.' : 'No active guards are registered.'}
            </p>
          </div>
        ) : (
          paginatedGuards.map(guard => {
            const activeIssue = guard.issues.find(i => i.status === 'ISSUED')
            const recentReturn = guard.issues.find(i => i.status === 'FULLY_RETURNED' || i.status === 'PARTIALLY_RETURNED')
            const displayIssue = activeIssue || recentReturn

            return (
              <Card
                key={guard.id}
                onClick={() => openGuardDetail(guard)}
                className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {guard.photoUrl ? (
                      <img
                        src={guard.photoUrl}
                        alt={guard.fullName}
                        className="h-12 w-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 shrink-0">
                        <Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">{guard.fullName}</p>
                          <p className="text-xs text-slate-500">{guard.badgeId}</p>
                        </div>
                        {activeIssue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                            Active
                          </span>
                        ) : displayIssue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                            <CheckCircle className="h-3 w-3" />
                            Returned
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs shrink-0">—</span>
                        )}
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                          <span>{guard.shift || displayIssue?.shift || 'No shift'}</span>
                        </div>
                        {displayIssue?.dutyPoint && (
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{displayIssue.dutyPoint}</span>
                          </div>
                        )}
                        {activeIssue && activeIssue.items.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {activeIssue.items.slice(0, 2).map((item, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                <Package className="h-3 w-3" />
                                {item.equipment.itemName} ×{item.quantityOutstanding}
                              </span>
                            ))}
                            {activeIssue.items.length > 2 && (
                              <span className="text-xs text-slate-500">+{activeIssue.items.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden lg:block border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Guard</th>
                <th className="px-5 py-3.5 font-semibold">Shift</th>
                <th className="px-5 py-3.5 font-semibold">Duty Point</th>
                <th className="px-5 py-3.5 font-semibold">Items in Possession</th>
                <th className="px-5 py-3.5 font-semibold">Issued At</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredGuards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                      <Users className="h-7 w-7 text-slate-400" />
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No guards found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery ? 'Try a different search term.' : 'No active guards are registered.'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedGuards.map(guard => {
                  const activeIssue = guard.issues.find(i => i.status === 'ISSUED')
                  const recentReturn = guard.issues.find(i => i.status === 'FULLY_RETURNED' || i.status === 'PARTIALLY_RETURNED')
                  const displayIssue = activeIssue || recentReturn

                  return (
                    <tr
                      key={guard.id}
                      onClick={() => openGuardDetail(guard)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {guard.photoUrl ? (
                            <img
                              src={guard.photoUrl}
                              alt={guard.fullName}
                              className="h-10 w-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                              <Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{guard.fullName}</p>
                            <p className="text-[11px] text-slate-500">{guard.badgeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {(guard.shift || displayIssue?.shift) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <CalendarClock className="h-3 w-3" />
                            {guard.shift || displayIssue?.shift}
                          </span>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {displayIssue?.dutyPoint ? (
                          <span className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {displayIssue.dutyPoint}
                          </span>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {activeIssue ? (
                          <div className="flex flex-wrap gap-1">
                            {activeIssue.items.map((item, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                <Package className="h-3 w-3" />
                                {item.equipment.itemName} ×{item.quantityOutstanding}
                              </span>
                            ))}
                          </div>
                        ) : <span className="text-slate-400 text-xs italic">None</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {displayIssue?.issuedAt ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(displayIssue.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <span className="text-slate-400">
                              {new Date(displayIssue.issuedAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {activeIssue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                            Holding Gear
                          </span>
                        ) : displayIssue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle className="h-3 w-3" />
                            Returned
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => {
                              e.stopPropagation()
                              openGuardDetail(guard)
                            }}
                            className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          >
                            View
                          </Button>
                          {isSupervisor && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={e => openDeleteConfirm(e, guard)}
                              className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination - Shared for both mobile and desktop */}
      {totalPages > 1 && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredGuards.length)} of {filteredGuards.length} guards
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="dark:border-slate-700 dark:hover:bg-slate-700 h-8 px-3"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'dark:border-slate-700 dark:hover:bg-slate-700'}`}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="dark:border-slate-700 dark:hover:bg-slate-700 h-8 px-3"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ─── Add Guard Dialog ─── */}
      {isSupervisor && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">Add New Guard</DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">Register a guard to the system.</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <form onSubmit={handleAddGuard} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold">Guard Photo</Label>
                  <div className="flex items-center gap-4">
                    {guardPhotoPreview ? (
                      <img
                        src={guardPhotoPreview}
                        alt="Preview"
                        className="h-20 w-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                        <Shield className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-lg"
                      />
                      <p className="text-xs text-slate-500 mt-1">Optional - Max 5MB</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold">Full Name *</Label>
                  <Input
                    required
                    value={newGuard.fullName}
                    onChange={e => setNewGuard(p => ({ ...p, fullName: e.target.value }))}
                    placeholder="e.g. John Mensah"
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Badge ID *</Label>
                  <Input
                    required
                    value={newGuard.badgeId}
                    onChange={e => setNewGuard(p => ({ ...p, badgeId: e.target.value }))}
                    placeholder="e.g. GRD-001"
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Staff ID</Label>
                  <Input
                    value={newGuard.staffId}
                    onChange={e => setNewGuard(p => ({ ...p, staffId: e.target.value }))}
                    placeholder="Optional"
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Shift</Label>
                  <Select value={newGuard.shift} onValueChange={v => setNewGuard(p => ({ ...p, shift: v }))}>
                    <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-lg">
                      <SelectValue placeholder="Select shift..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAY">Day</SelectItem>
                      <SelectItem value="NIGHT">Night</SelectItem>
                      <SelectItem value="SWING">Swing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Team</Label>
                  <Input
                    value={newGuard.team}
                    onChange={e => setNewGuard(p => ({ ...p, team: e.target.value }))}
                    placeholder="e.g. Alpha"
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-lg"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold">Contact</Label>
                  <Input
                    value={newGuard.contact}
                    onChange={e => setNewGuard(p => ({ ...p, contact: e.target.value }))}
                    placeholder="Phone number (optional)"
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white rounded-lg"
                  />
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="dark:border-slate-700">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isSubmitting ? 'Adding...' : 'Add Guard'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── Delete Confirm Dialog ─── */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Remove Guard</DialogTitle>
                <DialogDescription className="text-xs text-slate-500">This will deactivate the guard record.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <p className="text-sm text-slate-700 dark:text-slate-300 py-2">
            Are you sure you want to remove <strong>{guardToDelete?.fullName}</strong>? Guards with active equipment issues cannot be removed.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="dark:border-slate-700">Cancel</Button>
            <Button
              onClick={handleDeleteGuard}
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isSubmitting ? 'Removing...' : 'Remove Guard'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
