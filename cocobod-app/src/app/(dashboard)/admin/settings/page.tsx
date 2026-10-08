'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSession, signOut } from 'next-auth/react'
import { LogOut, User, FolderPlus, FolderEdit, Trash2, Power, PowerOff, Settings } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default function SettingsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [categories, setCategories] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  const handleSaveSettings = () => {
    toast.success('Settings updated successfully.')
  }

  const handleCreateCategory = async (formData: FormData) => {
    const name = formData.get('categoryName') as string
    const description = formData.get('categoryDescription') as string
    const parentId = formData.get('parentId') as string
    const lowStockThreshold = parseInt(formData.get('lowStockThreshold') as string) || 5

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, parentId: parentId || null, lowStockThreshold })
      })

      if (!response.ok) throw new Error('Failed to create category')

      await fetchCategories()
      setIsDialogOpen(false)
      toast.success('Category created successfully.')
    } catch (error) {
      toast.error('Failed to create category.')
    }
  }

  const handleUpdateCategory = async (formData: FormData) => {
    const categoryId = selectedCategory?.id
    const name = formData.get('categoryName') as string
    const description = formData.get('categoryDescription') as string
    const isActive = formData.get('isActive') === 'true'
    const parentId = formData.get('parentId') as string
    const lowStockThreshold = parseInt(formData.get('lowStockThreshold') as string) || 5

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, isActive, parentId: parentId || null, lowStockThreshold })
      })

      if (!response.ok) throw new Error('Failed to update category')

      await fetchCategories()
      setIsDialogOpen(false)
      setIsEditing(false)
      setSelectedCategory(null)
      toast.success('Category updated successfully.')
    } catch (error) {
      toast.error('Failed to update category.')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete category')
      }

      await fetchCategories()
      toast.success('Category deleted successfully.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category.')
    }
  }

  const handleToggleActive = async (categoryId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (!response.ok) throw new Error('Failed to update category')

      await fetchCategories()
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully.`)
    } catch (error) {
      toast.error('Failed to update category status.')
    }
  }

  const openAddDialog = () => {
    setIsEditing(false)
    setSelectedCategory(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: any) => {
    setIsEditing(true)
    setSelectedCategory(category)
    setIsDialogOpen(true)
  }

  const isSupervisor = session?.user?.role === 'SECURITY_SUPERVISOR'

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-gray-950 to-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(107, 114, 128, 0.3) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(156, 163, 175, 0.2) 0%, transparent 60%)' }} />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/30 text-gray-200 border border-gray-400/30">
                Configuration
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
              <Settings className="h-7 w-7 text-gray-400" />
              System Settings
            </h1>
            <p className="text-sm text-slate-300 mt-1">Configure system-wide settings</p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full">
              <User className="h-8 w-8 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-900 dark:text-white">{session?.user?.fullName || 'User'}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{session?.user?.role || 'Staff'}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{session?.user?.staffId || 'N/A'}</p>
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemName" className="text-slate-700 dark:text-slate-200">System Name</Label>
              <Input
                id="systemName"
                defaultValue="Security Equipment Management System"
                className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationName" className="text-slate-700 dark:text-slate-200">Organization Name</Label>
              <Input
                id="organizationName"
                defaultValue="PCC Security Department"
                className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <Button onClick={handleSaveSettings} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">Save Settings</Button>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Categories Management */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Equipment Categories</CardTitle>
            {isSupervisor && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddDialog} variant="outline" className="border-slate-200 dark:border-slate-700">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                      {isEditing ? 'Edit Category' : 'Add New Category'}
                    </DialogTitle>
                  </DialogHeader>
                  <form action={isEditing ? handleUpdateCategory : handleCreateCategory} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName" className="text-slate-700 dark:text-slate-200">Category Name *</Label>
                      <Input
                        id="categoryName"
                        name="categoryName"
                        required
                        defaultValue={selectedCategory?.name || ''}
                        placeholder="e.g., Radios"
                        className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoryDescription" className="text-slate-700 dark:text-slate-200">Description</Label>
                      <Input
                        id="categoryDescription"
                        name="categoryDescription"
                        defaultValue={selectedCategory?.description || ''}
                        placeholder="Brief description of the category"
                        className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lowStockThreshold" className="text-slate-700 dark:text-slate-200">Low Stock Threshold</Label>
                      <Input
                        id="lowStockThreshold"
                        name="lowStockThreshold"
                        type="number"
                        min="0"
                        defaultValue={selectedCategory?.lowStockThreshold || 5}
                        placeholder="Alert when available quantity falls below this number"
                        className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    {isEditing && (
                      <div className="space-y-2">
                        <Label htmlFor="isActive" className="text-slate-700 dark:text-slate-200">Status</Label>
                        <select
                          id="isActive"
                          name="isActive"
                          defaultValue={selectedCategory?.isActive ? 'true' : 'false'}
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {isEditing ? 'Update Category' : 'Add Category'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="dark:border-slate-700 dark:hover:bg-slate-800">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-500 dark:text-slate-400">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-4">No categories found. Add your first category to get started.</p>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className={`p-4 border rounded-lg ${category.isActive ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/30 opacity-60'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{category.name}</h3>
                        {!category.isActive && (
                          <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">Inactive</span>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{category.description}</p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{category._count?.equipment || 0} items</p>
                      {category.parent && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Parent: {category.parent.name}</p>
                      )}
                    </div>
                    {isSupervisor && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 h-8 w-8 p-0">
                            <FolderEdit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                          <DropdownMenuItem onClick={() => openEditDialog(category)} className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <FolderEdit className="h-4 w-4 mr-2 text-slate-400" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(category.id, category.isActive)} className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                            {category.isActive ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2 text-slate-400" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2 text-slate-400" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteCategory(category.id)} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="text-slate-500 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">Version:</strong> 1.0.0</p>
            <p className="text-slate-500 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">Database:</strong> PostgreSQL (Neon)</p>
            <p className="text-slate-500 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">ORM:</strong> Prisma</p>
            <p className="text-slate-500 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">Framework:</strong> Next.js 14</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
