import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function getMovementHistory(custodianId?: string) {
  const where = custodianId ? { movedById: custodianId } : {}
  
  return await prisma.equipmentMovement.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      equipment: true,
      movedBy: true,
      guard: true,
    },
  })
}

export default async function MovementHistoryPage({
  searchParams,
}: {
  searchParams: { custodian?: string }
}) {
  const session = await getServerSession(authOptions)
  const isSupervisor = session?.user?.role === 'SECURITY_SUPERVISOR'
  const movements = await getMovementHistory(searchParams.custodian)
  
  // Get custodian info if filtering
  let custodianInfo = null
  if (searchParams.custodian) {
    custodianInfo = await prisma.user.findUnique({
      where: { id: searchParams.custodian },
      select: { fullName: true, staffId: true }
    })
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(129, 140, 248, 0.2) 0%, transparent 60%)' }} />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {isSupervisor ? 'Audit Trail' : 'Transaction Log'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
              {custodianInfo 
                ? `Movement History: ${custodianInfo.fullName}`
                : (isSupervisor ? 'Audit Trail: Equipment Movements' : 'Movement History')
              }
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              {custodianInfo 
                ? `Staff ID: ${custodianInfo.staffId} • All transactions processed by this custodian`
                : (isSupervisor 
                  ? 'Supervisory oversight of all equipment movements' 
                  : 'Track all equipment movements')
              }
            </p>
          </div>
          {custodianInfo && (
            <Link href="/dashboard">
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Input
              placeholder="Search movements..."
              className="max-w-full sm:max-w-sm border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            {isSupervisor ? 'Audit Log' : 'Movement History'}
          </CardTitle>
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
                    <td colSpan={9} className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No movement history found
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
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
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{movement.remarks || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
