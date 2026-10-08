'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
} from '@/components/ui/dialog'
import {
  Radio,
  Send,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Shield,
  Plus,
  RefreshCw,
  Clock,
  UserCheck,
  FileText,
  BellRing,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useToast } from '@/components/ui/toast'

interface DirectiveItem {
  id: string
  title: string
  message: string
  createdAt: string
  read?: boolean
}

interface HandoverItem {
  id: string
  title: string
  message: string
  createdAt: string
  read?: boolean
}

interface ArmoryDirectivesCardProps {
  isSupervisor: boolean
  currentUserName: string
  currentUserRole: string
}

export default function ArmoryDirectivesCard({
  isSupervisor,
  currentUserName,
  currentUserRole,
}: ArmoryDirectivesCardProps) {
  const { toast } = useToast()
  const [directives, setDirectives] = useState<DirectiveItem[]>([])
  const [handovers, setHandovers] = useState<HandoverItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'directives' | 'handovers'>('directives')

  // Modals
  const [isDirectiveModalOpen, setIsDirectiveModalOpen] = useState(false)
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false)

  // Form states
  const [directiveTitle, setDirectiveTitle] = useState('')
  const [directiveContent, setDirectiveContent] = useState('')
  const [directivePriority, setDirectivePriority] = useState<'ROUTINE' | 'HIGH' | 'URGENT'>('HIGH')
  const [submittingDirective, setSubmittingDirective] = useState(false)

  const [handoverShift, setHandoverShift] = useState<'DAY' | 'NIGHT' | 'WEEKEND'>('DAY')
  const [handoverSummary, setHandoverSummary] = useState('')
  const [submittingHandover, setSubmittingHandover] = useState(false)

  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set())

  const fetchCommunications = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/directives')
      if (res.ok) {
        const data = await res.json()
        setDirectives(data.directives || [])
        setHandovers(data.handovers || [])
      }
    } catch (err) {
      console.error('Error fetching directives:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommunications()
    const interval = setInterval(fetchCommunications, 20000)
    return () => clearInterval(interval)
  }, [])

  const handlePostDirective = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!directiveTitle || !directiveContent) {
      toast.error('Please fill in both title and directive instructions')
      return
    }

    try {
      setSubmittingDirective(true)
      const res = await fetch('/api/directives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'POST_DIRECTIVE',
          title: directiveTitle,
          content: directiveContent,
          priority: directivePriority,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success('Directive broadcasted to all active custodians.')
        setIsDirectiveModalOpen(false)
        setDirectiveTitle('')
        setDirectiveContent('')
        fetchCommunications()
      } else {
        toast.error(data.error || 'Failed to post directive')
      }
    } catch {
      toast.error('Error publishing directive')
    } finally {
      setSubmittingDirective(false)
    }
  }

  const handleSubmitHandover = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!handoverSummary) {
      toast.error('Please provide a handover summary or physical count log')
      return
    }

    try {
      setSubmittingHandover(true)
      const res = await fetch('/api/directives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SUBMIT_HANDOVER',
          shift: handoverShift,
          summary: handoverSummary,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success('Shift handover submitted to Security Supervisor.')
        setIsHandoverModalOpen(false)
        setHandoverSummary('')
        fetchCommunications()
      } else {
        toast.error(data.error || 'Failed to submit handover')
      }
    } catch {
      toast.error('Error submitting handover')
    } finally {
      setSubmittingHandover(false)
    }
  }

  const handleAcknowledge = async (directive: DirectiveItem) => {
    try {
      setAcknowledgedIds((prev) => new Set(prev).add(directive.id))
      const res = await fetch('/api/directives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ACKNOWLEDGE_DIRECTIVE',
          notificationId: directive.id,
          directiveTitle: directive.title,
        }),
      })

      if (res.ok) {
        toast.success(`Acknowledged: "${directive.title}"`)
      }
    } catch {
      toast.error('Failed to register acknowledgement')
    }
  }

  const getPriorityBadge = (title: string) => {
    if (title.includes('URGENT') || title.includes('CRITICAL')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800 uppercase tracking-wider flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Urgent
        </span>
      )
    }
    if (title.includes('HIGH')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase tracking-wider flex items-center gap-1">
          <BellRing className="h-3 w-3" />
          High Priority
        </span>
      )
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800 uppercase tracking-wider flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Directive
      </span>
    )
  }

  return (
    <>
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Header with gradient edge */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 pt-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Armory Comms & Shift Directives
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Synchronized operational channel connecting Supervisors & Custodians on duty.
                </CardDescription>
              </div>
            </div>

            {/* Action Buttons based on role */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchCommunications}
                disabled={loading}
                className="h-8 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                title="Refresh Communications"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </Button>

              {isSupervisor ? (
                <Button
                  size="sm"
                  onClick={() => setIsDirectiveModalOpen(true)}
                  className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Issue Directive
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsHandoverModalOpen(true)}
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs flex items-center gap-1.5"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  Submit Shift Handover
                </Button>
              )}
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => setActiveTab('directives')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'directives'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              Active Directives
              {directives.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200 font-bold">
                  {directives.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('handovers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'handovers'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              Shift Handovers & Logs
              {handovers.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 font-bold">
                  {handovers.length}
                </span>
              )}
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          {activeTab === 'directives' ? (
            directives.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <Shield className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No active armory directives
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isSupervisor
                    ? 'Use the button above to broadcast priority instructions to custodians on duty.'
                    : 'All systems standard. Stand by for shift instructions.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {directives.map((item) => {
                  const isAcked = acknowledgedIds.has(item.id) || item.read
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {getPriorityBadge(item.title)}
                          <span className="font-semibold text-xs text-slate-900 dark:text-white">
                            {item.title.replace(/^\[.*?\]\s*/, '')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {item.message}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      {/* Acknowledgement Action for Custodian */}
                      {!isSupervisor && (
                        <div className="shrink-0 sm:self-center">
                          {isAcked ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Confirmed
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcknowledge(item)}
                              className="h-8 text-xs border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-1"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            handovers.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <ClipboardList className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No shift handovers logged today
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Custodians can log equipment count verifications and armory turnover notes here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {handovers.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-purple-200/80 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 uppercase tracking-wider">
                          Handover Log
                        </span>
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {item.message}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Modal: Post Armory Directive (Supervisor) */}
      <Dialog open={isDirectiveModalOpen} onOpenChange={setIsDirectiveModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Broadcast Armory Directive
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Transmit an operational instruction to all Equipment Custodians on duty.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePostDirective} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Priority Level
              </Label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {(['ROUTINE', 'HIGH', 'URGENT'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDirectivePriority(p)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center ${
                      directivePriority === p
                        ? p === 'URGENT'
                          ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : p === 'HIGH'
                          ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="directive-title" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Directive Subject
              </Label>
              <Input
                id="directive-title"
                value={directiveTitle}
                onChange={(e) => setDirectiveTitle(e.target.value)}
                placeholder="e.g. Inspect all body cams before 18:00 shift change"
                required
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="directive-content" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Detailed Instructions
              </Label>
              <textarea
                id="directive-content"
                value={directiveContent}
                onChange={(e) => setDirectiveContent(e.target.value)}
                placeholder="Specify requirements, equipment codes, priority holding for VIP escort, or specific guard check instructions..."
                rows={4}
                required
                className="w-full mt-1 p-3 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDirectiveModalOpen(false)}
                disabled={submittingDirective}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submittingDirective}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                {submittingDirective ? 'Broadcasting...' : 'Broadcast Directive'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Submit Shift Handover (Custodian) */}
      <Dialog open={isHandoverModalOpen} onOpenChange={setIsHandoverModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-emerald-600" />
              Log Shift Handover
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Submit armory physical count reconciliation and notes to the Security Supervisor.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitHandover} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Shift
              </Label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {(['DAY', 'NIGHT', 'WEEKEND'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setHandoverShift(s)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center ${
                      handoverShift === s
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {s} Shift
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="handover-summary" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Physical Inventory & Shift Summary
              </Label>
              <textarea
                id="handover-summary"
                value={handoverSummary}
                onChange={(e) => setHandoverSummary(e.target.value)}
                placeholder="e.g. Physical inventory verified: All active radios accounted for. Vault locked with seal #9021. Battery dock fully charged. Relieving custodian John Mensah on post."
                rows={5}
                required
                className="w-full mt-1 p-3 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsHandoverModalOpen(false)}
                disabled={submittingHandover}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submittingHandover}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                {submittingHandover ? 'Submitting...' : 'Submit Handover'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
