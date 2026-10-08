'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Package, 
  MapPin, 
  ArrowRight, 
  ChevronRight,
  ExternalLink,
  LayoutList,
  LayoutGrid,
  Filter
} from 'lucide-react'

export interface QuickSearchItem {
  id: string
  itemName: string
  itemCode: string
  availableQuantity: number
  totalQuantity: number
  issuedQuantity: number
  damagedQuantity: number
  storageLocation: string | null
  defaultCondition: string
  category: {
    name: string
  } | null
}

interface DashboardQuickSearchProps {
  items: QuickSearchItem[]
  categories: { id: string; name: string }[]
}

export default function DashboardQuickSearch({ items, categories }: DashboardQuickSearchProps) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'compact' | 'cards'>('compact')
  const [visibleLimit, setVisibleLimit] = useState<number>(12)

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery =
        !query ||
        item.itemName.toLowerCase().includes(query.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(query.toLowerCase()) ||
        (item.storageLocation && item.storageLocation.toLowerCase().includes(query.toLowerCase()))

      const matchesCat =
        selectedCategory === 'ALL' || item.category?.name === selectedCategory

      return matchesQuery && matchesCat
    })
  }, [items, query, selectedCategory])

  const displayedItems = filteredItems.slice(0, visibleLimit)
  const hasMore = filteredItems.length > visibleLimit

  return (
    <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Search className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Live Armory Equipment Finder
              </CardTitle>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
              </span>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              High-density live armory lookup. Filter by equipment name, serial code, or storage location.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                title="Compact List View"
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

            <Link href="/inventory">
              <Button variant="ghost" size="sm" className="h-8 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">
                Full Inventory <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Compact Search & Filter Control Bar */}
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by code (RAD-001), item name, or location..."
              className="pl-8 h-8 text-xs border-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white focus:ring-emerald-500"
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

          {/* Category Filter Pills (Scrollable) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All ({items.length})
            </button>
            {categories.map((cat) => {
              const count = items.filter(i => i.category?.name === cat.name).length
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.name
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {displayedItems.length === 0 ? (
          <div className="py-10 text-center">
            <Package className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No equipment found matching criteria</p>
            <p className="text-xs text-slate-400 mt-0.5">Try searching with a different keyword or category</p>
          </div>
        ) : viewMode === 'compact' ? (
          /* COMPACT LIST / TABLE VIEW (Harbors many items cleanly in a high-density table) */
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-xs border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Item & Code</th>
                  <th className="py-2.5 px-3 font-semibold hidden md:table-cell">Category</th>
                  <th className="py-2.5 px-3 font-semibold hidden sm:table-cell">Location</th>
                  <th className="py-2.5 px-3 font-semibold">Stock Availability</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                {displayedItems.map((item) => {
                  const availabilityPercent = item.totalQuantity > 0 
                    ? Math.round((item.availableQuantity / item.totalQuantity) * 100) 
                    : 0

                  const isLowStock = item.availableQuantity <= 5 && item.availableQuantity > 0
                  const isOut = item.availableQuantity === 0

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Item Name & Code */}
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                            {item.itemCode}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-[220px]">
                              {item.itemName}
                            </p>
                            <p className="text-[10px] text-slate-400 md:hidden">
                              {item.category?.name || 'General'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-2 px-3 hidden md:table-cell text-slate-600 dark:text-slate-300">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.category?.name || 'General'}
                        </span>
                      </td>

                      {/* Storage Location */}
                      <td className="py-2 px-3 hidden sm:table-cell text-slate-500 dark:text-slate-400">
                        {item.storageLocation ? (
                          <span className="inline-flex items-center gap-1 text-[11px] truncate max-w-[140px]">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            {item.storageLocation}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Availability Progress Bar */}
                      <td className="py-2 px-3">
                        <div className="w-28 sm:w-36 space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className={`font-bold ${isOut ? 'text-rose-500' : isLowStock ? 'text-amber-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {item.availableQuantity}
                            </span>
                            <span className="text-slate-400 font-normal">/ {item.totalQuantity} total</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isOut
                                  ? 'bg-rose-500'
                                  : isLowStock
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, availabilityPercent))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status Chip */}
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOut
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                          }`}
                        >
                          {isOut ? 'Depleted' : isLowStock ? 'Low' : 'Ready'}
                        </span>
                      </td>

                      {/* Quick Action */}
                      <td className="py-2 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/inventory/${item.id}`}>
                            <button
                              type="button"
                              className="h-6 px-2 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              Info
                            </button>
                          </Link>
                          {item.availableQuantity > 0 ? (
                            <Link href="/issue">
                              <button
                                type="button"
                                className="h-6 px-2.5 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-2xs transition-colors flex items-center gap-1"
                              >
                                Issue <ArrowRight className="h-2.5 w-2.5" />
                              </button>
                            </Link>
                          ) : (
                            <Link href="/return">
                              <button
                                type="button"
                                className="h-6 px-2 text-[11px] font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 rounded hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                              >
                                Receive
                              </button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* DENSE CARD GRID VIEW */
          <div className="p-4 max-h-[380px] overflow-y-auto grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 scrollbar-thin">
            {displayedItems.map((item) => {
              const availabilityPercent = item.totalQuantity > 0 
                ? Math.round((item.availableQuantity / item.totalQuantity) * 100) 
                : 0

              const isLowStock = item.availableQuantity <= 5 && item.availableQuantity > 0
              const isOut = item.availableQuantity === 0

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/40 dark:bg-slate-800/40 p-3 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                      <div className="min-w-0">
                        <span className="inline-block font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mb-0.5">
                          {item.itemCode}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {item.itemName}
                        </h4>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                          isOut
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                        }`}
                      >
                        {isOut ? 'Depleted' : isLowStock ? 'Low' : 'In Stock'}
                      </span>
                    </div>

                    <div className="space-y-1 my-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Available:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          <span className={item.availableQuantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
                            {item.availableQuantity}
                          </span>
                          <span className="text-slate-400 font-normal"> / {item.totalQuantity}</span>
                        </span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOut
                              ? 'bg-rose-500'
                              : isLowStock
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, availabilityPercent))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/60">
                    <Link href={`/inventory/${item.id}`} className="flex-1">
                      <button className="w-full h-6 text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                        Info
                      </button>
                    </Link>
                    {item.availableQuantity > 0 ? (
                      <Link href="/issue" className="flex-1">
                        <button className="w-full h-6 text-[10px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center justify-center gap-1">
                          Issue <ArrowRight className="h-2.5 w-2.5" />
                        </button>
                      </Link>
                    ) : (
                      <Link href="/return" className="flex-1">
                        <button className="w-full h-6 text-[10px] font-medium text-blue-600 border border-blue-200 rounded">
                          Receive
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer Bar with "Show More" / Scale Controls */}
        <div className="py-2.5 px-4 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800 dark:text-slate-200 font-semibold">{displayedItems.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">{filteredItems.length}</strong> equipment items
          </div>

          <div className="flex items-center gap-2">
            {hasMore ? (
              <button
                type="button"
                onClick={() => setVisibleLimit(prev => prev + 12)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Show 12 More
              </button>
            ) : filteredItems.length > 12 ? (
              <button
                type="button"
                onClick={() => setVisibleLimit(12)}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Collapse List
              </button>
            ) : null}

            <Link href={`/inventory?search=${encodeURIComponent(query)}`}>
              <button
                type="button"
                className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center font-medium"
              >
                Open Inventory <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
