'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { Calendar, Plus, CheckCircle, X, Clock, AlertCircle, Package, ArrowRight, MoreVertical, CalendarClock } from 'lucide-react'

interface Booking {
  id: string
  guard: { id: string; fullName: string; badgeId: string; staffId: string | null }
  equipment: { id: string; itemName: string; itemCode: string; category: { name: string } }
  quantityRequested: number
  requestedFor: string
  dutyPoint: string | null
  shift: string | null
  status: 'PENDING' | 'APPROVED' | 'FULFILLED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED'
  decidedBy: { id: string; fullName: string; staffId: string } | null
  decidedAt: string | null
  expiresAt: string | null
  remarks: string | null
  createdAt: string
}

interface Summary {
  pending: number
  approved: number
  fulfilled: number
  reservedStock: number
  fulfilledToday: number
}

export default function BookingsClient({ bookings, summary }: { bookings: Booking[], summary: Summary }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isFulfillDialogOpen, setIsFulfillDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'fulfilled' | 'cancelled'>('pending')
  const [guards, setGuards] = useState<any[]>([])
  const [equipment, setEquipment] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/guards').then(res => res.json()),
      fetch('/api/equipment').then(res => res.json())
    ]).then(([guardsData, equipmentData]) => {
      if (Array.isArray(guardsData)) setGuards(guardsData)
      if (Array.isArray(equipmentData)) setEquipment(equipmentData)
    }).catch(err => console.error('Error loading data:', err))
  }, [])

  const filteredBookings = bookings.filter(booking => {
    switch (activeTab) {
      case 'pending': return booking.status === 'PENDING'
      case 'approved': return booking.status === 'APPROVED'
      case 'fulfilled': return booking.status === 'FULFILLED'
      case 'cancelled': return ['REJECTED', 'CANCELLED', 'EXPIRED'].includes(booking.status)
      default: return true
    }
  })

  async function handleCreateBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const guardId = formData.get('guardId') as string
    const equipmentId = formData.get('equipmentId') as string
    const quantityRequested = parseInt(formData.get('quantityRequested') as string)
    const requestedFor = formData.get('requestedFor') as string
    const dutyPoint = formData.get('dutyPoint') as string
    const shift = formData.get('shift') as string
    const remarks = formData.get('remarks') as string

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardId,
          equipmentId,
          quantityRequested,
          requestedFor,
          dutyPoint,
          shift,
          remarks,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to create booking.')
        return
      }

      setIsCreateDialogOpen(false)
      toast.success('Booking created successfully.')
      router.refresh()
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Network error occurred while creating booking.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleBookingAction(bookingId: string, action: string, remarks?: string) {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, remarks }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to process booking action.')
        return
      }

      toast.success(data.message || 'Booking processed successfully.')
      setIsFulfillDialogOpen(false)
      setSelectedBooking(null)
      router.refresh()
    } catch (error) {
      console.error('Error processing booking:', error)
      toast.error('Network error occurred while processing booking.')
    }
  }

  function openFulfillDialog(booking: Booking) {
    setSelectedBooking(booking)
    setIsFulfillDialogOpen(true)
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
      case 'APPROVED': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
      case 'FULFILLED': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
      case 'CANCELLED': return 'bg-slate-100 text-slate-800 dark:bg-slate-950/50 dark:text-slate-300'
      case 'EXPIRED': return 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(34, 211, 238, 0.2) 0%, transparent 60%)' }} />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/30 text-cyan-200 border border-cyan-400/30">
                Reservations
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
              <CalendarClock className="h-7 w-7 text-cyan-400" />
              Bookings Queue
            </h1>
            <p className="text-sm text-slate-300 mt-1">Manage equipment reservations and advance bookings</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">Create New Booking</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateBooking} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guardId" className="text-slate-700 dark:text-slate-200">Guard *</Label>
                  <select
                    id="guardId"
                    name="guardId"
                    required
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Guard</option>
                    {guards.map((guard) => (
                      <option key={guard.id} value={guard.id}>
                        {guard.fullName} ({guard.badgeId || guard.staffId || 'Active Guard'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipmentId" className="text-slate-700 dark:text-slate-200">Equipment *</Label>
                  <select
                    id="equipmentId"
                    name="equipmentId"
                    required
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Equipment</option>
                    {equipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.itemName} ({eq.itemCode}) - Available: {eq.availableQuantity}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantityRequested" className="text-slate-700 dark:text-slate-200">Quantity *</Label>
                  <Input
                    id="quantityRequested"
                    name="quantityRequested"
                    type="number"
                    min="1"
                    required
                    placeholder="Quantity to reserve"
                    className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestedFor" className="text-slate-700 dark:text-slate-200">Needed For Date *</Label>
                  <Input
                    id="requestedFor"
                    name="requestedFor"
                    type="datetime-local"
                    required
                    className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shift" className="text-slate-700 dark:text-slate-200">Shift</Label>
                  <select
                    id="shift"
                    name="shift"
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Shift</option>
                    <option value="DAY">Day</option>
                    <option value="NIGHT">Night</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dutyPoint" className="text-slate-700 dark:text-slate-200">Duty Point</Label>
                  <Input
                    id="dutyPoint"
                    name="dutyPoint"
                    placeholder="e.g., Main Gate, Perimeter"
                    className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks" className="text-slate-700 dark:text-slate-200">Remarks</Label>
                <Input
                  id="remarks"
                  name="remarks"
                  placeholder="Additional notes"
                  className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="dark:border-slate-700 dark:hover:bg-slate-800">Cancel</Button>
              </div>
            </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Requests</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{summary.pending}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Reserved Stock</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{summary.reservedStock}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ready for Pickup</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{summary.approved}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Fulfilled Today</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{summary.fulfilledToday}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Table View */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Bookings</CardTitle>
            <div className="flex gap-2">
              {(['pending', 'approved', 'fulfilled', 'cancelled'] as const).map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className={activeTab === tab ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'dark:border-slate-700 dark:hover:bg-slate-800'}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'pending' && summary.pending > 0 && (
                    <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{summary.pending}</span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Guard</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Equipment</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Needed For</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Shift</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{booking.guard.fullName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{booking.guard.badgeId || booking.guard.staffId || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{booking.equipment.itemName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{booking.equipment.itemCode}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{booking.quantityRequested}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {new Date(booking.requestedFor).toLocaleDateString()} {new Date(booking.requestedFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{booking.shift || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            {booking.status === 'PENDING' && (
                              <>
                                <DropdownMenuItem onClick={() => handleBookingAction(booking.id, 'approve')} className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                                  <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBookingAction(booking.id, 'reject')} className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                                  <X className="h-4 w-4 mr-2 text-red-500" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                              <>
                                <DropdownMenuItem onClick={() => openFulfillDialog(booking)} className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                                  <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                                  Fulfill & Issue
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBookingAction(booking.id, 'cancel')} className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                                  <X className="h-4 w-4 mr-2 text-slate-500" />
                                  Cancel
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Fulfillment Modal */}
      <Dialog open={isFulfillDialogOpen} onOpenChange={setIsFulfillDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">Fulfill Booking</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Guard:</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{selectedBooking.guard.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Equipment:</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{selectedBooking.equipment.itemName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Quantity:</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{selectedBooking.quantityRequested}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Shift:</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{selectedBooking.shift || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Duty Point:</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{selectedBooking.dutyPoint || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label	className="text-slate-700 dark:text-slate-200">Condition at Issue</Label>
                <select
                  defaultValue="GOOD"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="GOOD">Good</option>
                  <option value="SLIGHTLY_DAMAGED">Slightly Damaged</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleBookingAction(selectedBooking.id, 'fulfill')}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm & Issue'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsFulfillDialogOpen(false)}
                  className="dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
