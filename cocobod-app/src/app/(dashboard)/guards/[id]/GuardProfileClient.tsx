'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import {
  Shield,
  User,
  Calendar,
  Package,
  AlertTriangle,
  Search,
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Users,
  History,
  Settings,
  Ban,
  ChevronRight,
  Upload,
  Camera
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface GuardProfileClientProps {
  guard: any
  userRole: string
}

export default function GuardProfileClient({ guard, userRole }: GuardProfileClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isSupervisor = userRole === 'SECURITY_SUPERVISOR'
  const [activeTab, setActiveTab] = useState<'holdings' | 'bookings' | 'damaged' | 'missing'>('holdings')
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const activeIssues = guard.issues.filter((i: any) => i.status === 'ISSUED')
  const pastIssues = guard.issues.filter((i: any) => i.status !== 'ISSUED')
  const pendingBookings = guard.bookings.filter((b: any) => b.status === 'PENDING')
  const approvedBookings = guard.bookings.filter((b: any) => b.status === 'APPROVED')

  const handleDeactivate = async () => {
    try {
      const res = await fetch(`/api/guards/${guard.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to deactivate guard')
        return
      }
      toast.success('Guard deactivated successfully')
      router.push('/guards')
    } catch {
      toast.error('Network error while deactivating guard')
    }
  }

  const handlePhotoUpload = async () => {
    if (!photoFile) return

    setIsUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('photo', photoFile)

      const res = await fetch(`/api/guards/${guard.id}/photo`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to upload photo')
        return
      }

      const data = await res.json()
      guard.photoUrl = data.photoUrl
      toast.success('Photo uploaded successfully')
      setIsPhotoDialogOpen(false)
      setPhotoFile(null)
      setPhotoPreview(null)
      router.refresh()
    } catch {
      toast.error('Network error while uploading photo')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handlePhotoDelete = async () => {
    try {
      const res = await fetch(`/api/guards/${guard.id}/photo`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Failed to delete photo')
        return
      }
      guard.photoUrl = null
      toast.success('Photo deleted successfully')
      router.refresh()
    } catch {
      toast.error('Network error while deleting photo')
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
      case 'APPROVED': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
      case 'FULFILLED': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
      case 'CANCELLED': return 'bg-slate-100 text-slate-800 dark:bg-slate-950/50 dark:text-slate-300'
      case 'EXPIRED': return 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300'
      case 'ISSUED': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
      case 'PARTIALLY_RETURNED': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
      case 'FULLY_RETURNED': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
      case 'INACTIVE': return 'bg-slate-100 text-slate-800 dark:bg-slate-950/50 dark:text-slate-300'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/guards')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Guards
      </Button>

      {/* Profile Header */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {guard.photoUrl ? (
              <img
                src={guard.photoUrl}
                alt={guard.fullName}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-200 dark:border-slate-700 shrink-0"
              />
            ) : (
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 shrink-0">
                <Shield className="h-12 w-12" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{guard.fullName}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className={getStatusColor(guard.status)}>
                      {guard.status}
                    </Badge>
                    {guard.team && (
                      <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {guard.team}
                      </span>
                    )}
                    {guard.shift && (
                      <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {guard.shift}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {isSupervisor && (
                    <Button
                      variant="outline"
                      onClick={() => setIsPhotoDialogOpen(true)}
                      className="shrink-0"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {guard.photoUrl ? 'Update Photo' : 'Add Photo'}
                    </Button>
                  )}
                  {isSupervisor && guard.status === 'ACTIVE' && (
                    <Button
                      variant="destructive"
                      onClick={() => setIsDeactivateDialogOpen(true)}
                      className="shrink-0"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Deactivate Guard
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Badge ID</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{guard.badgeId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Staff ID</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{guard.staffId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Contact</p>
                  <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {guard.contact || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Created</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {new Date(guard.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeIssues.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Active Holdings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingBookings.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pending Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{guard.damaged.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Damaged Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{guard.missing.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Missing Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'holdings' ? 'default' : 'outline'}
              onClick={() => setActiveTab('holdings')}
              className="dark:border-slate-700"
            >
              <Package className="h-4 w-4 mr-2" />
              Current Holdings
            </Button>
            <Button
              variant={activeTab === 'bookings' ? 'default' : 'outline'}
              onClick={() => setActiveTab('bookings')}
              className="dark:border-slate-700"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Bookings
            </Button>
            <Button
              variant={activeTab === 'damaged' ? 'default' : 'outline'}
              onClick={() => setActiveTab('damaged')}
              className="dark:border-slate-700"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Damaged Records
            </Button>
            <Button
              variant={activeTab === 'missing' ? 'default' : 'outline'}
              onClick={() => setActiveTab('missing')}
              className="dark:border-slate-700"
            >
              <Search className="h-4 w-4 mr-2" />
              Missing Records
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'holdings' && (
            <div className="space-y-4">
              {activeIssues.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">No active equipment holdings</p>
                </div>
              ) : (
                activeIssues.map((issue: any) => (
                  <Card key={issue.id} className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Issue #{issue.id.slice(0, 8)}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Issued: {new Date(issue.issuedAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(issue.status)}>
                          {issue.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {issue.items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Package className="h-4 w-4 text-slate-400" />
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{item.equipment.itemName}</p>
                                <p className="text-xs text-slate-500">{item.equipment.itemCode}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900 dark:text-white">{item.quantityOutstanding}</p>
                              <p className="text-xs text-slate-500">outstanding</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {issue.dutyPoint && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="h-4 w-4" />
                          {issue.dutyPoint}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <User className="h-4 w-4" />
                        Custodian: {issue.custodian.fullName}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {guard.bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">No booking history</p>
                </div>
              ) : (
                guard.bookings.map((booking: any) => (
                  <Card key={booking.id} className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {booking.equipment.itemName}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Requested: {new Date(booking.requestedFor).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Quantity</p>
                          <p className="font-medium text-slate-900 dark:text-white">{booking.quantityRequested}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Duty Point</p>
                          <p className="font-medium text-slate-900 dark:text-white">{booking.dutyPoint || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Shift</p>
                          <p className="font-medium text-slate-900 dark:text-white">{booking.shift || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Decided By</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {booking.decidedBy?.fullName || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'damaged' && (
            <div className="space-y-4">
              {guard.damaged.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">No damaged records</p>
                </div>
              ) : (
                guard.damaged.map((record: any) => (
                  <Card key={record.id} className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {record.equipment.itemName}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(record.recordedAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Quantity</p>
                          <p className="font-medium text-slate-900 dark:text-white">{record.quantity}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Condition</p>
                          <p className="font-medium text-slate-900 dark:text-white">{record.condition}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Recorded By</p>
                          <p className="font-medium text-slate-900 dark:text-white">{record.recordedBy.fullName}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Remarks</p>
                          <p className="font-medium text-slate-900 dark:text-white">{record.remarks || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'missing' && (
            <div className="space-y-4">
              {guard.missing.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">No missing records</p>
                </div>
              ) : (
                guard.missing.map((record: any) => (
                  <Card key={record.id} className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {record.equipment.itemName}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(record.recordedAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Quantity</p>
                          <p className="font-medium text-slate-900 dark:text-white">{record.quantity}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Recorded By</p>
                          <p className="font-medium text-slate-900 dark:text-white">{record.recordedBy.fullName}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-500 dark:text-slate-400">Remarks</p>
                          <p className="font-medium text-slate-900 dark:text-white">{record.remarks || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Upload Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              {guard.photoUrl ? 'Update Guard Photo' : 'Add Guard Photo'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Upload a photo for {guard.fullName}. Max file size: 5MB.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {photoPreview || guard.photoUrl ? (
                <img
                  src={photoPreview || guard.photoUrl}
                  alt="Preview"
                  className="h-32 w-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-slate-200 dark:border-slate-700">
                  <Shield className="h-16 w-16 text-slate-400" />
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
                {guard.photoUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePhotoDelete}
                    className="mt-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                  >
                    Remove Current Photo
                  </Button>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsPhotoDialogOpen(false)
                setPhotoFile(null)
                setPhotoPreview(null)
              }} className="dark:border-slate-700">
                Cancel
              </Button>
              <Button
                onClick={handlePhotoUpload}
                disabled={!photoFile || isUploadingPhoto}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Deactivate Guard</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Are you sure you want to deactivate {guard.fullName}? This will prevent them from accessing the system and creating new bookings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeactivateDialogOpen(false)} className="dark:border-slate-700">
              Cancel
            </Button>
            <Button onClick={handleDeactivate} variant="destructive">
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
