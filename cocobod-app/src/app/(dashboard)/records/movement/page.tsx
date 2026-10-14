import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft, History, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 20

async function getMovementHistory(custodianId?: string, page: number = 1) {
  const where = custodianId ? { movedById: custodianId } : {}
  
  const [total, movements] = await Promise.all([
    prisma.equipmentMovement.count({ where }),
    prisma.equipmentMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        equipment: true,
        movedBy: true,
        guard: true,
      },
    }),
  ])

  return { movements, total }
}

export default async function MovementHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ custodian?: string; page?: string }>
}) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || '1', 10) || 1)
  const session = await getServerSession(authOptions)
  const isSupervisor = session?.user?.role === 'SECURITY_SUPERVISOR'
  const { movements, total } = await getMovementHistory(params.custodian, currentPage)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  
  // Get custodian info if filtering
  let custodianInfo = null
  if (params.custodian) {
    custodianInfo = await prisma.user.findUnique({
      where: { id: params.custodian },
      select: { fullName: true, staffId: true }
    })
  }

  const buildPageUrl = (pageNumber: number) => {
    const sp = new URLSearchParams()
    if (params.custodian) sp.set('custodian', params.custodian)
    sp.set('page', String(pageNumber))
    return `/records/movement?${sp.toString()}`
  }

  return (
    <div className="space-y-6">
      {/* Modern Page Header */}
      <PageHeader
        icon={History}
        title={custodianInfo 
          ? `Movement History: ${custodianInfo.fullName}`
          : (isSupervisor ? 'Audit Trail: Equipment Movements' : 'Movement History')}
        subtitle={custodianInfo 
          ? `Staff ID: ${custodianInfo.staffId} • All transaction records processed by this custodian`
          : (isSupervisor 
            ? 'Supervisory oversight of all check-outs, transfers, and security asset movements' 
            : 'Complete audit log tracking equipment issues, returns, and custody changes')}
        badge={isSupervisor ? 'Supervisory Audit' : 'Transaction Log'}
        color="indigo"
        stats={[
          { label: 'Total Events', value: total },
          { label: 'Page', value: `${currentPage} of ${totalPages}` },
        ]}
        actions={
          custodianInfo ? (
            <Link href="/dashboard">
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to Dashboard
              </Button>
            </Link>
          ) : undefined
        }
      />

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {isSupervisor ? 'Audit Log' : 'Movement History'}
            </CardTitle>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {movements.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0} to{' '}
              {Math.min(currentPage * PAGE_SIZE, total)} of {total} records
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Action</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Equipment</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Guard</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Processed By</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Condition</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Duty Point</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8">
                      <EmptyState
                        icon={History}
                        title="No Movement Records"
                        description={
                          custodianInfo
                            ? `No transaction records found for ${custodianInfo.fullName}.`
                            : 'No equipment checkout or return logs found.'
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap text-xs">
                        {new Date(movement.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={movement.action} />
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{movement.equipment?.itemName || 'Unknown'}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{movement.guard?.fullName || '-'}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{movement.movedBy?.fullName || 'Unknown'}</td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">{movement.quantity}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{movement.condition || '-'}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{movement.dutyPoint || '-'}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs">{movement.remarks || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Server-Side Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Page <span className="font-semibold text-slate-900 dark:text-white">{currentPage}</span> of{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                {currentPage > 1 ? (
                  <Link href={buildPageUrl(currentPage - 1)}>
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs border-slate-200 dark:border-slate-700">
                      <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                      Previous
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="h-8 px-2 text-xs border-slate-200 dark:border-slate-700">
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    Previous
                  </Button>
                )}

                {currentPage < totalPages ? (
                  <Link href={buildPageUrl(currentPage + 1)}>
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs border-slate-200 dark:border-slate-700">
                      Next
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="h-8 px-2 text-xs border-slate-200 dark:border-slate-700">
                    Next
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

