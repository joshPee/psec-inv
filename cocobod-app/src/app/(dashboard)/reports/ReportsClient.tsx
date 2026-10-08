'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Download,
  Calendar,
  Package,
  ArrowRight,
  History,
  User,
  AlertTriangle,
  Search,
  FileText,
  ChevronRight,
  BarChart3,
  Filter,
  ChevronDown,
  PieChart as PieChartIcon
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CategoryStats {
  id: string
  name: string
  totalItems: number
  totalDamaged: number
  totalMissing: number
  totalIssued: number
  damageRate: string
  lossRate: string
  issueRate: string
}

interface ReportsClientProps {
  categoryStats: CategoryStats[]
  initialStartDate?: string
  initialEndDate?: string
}

const reportTypes = [
  {
    id: 'inventory',
    title: 'Equipment Inventory',
    description: 'Complete list of all equipment with current inventory status, quantities, and conditions.',
    icon: Package,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50',
    accentColor: 'from-emerald-400 to-emerald-600',
    borderHover: 'hover:border-emerald-300 dark:hover:border-emerald-700',
  },
  {
    id: 'issues',
    title: 'Equipment Issues',
    description: 'Full history of equipment issued to guards with dates, custodians, and quantities.',
    icon: ArrowRight,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50',
    accentColor: 'from-blue-400 to-blue-600',
    borderHover: 'hover:border-blue-300 dark:hover:border-blue-700',
  },
  {
    id: 'movements',
    title: 'Movement History',
    description: 'Complete audit trail of all equipment movements including issues, returns, and transfers.',
    icon: History,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800/50',
    accentColor: 'from-indigo-400 to-indigo-600',
    borderHover: 'hover:border-indigo-300 dark:hover:border-indigo-700',
  },
  {
    id: 'guards',
    title: 'Guard Report',
    description: 'List of all guards and their complete equipment issuance and return history.',
    icon: User,
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50',
    accentColor: 'from-purple-400 to-purple-600',
    borderHover: 'hover:border-purple-300 dark:hover:border-purple-700',
  },
  {
    id: 'damaged',
    title: 'Damaged Items',
    description: 'Report of all damaged equipment records with severity, dates, and responsible parties.',
    icon: AlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50',
    accentColor: 'from-amber-400 to-amber-600',
    borderHover: 'hover:border-amber-300 dark:hover:border-amber-700',
  },
  {
    id: 'missing',
    title: 'Missing Items',
    description: 'Report of all missing equipment records with investigation status and timeline.',
    icon: Search,
    iconColor: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/50 dark:to-rose-800/50',
    accentColor: 'from-rose-400 to-rose-600',
    borderHover: 'hover:border-rose-300 dark:hover:border-rose-700',
  },
]

export function ReportsClient({ categoryStats, initialStartDate, initialEndDate }: ReportsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAllReports, setShowAllReports] = useState(false)
  const visibleReports = showAllReports ? reportTypes : reportTypes.slice(0, 3)

  const handleApplyFilter = () => {
    const startDate = (document.getElementById('startDate') as HTMLInputElement)?.value
    const endDate = (document.getElementById('endDate') as HTMLInputElement)?.value
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    router.push(`/reports?${params.toString()}`)
  }

  const handleClearFilter = () => {
    router.push('/reports')
  }

  const handleExport = (type: string) => {
    const params = new URLSearchParams()
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)

    let exportPath = `/api/reports/export/${type}`
    if (type === 'damaged') {
      exportPath = '/api/reports/export/damaged'
    } else if (type === 'missing') {
      exportPath = '/api/reports/export/missing'
    }

    window.location.href = `${exportPath}?${params.toString()}`
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 60%)' }} />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Analytics
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <BarChart3 className="h-7 w-7 text-indigo-400" />
              Reports & Exports
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl">
              Generate, filter, and export detailed system reports. All data can be exported as CSV for analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="group relative border border-slate-200/80 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-indigo-600" />
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800/50 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <Filter className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            Date Range Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1 space-y-1.5 min-w-0">
              <Label htmlFor="startDate" className="text-slate-700 dark:text-slate-200 text-xs font-medium">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={initialStartDate || ''}
                className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex-1 space-y-1.5 min-w-0">
              <Label htmlFor="endDate" className="text-slate-700 dark:text-slate-200 text-xs font-medium">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={initialEndDate || ''}
                className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2 items-end mt-6 sm:mt-0">
              <Button
                type="button"
                onClick={handleApplyFilter}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                Apply Filter
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilter}
                className="dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Report Export Cards */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-400" />
          Available Reports
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleReports.map((report) => {
            const IconComp = report.icon
            return (
              <Card
                key={report.id}
                className={`group relative border border-slate-200/80 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-0.5 transition-all duration-300 ease-out overflow-hidden ${report.borderHover}`}
              >
                {/* Accent strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${report.accentColor}`} />

                {/* Hover shine */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                <CardContent className="p-5 pl-5 relative">
                  <div className="flex items-start gap-4">
                    <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-transform duration-300 group-hover:scale-110 ${report.iconBg}`}>
                      <IconComp className={`h-5 w-5 ${report.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                        {report.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                        {report.description}
                      </p>
                      <Button
                        onClick={() => handleExport(report.id)}
                        size="sm"
                        className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-medium shadow-sm transition-all duration-200 active:scale-[0.98]"
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        {reportTypes.length > 3 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAllReports(!showAllReports)}
              className="dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {showAllReports ? (
                <>
                  <ChevronRight className="h-4 w-4 mr-2 rotate-90" />
                  Show Less
                </>
              ) : (
                <>
                  See More
                  <ChevronDown className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      <Card className="group relative border border-slate-200/80 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-purple-600" />
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Issued</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Damaged</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Missing</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Issue Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Damage Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Loss Rate</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <BarChart3 className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">No category data available</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Add equipment categories to see breakdown analytics</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categoryStats.map((category, idx) => (
                    <tr key={category.id} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${idx % 2 === 1 ? 'bg-slate-25 dark:bg-slate-850' : ''}`}>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">{category.name}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{category.totalItems}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm text-slate-700 dark:text-slate-300">{category.totalIssued}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{category.totalDamaged}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-medium text-rose-600 dark:text-rose-400">{category.totalMissing}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(parseFloat(category.issueRate), 100)}%` }} />
                          </div>
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{category.issueRate}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(parseFloat(category.damageRate), 100)}%` }} />
                          </div>
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{category.damageRate}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(parseFloat(category.lossRate), 100)}%` }} />
                          </div>
                          <span className="text-xs font-medium text-rose-600 dark:text-rose-400">{category.lossRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Visual Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Distribution Pie Chart */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalItems"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Issue Rate Bar Chart */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Issue Rate by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalIssued" fill="#6366f1" name="Issued" />
                <Bar dataKey="totalDamaged" fill="#f59e0b" name="Damaged" />
                <Bar dataKey="totalMissing" fill="#ef4444" name="Missing" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
