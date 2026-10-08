'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Package, Layers, Search, ShieldCheck, Box } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export default function EquipmentCategoriesPage() {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/equipment/categories')
      const data = await response.json()
      if (Array.isArray(data)) {
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = '/api/equipment/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      const body = editingCategory
        ? { ...formData, id: editingCategory.id }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to save category'
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        setIsDialogOpen(false)
        const successMsg = editingCategory ? 'Category updated successfully.' : 'Category created successfully.'
        toast.success(successMsg)
        setEditingCategory(null)
        setFormData({ name: '', description: '' })
        fetchCategories()
      }
    } catch (error) {
      const errorMsg = 'An error occurred while saving category'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setFormData({ name: category.name, description: category.description || '' })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All equipment in this category may be affected.')) {
      return
    }

    try {
      const response = await fetch(`/api/equipment/categories?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to delete category')
      } else {
        toast.success('Category deleted successfully.')
        fetchCategories()
      }
    } catch (error) {
      toast.error('An error occurred while deleting category')
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
    setError('')
  }

  const totalItemsCount = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c._count?.equipment || 0), 0)
  }, [categories])

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories
    const q = searchQuery.toLowerCase()
    return categories.filter((c) =>
      c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q))
    )
  }, [categories, searchQuery])

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3 border border-white/20">
              <Layers className="h-3.5 w-3.5" />
              <span>Catalog Structure</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Equipment Categories
            </h1>
            <p className="mt-1 text-sm md:text-base text-emerald-100/90 max-w-xl">
              Organize security items, gear, and supplies into structured inventory groups.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-md font-semibold transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  New Category
                </Button>
              </DialogTrigger>
              <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sm:max-w-md">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                        {editingCategory ? 'Edit Category' : 'Create New Category'}
                      </DialogTitle>
                      <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs">
                        {editingCategory
                          ? 'Modify category name or description details.'
                          : 'Add a new classification group for equipment inventory.'}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Category Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Tactical Gear, Radios, Uniforms"
                        required
                        className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Description
                      </Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief summary of items in this group..."
                        className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2.5 rounded-xl text-xs font-medium">
                      {error}
                    </div>
                  )}

                  <DialogFooter className="pt-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDialog}
                      className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                    >
                      {loading ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Background glow effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Overview Stat Cards & Search */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Categories Stat */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Categories
            </span>
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {categories.length}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              active groups
            </span>
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-xl" />
        </div>

        {/* Total Catalog Items Stat */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Cataloged Items
            </span>
            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Box className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalItemsCount}
            </span>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
              items linked
            </span>
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-l-xl" />
        </div>

        {/* Search Input Box */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 shadow-sm flex flex-col justify-center">
          <Label htmlFor="categorySearch" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Filter Categories
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="categorySearch"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Category Grid Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="inline-flex p-4 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-3 ring-8 ring-emerald-50/50 dark:ring-emerald-950/20">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">No categories found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery ? `No category matches "${searchQuery}".` : 'Start structuring your inventory by creating the first category.'}
            </p>
            <Button
              onClick={() => {
                if (searchQuery) {
                  setSearchQuery('')
                } else {
                  setIsDialogOpen(true)
                }
              }}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
            >
              {searchQuery ? 'Clear Search' : 'Add First Category'}
            </Button>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <Card
              key={category.id}
              className="group relative overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {category.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(category)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg"
                      title="Edit Category"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(category.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                    <Box className="h-3 w-3" />
                    {category._count?.equipment || 0} equipment items
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Active
                  </span>
                </div>
              </CardContent>
              {/* Subtle top indicator bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
