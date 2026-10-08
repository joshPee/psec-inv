'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { Shield, Calendar, Package, LogOut, Plus, Clock, CheckCircle, X, AlertCircle, Search, Bell, ArrowRight } from 'lucide-react'

interface Equipment {
  id: string
  itemName: string
  itemCode: string
  availableQuantity: number
  category: { name: string }
}

interface Booking {
  id: string
  equipment: { id: string; itemName: string; itemCode: string; category: { name: string } }
  quantityRequested: number
  requestedFor: string
  dutyPoint: string | null
  shift: string | null
  status: 'PENDING' | 'APPROVED' | 'FULFILLED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED'
  decidedAt: string | null
  expiresAt: string | null
  remarks: string | null
  createdAt: string
}

interface IssueItem {
  id: string
  equipment: { id: string; itemName: string; itemCode: string; category: { name: string } }
  quantityIssued: number
  quantityReturned: number
  quantityOutstanding: number
  conditionAtIssue: string
  returnedAt: string | null
}

interface Issue {
  id: string
  custodian: { id: string; fullName: string; staffId: string }
  shift: string | null
  dutyPoint: string | null
  status: string
  issuedAt: string
  items: IssueItem[]
}

interface Guard {
  id: string
  fullName: string
  badgeId: string
  staffId: string | null
  team: string | null
  shift: string | null
}

