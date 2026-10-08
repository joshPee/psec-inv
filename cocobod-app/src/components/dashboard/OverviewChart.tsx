'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity } from 'lucide-react'

interface OverviewChartProps {
  data: {
    date: string
    issued: number
    returned: number
  }[]
}

export default function OverviewChart({ data }: OverviewChartProps) {
  // If no data is provided, generate some dummy data for the demonstration
  const chartData = data && data.length > 0 ? data : [
    { date: 'Mon', issued: 12, returned: 10 },
    { date: 'Tue', issued: 15, returned: 13 },
    { date: 'Wed', issued: 8, returned: 15 },
    { date: 'Thu', issued: 22, returned: 18 },
    { date: 'Fri', issued: 18, returned: 25 },
    { date: 'Sat', issued: 5, returned: 8 },
    { date: 'Sun', issued: 3, returned: 4 },
  ]

  return (
    <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all h-full">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Activity Overview
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Equipment issuance and returns over the last 7 days.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  fontSize: '13px',
                }}
                itemStyle={{ fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="issued"
                name="Issued"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIssued)"
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="returned"
                name="Returned"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReturned)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
