'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Layers,
  ChevronRight,
  Search,
  LayoutList,
  LayoutGrid,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Package,
  ExternalLink
} from 'lucide-react'

export interface CategorySummary {
  id: string
  name: string
  description?: string | null
  totalUnits: number
  availableUnits: number
  issuedUnits: number
  damagedUnits: number
  missingUnits: number
  itemCount: number
}

interface CategoryDistributionProps {
  categories: CategorySummary[]
}

export default function CategoryDistributionCard({ categories }: CategoryDistributionProps) {
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<'compact' | 'cards'>('compact')
  const [visibleLimit, setVisibleLimit] = useState<number>(8)

  const filteredCategories = useMemo(() => {
    if (!query) return categories
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(query.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(query.toLowerCase()))
    )
  }, [categories, query])

  const displayedCategories = filteredCategories.slice(0, visibleLimit)
  const hasMore = filteredCategories.length > visibleLimit

  // Aggregate stats
  const totalUnitsAll = categories.reduce((s, c) => s + c.totalUnits, 0)
  const availableAll = categories.reduce((s, c) => s + c.availableUnits, 0)
  const issuedAll = categories.reduce((s, c) => s + c.issuedUnits, 0)
  const defectsAll = categories.reduce((s, c) => s + c.damagedUnits + c.missingUnits, 0)
  const readinessPct = totalUnitsAll > 0 ? Math.round((availableAll / totalUnitsAll) * 100) : 0

  return (
    <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Layers className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Category Distribution &amp; Armory Readiness
              </CardTitle>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
              </span>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Stock health and allocation breakdown across tactical equipment categories.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                title="Compact Table View"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutList className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Compact</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                title="Card Grid View"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            <Link href="/categories">
              <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">
                Manage <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar + Readiness Summary Pills */}
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories..."
              className="pl-8 h-8 text-xs border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white focus:ring-indigo-500"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Readiness Summary Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 whitespace-nowrap">
              <ShieldCheck className="h-3 w-3" />
              {readinessPct}% Ready
            </span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 whitespace-nowrap">
              Available: <strong>{availableAll}</strong>
            </span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 whitespace-nowrap">
              Issued: <strong>{issuedAll}</strong>
            </span>
            {defectsAll > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60 whitespace-nowrap">
                <AlertTriangle className="h-3 w-3" />
                Defects: <strong>{defectsAll}</strong>
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {displayedCategories.length === 0 ? (
          <div className="py-10 text-center">
            <Package className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No categories found</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {query ? 'Try a different search term' : 'No categories configured yet.'}
            </p>
          </div>
        ) : viewMode === 'compact' ? (
          /* ═══ COMPACT TABLE VIEW ═══ */
          <div className="max-h-[360px] overflow-y-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-xs border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Items</th>
                  <th className="py-2.5 px-3 font-semibold">Readiness</th>
                  <th className="py-2.5 px-3 font-semibold hidden sm:table-cell">Available</th>
                  <th className="py-2.5 px-3 font-semibold hidden sm:table-cell">Issued</th>
                  <th className="py-2.5 px-3 font-semibold hidden md:table-cell">Defects</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                {displayedCategories.map((cat) => {
                  const availablePct = cat.totalUnits > 0 ? Math.round((cat.availableUnits / cat.totalUnits) * 100) : 0
                  const defectUnits = cat.damagedUnits + cat.missingUnits
                  const isCritical = availablePct <= 10 && cat.totalUnits > 0
                  const isWarning = availablePct < 40 && availablePct > 10

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Category Name */}
                      <td className="py-2 px-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-slate-900 dark:text-white truncate max-w-[200px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {cat.name}
                          </p>
                          {cat.description && (
                            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Item Count */}
                      <td className="py-2 px-3 text-center">
                        <span className="inline-block text-[11px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {cat.itemCount}
                        </span>
                      </td>

                      {/* Readiness Bar */}
                      <td className="py-2 px-3">
                        <div className="w-24 sm:w-32 space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className={`font-bold ${
                              isCritical ? 'text-rose-500' : isWarning ? 'text-amber-600' : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {availablePct}%
                            </span>
                            <span className="text-slate-400 font-normal">{cat.totalUnits} total</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                            <div
                              className="h-full bg-emerald-500 transition-all"
                              style={{ width: `${availablePct}%` }}
                            />
                            <div
                              className="h-full bg-indigo-500 transition-all"
                              style={{ width: `${cat.totalUnits > 0 ? Math.round((cat.issuedUnits / cat.totalUnits) * 100) : 0}%` }}
                            />
                            {defectUnits > 0 && cat.totalUnits > 0 && (
                              <div
                                className="h-full bg-rose-500 transition-all"
                                style={{ width: `${Math.round((defectUnits / cat.totalUnits) * 100)}%` }}
                              />
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Available */}
                      <td className="py-2 px-3 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                          <strong className="text-slate-900 dark:text-white font-semibold">{cat.availableUnits}</strong>
                        </span>
                      </td>

                      {/* Issued */}
                      <td className="py-2 px-3 hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <span className="h-2 w-2 rounded-full bg-indigo-500 inline-block" />
                          <strong className="text-slate-900 dark:text-white font-semibold">{cat.issuedUnits}</strong>
                        </span>
                      </td>

                      {/* Defects */}
                      <td className="py-2 px-3 hidden md:table-cell">
                        {defectUnits > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400">
                            <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                            <strong className="font-semibold">{defectUnits}</strong>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>

                      {/* Status Chip */}
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCritical
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                              : isWarning
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                          }`}
                        >
                          {isCritical ? 'Critical' : isWarning ? 'Warning' : 'Healthy'}
                        </span>
                      </td>

                      {/* Quick Action */}
                      <td className="py-2 px-4 text-right">
                        <Link href={`/inventory?category=${encodeURIComponent(cat.name)}`}>
                          <button
                            type="button"
                            className="h-6 px-2.5 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow-2xs transition-colors flex items-center gap-1 ml-auto"
                          >
                            View <ChevronRight className="h-2.5 w-2.5" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ═══ CARD GRID VIEW ═══ */
          <div className="p-4 max-h-[360px] overflow-y-auto grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 scrollbar-thin">
            {displayedCategories.map((cat) => {
              const availablePct = cat.totalUnits > 0 ? Math.round((cat.availableUnits / cat.totalUnits) * 100) : 0
              const issuedPct = cat.totalUnits > 0 ? Math.round((cat.issuedUnits / cat.totalUnits) * 100) : 0
              const defectUnits = cat.damagedUnits + cat.missingUnits

              const isCritical = availablePct <= 10 && cat.totalUnits > 0
              const isWarning = availablePct < 40 && availablePct > 10

              return (
                <Link
                  key={cat.id}
                  href={`/inventory?category=${encodeURIComponent(cat.name)}`}
                  className="block group"
                >
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 p-3 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1.5 mb-1.5">
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {cat.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {cat.itemCount} item{cat.itemCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                            isCritical
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                              : isWarning
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                          }`}
                        >
                          {availablePct}% Ready
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex my-2">
                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${availablePct}%` }} />
                        <div className="h-full bg-indigo-500 transition-all" style={{ width: `${issuedPct}%` }} />
                        {defectUnits > 0 && cat.totalUnits > 0 && (
                          <div className="h-full bg-rose-500 transition-all" style={{ width: `${Math.round((defectUnits / cat.totalUnits) * 100)}%` }} />
                        )}
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                          <strong className="text-slate-900 dark:text-white font-semibold">{cat.availableUnits}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-indigo-500 inline-block" />
                          <strong className="text-slate-900 dark:text-white font-semibold">{cat.issuedUnits}</strong>
                        </span>
                        <span className="text-slate-400">
                          {cat.totalUnits} total
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Footer Bar with "Show More" / Scale Controls */}
        <div className="py-2.5 px-4 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800 dark:text-slate-200 font-semibold">{displayedCategories.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">{filteredCategories.length}</strong> categories
          </div>

          <div className="flex items-center gap-2">
            {hasMore ? (
              <button
                type="button"
                onClick={() => setVisibleLimit(prev => prev + 8)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
              >
                Show 8 More
              </button>
            ) : filteredCategories.length > 8 ? (
              <button
                type="button"
                onClick={() => setVisibleLimit(8)}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Collapse List
              </button>
            ) : null}

            <Link href="/categories">
              <button
                type="button"
                className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center font-medium"
              >
                All Categories <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