interface GuardNotification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function GuardPortalClient({ availableEquipment }: { availableEquipment: Equipment[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [guard, setGuard] = useState<Guard | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [notifications, setNotifications] = useState<GuardNotification[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [equipmentPage, setEquipmentPage] = useState(0)
  const [equipmentSearch, setEquipmentSearch] = useState('')
  const itemsPerPage = 20

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/guard-auth')
      const data = await response.json()
      
      if (data.authenticated && data.guard) {
        setGuard(data.guard)
        setIsAuthenticated(true)
        await loadGuardData(data.guard.id)
        await loadGuardNotifications(data.guard.id)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadGuardData(guardId: string) {
    try {
      const [bookingsRes, issuesRes] = await Promise.all([
        fetch(`/api/bookings?guardId=${guardId}`),
        fetch(`/api/issues?guardId=${guardId}`)
      ])

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(Array.isArray(bookingsData) ? bookingsData : [])
      }

      if (issuesRes.ok) {
        const issuesData = await issuesRes.json()
        setIssues(Array.isArray(issuesData) ? issuesData : [])
      }
    } catch (error) {
      console.error('Failed to load guard data:', error)
    }
  }

  async function loadGuardNotifications(guardId: string) {
    try {
      const response = await fetch(`/api/guard-notifications?guardId=${guardId}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const badgeId = formData.get('badgeId') as string

    try {
      const response = await fetch('/api/guard-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Login failed')
        return
      }

      setGuard(data.guard)
      setIsAuthenticated(true)
      await loadGuardData(data.guard.id)
      await loadGuardNotifications(data.guard.id)
      toast.success('Login successful')
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/guard-auth', { method: 'DELETE' })
      setGuard(null)
      setIsAuthenticated(false)
      setBookings([])
      setIssues([])
      setNotifications([])
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  async function handleReturnRequest(issue: Issue) {
    if (!guard) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/return-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId: issue.id,
          guardId: guard.id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Failed to submit return request')
        return
      }

      setIsReturnDialogOpen(false)
      setSelectedIssue(null)
      toast.success('Return request submitted. Please proceed to the armory for confirmation.')
    } catch (error) {
      console.error('Return request error:', error)
      toast.error('Failed to submit return request')
    } finally {
      setIsSubmitting(false)
    }
  }

  function getTimeUntilExpiry(expiresAt: string | null): string {
    if (!expiresAt) return 'N/A'
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()

    if (diff <= 0) return 'Expired'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }

    return `${hours}h ${minutes}m`
  }

  async function handleCreateBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!guard) return

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
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
          guardId: guard.id,
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
        toast.error(data.error || 'Failed to create booking')
        return
      }

      setIsCreateDialogOpen(false)
      toast.success('Booking request submitted')
      await loadGuardData(guard.id)
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Failed to create booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  function getBookingStatusColor(status: string) {
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

  function getIssueStatusColor(status: string) {
    switch (status) {
      case 'ISSUED': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
      case 'PARTIALLY_RETURNED': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
      case 'FULLY_RETURNED': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-500 dark:text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Guard Portal</CardTitle>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Enter your badge ID to access equipment requests</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="badgeId" className="text-slate-700 dark:text-slate-200">Badge ID</Label>
                <Input
                  id="badgeId"
                  name="badgeId"
                  required
                  placeholder="Enter your badge ID"
                  className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Guard Portal</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{guard?.fullName}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Pending Requests</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {bookings.filter(b => b.status === 'PENDING').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Ready for Pickup</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {bookings.filter(b => b.status === 'APPROVED').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Active Equipment</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {issues.filter(i => i.status === 'ISSUED').length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-3 ${
                      notification.read
                        ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                        : 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{notification.title}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{notification.message}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">My Requests</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">Request Equipment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="equipmentSearch" className="text-slate-700 dark:text-slate-200">Search Equipment</Label>
                    <Input
                      id="equipmentSearch"
                      type="text"
                      placeholder="Search by name or code..."
                      value={equipmentSearch}
                      onChange={(e) => {
                        setEquipmentSearch(e.target.value)
                        setEquipmentPage(0)
                      }}
                      className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="equipmentId" className="text-slate-700 dark:text-slate-200">Equipment *</Label>
                    <select
                      id="equipmentId"
                      name="equipmentId"
                      required
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Equipment</option>
                      {availableEquipment
                        .filter(eq =>
                          eq.itemName.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
                          eq.itemCode.toLowerCase().includes(equipmentSearch.toLowerCase())
                        )
                        .slice(equipmentPage * itemsPerPage, (equipmentPage + 1) * itemsPerPage)
                        .map((eq) => (
                          <option key={eq.id} value={eq.id}>
                            {eq.itemName} ({eq.itemCode}) - Available: {eq.availableQuantity}
                          </option>
                        ))}
                    </select>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>
                        Showing {equipmentPage * itemsPerPage + 1} - {Math.min((equipmentPage + 1) * itemsPerPage, availableEquipment.filter(eq =>
                          eq.itemName.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
                          eq.itemCode.toLowerCase().includes(equipmentSearch.toLowerCase())
                        ).length)} of {availableEquipment.filter(eq =>
                          eq.itemName.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
                          eq.itemCode.toLowerCase().includes(equipmentSearch.toLowerCase())
                        ).length} items
                      </span>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEquipmentPage(Math.max(0, equipmentPage - 1))}
                          disabled={equipmentPage === 0}
                          className="dark:border-slate-700 dark:hover:bg-slate-800 h-7 px-2"
                        >
                          Previous
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEquipmentPage(equipmentPage + 1)}
                          disabled={(equipmentPage + 1) * itemsPerPage >= availableEquipment.filter(eq =>
                            eq.itemName.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
                            eq.itemCode.toLowerCase().includes(equipmentSearch.toLowerCase())
                          ).length}
                          className="dark:border-slate-700 dark:hover:bg-slate-800 h-7 px-2"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantityRequested" className="text-slate-700 dark:text-slate-200">Quantity *</Label>
                    <Input
                      id="quantityRequested"
                      name="quantityRequested"
                      type="number"
                      min="1"
                      required
                      placeholder="Quantity needed"
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
                      defaultValue={guard?.shift || ''}
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
                      defaultValue={guard?.team || ''}
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
                  <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1">
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="dark:border-slate-700 dark:hover:bg-slate-800">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bookings */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              Booking Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4">No booking requests yet</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-slate-900 dark:text-white">{booking.equipment.itemName}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getBookingStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">Quantity:</span>
                            <span className="ml-1 font-medium text-slate-900 dark:text-white">{booking.quantityRequested}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400">Needed:</span>
                            <span className="ml-1 font-medium text-slate-900 dark:text-white">
                              {new Date(booking.requestedFor).toLocaleDateString()}
                            </span>
                          </div>
                          {booking.expiresAt && (
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Expires in:</span>
                              <span className="ml-1 font-medium text-slate-900 dark:text-white">
                                {getTimeUntilExpiry(booking.expiresAt)}
                              </span>
                            </div>
                          )}
                          {booking.shift && (
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Shift:</span>
                              <span className="ml-1 font-medium text-slate-900 dark:text-white">{booking.shift}</span>
                            </div>
                          )}
                          {booking.dutyPoint && (
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Duty Point:</span>
                              <span className="ml-1 font-medium text-slate-900 dark:text-white">{booking.dutyPoint}</span>
                            </div>
                          )}
                        </div>
                        {booking.status === 'REJECTED' && booking.remarks && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                            Reason: {booking.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Issues */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              Currently Issued Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {issues.filter(i => i.status === 'ISSUED').length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4">No active equipment issued</p>
            ) : (
              <div className="space-y-3">
                {issues
                  .filter(issue => issue.status === 'ISSUED')
                  .map((issue) => (
                    <div key={issue.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getIssueStatusColor(issue.status)}`}>
                              {issue.status}
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Issued: {new Date(issue.issuedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="space-y-1">
                            {issue.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-sm">
                                <span className="text-slate-900 dark:text-white">{item.equipment.itemName}</span>
                                <span className="text-slate-600 dark:text-slate-400">
                                  {item.quantityIssued} issued, {item.quantityReturned} returned
                                </span>
                              </div>
                            ))}
                          </div>
                          {issue.dutyPoint && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                              Duty Point: {issue.dutyPoint}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedIssue(issue)
                            setIsReturnDialogOpen(true)
                          }}
                          className="dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Return
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Return Request Dialog */}
        <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
          <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">Request Equipment Return</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You are requesting to return the following equipment. Please proceed to the armory for confirmation by the custodian.
              </p>
              {selectedIssue && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50">
                  <div className="space-y-1">
                    {selectedIssue.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-900 dark:text-white">{item.equipment.itemName}</span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {item.quantityIssued} units
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={() => selectedIssue && handleReturnRequest(selectedIssue)}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsReturnDialogOpen(false)
                    setSelectedIssue(null)
                  }}
                  className="dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
