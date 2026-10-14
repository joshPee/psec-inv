'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Users } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { PageHeader } from '@/components/ui/page-header'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'

interface AdminUser {
  id: string
  fullName: string
  staffId: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

export default function UserManagementPage() {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      if (Array.isArray(data)) {
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  async function createUser(formData: FormData) {
    setLoading(true)
    setError('')

    try {
      const data = {
        fullName: formData.get('fullName') as string,
        staffId: formData.get('staffId') as string,
        username: formData.get('username') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        role: formData.get('role') as string,
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMsg = result.error || 'Failed to create user'
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        setIsDialogOpen(false)
        toast.success('User created successfully.')
        fetchUsers()
      }
    } catch (error) {
      const errorMsg = 'An error occurred while creating user'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  async function deleteUser(userId: string) {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMsg = result.error || 'Failed to delete user'
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        toast.success('User deleted successfully.')
        fetchUsers()
      }
    } catch (error) {
      const errorMsg = 'An error occurred while deleting user'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Modern Hero Header */}
      <PageHeader
        icon={Users}
        badge="Administration"
        title="User Management"
        description="Manage system users, assigned roles, security credentials, and access permissions."
        color="violet"
        stats={[
          { label: 'Registered Users', value: users.length },
          { label: 'Supervisors', value: users.filter(u => u.role === 'SECURITY_SUPERVISOR').length },
          { label: 'Custodians', value: users.filter(u => u.role === 'EQUIPMENT_CUSTODIAN').length },
        ]}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">Add New User</DialogTitle>
              </DialogHeader>
              <form action={createUser} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-200">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    required
                    placeholder="John Doe"
                    className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staffId" className="text-slate-700 dark:text-slate-200">Staff ID *</Label>
                  <Input
                    id="staffId"
                    name="staffId"
                    required
                    placeholder="STAFF001"
                    className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700 dark:text-slate-200">Username *</Label>
                  <Input
                    id="username"
                    name="username"
                    required
                    placeholder="johndoe"
                    className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="john.doe@psec-inv.com"
                    className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-200">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="role" className="text-slate-700 dark:text-slate-200">Role *</Label>
                  <select
                    id="role"
                    name="role"
                    required
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="SECURITY_SUPERVISOR">Security Supervisor</option>
                    <option value="EQUIPMENT_CUSTODIAN">Equipment Custodian</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium w-full">
                <Plus className="h-4 w-4 mr-2" />
                {loading ? 'Adding...' : 'Add User'}
              </Button>
            </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Users List */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">System Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th className="text-left p-4 font-semibold text-slate-500 dark:text-slate-400 text-sm">Full Name</th>
                  <th className="text-left p-4 font-semibold text-slate-500 dark:text-slate-400 text-sm">Staff ID</th>
                  <th className="text-left p-4 font-semibold text-slate-500 dark:text-slate-400 text-sm">Email</th>
                  <th className="text-left p-4 font-semibold text-slate-500 dark:text-slate-400 text-sm">Role</th>
                  <th className="text-left p-4 font-semibold text-slate-500 dark:text-slate-400 text-sm">Status</th>
                  <th className="text-left p-4 font-semibold text-slate-500 dark:text-slate-400 text-sm">Created</th>
                  <th className="text-left p-4 font-semibold text-slate-500 dark:text-slate-400 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">{user.fullName}</td>
                    <td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-400">{user.staffId}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        user.role === 'SECURITY_SUPERVISOR'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                      }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        user.isActive 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800' 
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          type="button"
                          onClick={() => setUserToDelete(user)}
                          className="text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8">
                      <EmptyState
                        icon={Users}
                        title="No Users Registered"
                        description="There are currently no supervisor or custodian accounts in the system."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog for User Deletion */}
      <ConfirmDialog
        open={!!userToDelete}
        onOpenChange={(open) => {
          if (!open) setUserToDelete(null)
        }}
        title="Delete User Account"
        description={
          userToDelete
            ? `Are you sure you want to delete ${userToDelete.fullName} (${userToDelete.staffId})? This will permanently revoke their access credentials.`
            : ''
        }
        confirmLabel="Delete User"
        variant="destructive"
        icon={Trash2}
        loading={loading}
        onConfirm={async () => {
          if (userToDelete) {
            await deleteUser(userToDelete.id)
            setUserToDelete(null)
          }
        }}
      />
    </div>
  )
}
