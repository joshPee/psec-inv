'use client'

import Link from 'next/link'
import {
  Shield,
  TrendingUp,
  RotateCcw,
  PlusCircle,
  Search,
  History,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Eye,
  UserCircle,
  ShieldCheck
} from 'lucide-react'

interface CustodianHubCardProps {
  userName: string
  userRole: string
  staffId?: string
  todayIssued?: number
  todayReturned?: number
  activeIssuedUnits?: number
  totalItems?: number
  availableItems?: number
  overdueCount?: number
  activeDamagedCount?: number
  activeMissingCount?: number
  guardsWithEquipment?: number
  totalGuards?: number
  guardsEquippedPercent?: number
  isSupervisor?: boolean
}

export default function CustodianHubCard({
  userName,
  userRole,
  staffId,
  activeDamagedCount = 0,
  activeMissingCount = 0,
  overdueCount = 0,
  isSupervisor = false,
}: CustodianHubCardProps) {
  return (
    <div>
      {/* Quick Access Buttons Dispatch Grid */}
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          Quick Access
        </span>
      </div>

      <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-7 gap-3 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {isSupervisor ? (
            <>
              {/* Supervisor: View Inventory */}
              <Link href="/inventory" className="group block flex-shrink-0 w-36 sm:w-auto">
                <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3.5 hover:bg-emerald-50/60 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Eye className="h-4 w-4" />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">View Inventory</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">All equipment</p>
                  </div>
                </div>
              </Link>

              {/* Supervisor: View Guards Portal */}
              <Link href="/guards" className="group block flex-shrink-0 w-36 sm:w-auto">
                <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3.5 hover:bg-blue-50/60 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <UserCircle className="h-4 w-4" />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">View Guards</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Guard details</p>
                  </div>
                </div>
              </Link>

              {/* Supervisor: View Movement History */}
              <Link href="/records/movement" className="group block">
                <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3.5 hover:bg-indigo-50/60 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <History className="h-4 w-4" />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">View History</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Movement log</p>
                  </div>
                </div>
              </Link>

              {/* Supervisor: View Custodian Activity */}
              <Link href="/audit/custodian" className="group block flex-shrink-0 w-36 sm:w-auto">
                <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3.5 hover:bg-teal-50/60 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-2 rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">Custodian Activity</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Monitor ops</p>
                  </div>
                </div>
              </Link>

              {/* Supervisor: View Active Issues */}
              <Link href="/active" className="group block flex-shrink-0 w-36 sm:w-auto">
                <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3.5 hover:bg-blue-50/60 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Eye className="h-4 w-4" />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Active Issues</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">View issued items</p>
                  </div>
                </div>
              </Link>

              {/* Supervisor: View Issue Log */}
              <Link href="/issue" className="group block flex-shrink-0 w-36 sm:w-auto">
                <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3.5 hover:bg-emerald-50/60 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Issue Log</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">View transactions</p>
                  </div>
                </div>
              </Link>

              {/* Supervisor: View Return Log */}
              <Link href="/return" className="group block flex-shrink-0 w-36 sm:w-auto">
                <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3.5 hover:bg-blue-50/60 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <RotateCcw className="h-4 w-4" />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Return Log</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">View returns</p>
                  </div>
                </div>
              </Link>
            </>
          ) : (
            <>
              {/* Custodian: Direct Issue */}
              <Link href="/issue?openDialog=true" className="group block flex-shrink-0 w-36 sm:w-auto">
                <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3.5 hover:bg-emerald-50/60 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Issue Item</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Hand out to guard</p>
                  </div>
                </div>
              </Link>

              {/* Custodian: Receive Return */}
              <Link href="/return?openDialog=true" className="group block flex-shrink-0 w-36 sm:w-auto">
                <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3.5 hover:bg-blue-50/60 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <RotateCcw className="h-4 w-4" />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Receive Return</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Inspect & check-in</p>
                  </div>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
  )
}
