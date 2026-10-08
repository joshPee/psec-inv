import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'

export interface SummaryCardProps {
  title: string
  value: string | number
  subtitle?: React.ReactNode
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
  accentColor?: string
  valueColor?: string
  badge?: {
    text: string
    variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'slate' | 'purple'
  }
  liveIndicator?: boolean
  trend?: {
    value: string
    positive?: boolean
  }
  /** Mini bar chart data (array of values 0-100). If omitted, auto-generated from value. */
  chartData?: number[]
  /** Color for the mini bar chart bars */
  chartColor?: string
  /** Bottom-left text, e.g. "26 Attended" */
  footerText?: string
  /** Array of avatar initials or image URLs for the footer row */
  footerAvatars?: string[]
  href?: string
  linkText?: string
  className?: string
}

const badgeVariants = {
  emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200/80 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800/80',
  amber: 'text-amber-700 bg-amber-50 border-amber-200/80 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800/80',
  rose: 'text-rose-700 bg-rose-50 border-rose-200/80 dark:text-rose-300 dark:bg-rose-950/60 dark:border-rose-800/80',
  blue: 'text-blue-700 bg-blue-50 border-blue-200/80 dark:text-blue-300 dark:bg-blue-950/60 dark:border-blue-800/80',
  slate: 'text-slate-700 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800/80 dark:border-slate-700/80',
  purple: 'text-purple-700 bg-purple-50 border-purple-200/80 dark:text-purple-300 dark:bg-purple-950/60 dark:border-purple-800/80',
}

/** Generate pseudo-random but deterministic bar chart data from a seed string */
function generateChartData(seed: string | number): number[] {
  const s = String(seed)
  const bars: number[] = []
  for (let i = 0; i < 20; i++) {
    const charCode = s.charCodeAt(i % s.length) || 65
    bars.push(20 + ((charCode * (i + 1) * 7) % 80))
  }
  return bars
}

/** Mini bar chart component */
function MiniBarChart({ data, color = 'bg-slate-300 dark:bg-slate-600' }: { data: number[]; color?: string }) {
  return (
    <div className="flex items-end gap-[2px] h-4 w-full">
      {data.map((value, i) => (
        <div
          key={i}
          className={cn('flex-1 rounded-[1px] min-w-[2px] transition-all duration-300', color)}
          style={{ height: `${Math.max(value, 8)}%`, opacity: 0.5 + (value / 200) }}
        />
      ))}
    </div>
  )
}

/** Avatar circle component */
function AvatarCircle({ initial, index }: { initial: string; index: number }) {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-teal-500'
  ]
  return (
    <div
      className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900',
        colors[index % colors.length]
      )}
      style={{ marginLeft: index > 0 ? '-6px' : '0' }}
    >
      {initial.charAt(0).toUpperCase()}
    </div>
  )
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-slate-600 dark:text-slate-300',
  iconBgColor = 'bg-slate-100 dark:bg-slate-800',
  accentColor,
  valueColor = 'text-slate-900 dark:text-white',
  badge,
  liveIndicator,
  trend,
  chartData,
  chartColor,
  footerText,
  footerAvatars,
  href,
  className,
}: SummaryCardProps) {
  // Auto-generate chart data if not provided
  const bars = chartData || generateChartData(String(value) + title)
  
  // Determine chart bar color from iconColor or explicit chartColor
  const barColor = chartColor || (
    iconColor.includes('blue') ? 'bg-blue-400/70 dark:bg-blue-500/50' :
    iconColor.includes('indigo') ? 'bg-indigo-400/70 dark:bg-indigo-500/50' :
    iconColor.includes('amber') ? 'bg-amber-400/70 dark:bg-amber-500/50' :
    iconColor.includes('rose') ? 'bg-rose-400/70 dark:bg-rose-500/50' :
    iconColor.includes('teal') || iconColor.includes('emerald') ? 'bg-emerald-400/70 dark:bg-emerald-500/50' :
    iconColor.includes('purple') ? 'bg-purple-400/70 dark:bg-purple-500/50' :
    'bg-slate-300/70 dark:bg-slate-600/50'
  )

  const cardInner = (
    <Card className={cn(
      'group relative border border-slate-200/80 dark:border-slate-800/80 shadow-sm',
      'bg-white dark:bg-slate-900/90 backdrop-blur-sm',
      'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700',
      'hover:-translate-y-0.5 transition-all duration-200 ease-out',
      'overflow-hidden h-full rounded-2xl',
      href && 'cursor-pointer',
      className
    )}>
      <CardContent className="p-4 flex flex-col justify-between h-full">
        {/* Top: Value + Icon row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Large value */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={cn('text-2xl font-extrabold tracking-tight leading-none', valueColor)}>
                {value}
              </h3>
              {liveIndicator && (
                <span className="relative flex h-2 w-2 shrink-0 mt-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </div>

            {/* Subtitle / label */}
            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
              {subtitle || title}
            </p>
          </div>

          {/* Icon badge - colored circle */}
          <div className={cn(
            'flex items-center justify-center w-8 h-8 rounded-xl shrink-0',
            'transition-transform duration-200 group-hover:scale-110',
            iconBgColor
          )}>
            <Icon className={cn('h-4 w-4', iconColor)} />
          </div>
        </div>

        {/* Badge / Trend */}
        {(badge || trend) && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {badge && (
              <span className={cn(
                'text-[10px] font-semibold px-1.5 py-0.5 rounded border leading-tight',
                badgeVariants[badge.variant || 'slate']
              )}>
                {badge.text}
              </span>
            )}
            {trend && (
              <span className={cn(
                'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                trend.positive
                  ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60'
                  : 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/60'
              )}>
                {trend.value}
              </span>
            )}
          </div>
        )}

        {/* Bottom section: Chart + Avatars footer */}
        <div className="mt-4 space-y-2">
          {/* Mini bar chart */}
          <MiniBarChart data={bars} color={barColor} />

          {/* Footer row: avatars + text */}
          {(footerAvatars || footerText) && (
            <div className="flex items-center gap-2">
              {footerAvatars && footerAvatars.length > 0 && (
                <div className="flex items-center">
                  {footerAvatars.slice(0, 3).map((avatar, i) => (
                    <AvatarCircle key={i} initial={avatar} index={i} />
                  ))}
                </div>
              )}
              {footerText && (
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {footerText}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href} className="block h-full">{cardInner}</Link>
  }

  return cardInner
}