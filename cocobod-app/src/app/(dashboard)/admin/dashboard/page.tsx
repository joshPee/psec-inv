import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardTopBar } from '@/components/DashboardTopBar';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, CheckCircle, Clock, Percent, ArrowRight, BarChart3, LogOut, TrendingUp } from 'lucide-react';

async function getDashboardStats() {
  if (!sql) {
    console.warn('Database connection not available');
    return {
      visitorsInside: 0,
      todayCheckIns: 0,
      todayCheckOuts: 0,
      expectedVisitors: 0,
      recentActivity: []
    };
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    // Get visitors currently inside
    const visitorsInsideResult = await sql`
      SELECT COUNT(*) as count
      FROM participants
      WHERE check_in_status = 'CHECKED_IN'
    `;
    const visitorsInside = parseInt(visitorsInsideResult[0].count);

    // Get today's check-ins (all check-ins that happened today)
    const todayCheckInsResult = await sql`
      SELECT COUNT(*) as count
      FROM participants
      WHERE DATE(check_in_date) = ${today}
    `;
    const todayCheckIns = parseInt(todayCheckInsResult[0].count);

    // Get today's check-outs
    const todayCheckOutsResult = await sql`
      SELECT COUNT(*) as count
      FROM participants
      WHERE check_in_status = 'CHECKED_OUT'
      AND DATE(check_out_date) = ${today}
    `;
    const todayCheckOuts = parseInt(todayCheckOutsResult[0].count);

    // Get expected visitors (registered but not checked in)
    const expectedVisitorsResult = await sql`
      SELECT COUNT(*) as count
      FROM participants
      WHERE participant_status = 'REGISTERED'
      AND check_in_status = 'NOT_CHECKED_IN'
    `;
    const expectedVisitors = parseInt(expectedVisitorsResult[0].count);

    // Get recent activity (last 10 check-ins/check-outs)
    const recentActivityResult = await sql`
      SELECT
        p.full_name,
        p.organisation,
        p.check_in_status,
        p.check_in_date,
        p.check_out_date
      FROM participants p
      WHERE p.check_in_status IN ('CHECKED_IN', 'CHECKED_OUT')
      ORDER BY COALESCE(p.check_out_date, p.check_in_date) DESC
      LIMIT 10
    `;
    const recentActivity = recentActivityResult.map((row: any) => ({
      fullName: row.full_name,
      organisation: row.organisation,
      status: row.check_in_status,
      date: row.check_out_date || row.check_in_date
    }));

    // Get peak hours (check-ins by hour for the last 7 days)
    const peakHoursResult = await sql`
      SELECT
        EXTRACT(HOUR FROM check_in_date) as hour,
        COUNT(*) as check_in_count
      FROM participants
      WHERE check_in_date >= NOW() - INTERVAL '7 days'
      AND check_in_status IN ('CHECKED_IN', 'CHECKED_OUT')
      GROUP BY EXTRACT(HOUR FROM check_in_date)
      ORDER BY check_in_count DESC
      LIMIT 5
    `;
    const peakHours = peakHoursResult.map((row: any) => ({
      hour: parseInt(row.hour),
      count: parseInt(row.check_in_count),
      timeLabel: `${row.hour}:00 - ${row.hour}:59`
    }));

    return {
      visitorsInside,
      todayCheckIns,
      todayCheckOuts,
      expectedVisitors,
      recentActivity,
      peakHours
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      visitorsInside: 0,
      todayCheckIns: 0,
      todayCheckOuts: 0,
      expectedVisitors: 0,
      recentActivity: [],
      peakHours: []
    };
  }
}

async function getActiveEvent() {
  return null;
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/admin/login');
  }

  const stats = await getDashboardStats();
  const activeEvent = await getActiveEvent();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Visitors Inside - Blue */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-semibold text-blue-600">Visitors Inside</span>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2 sm:mb-3">
            <span className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.visitorsInside}</span>
            <span className="text-xs sm:text-sm text-blue-600">currently on site</span>
          </div>
        </div>

        {/* Today's Check-ins - Green */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-semibold text-green-600">Today's Check-ins</span>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2 sm:mb-3">
            <span className="text-2xl sm:text-3xl font-bold text-green-600">{stats.todayCheckIns}</span>
            <span className="text-xs sm:text-sm text-green-600">checked in today</span>
          </div>
        </div>

        {/* Today's Check-outs - Amber */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-semibold text-amber-600">Today's Check-outs</span>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-amber-50 flex items-center justify-center">
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2 sm:mb-3">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600">{stats.todayCheckOuts}</span>
            <span className="text-xs sm:text-sm text-amber-600">checked out today</span>
          </div>
        </div>

        {/* Expected Visitors - Purple */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-semibold text-purple-600">Expected Visitors</span>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2 sm:mb-3">
            <span className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.expectedVisitors}</span>
            <span className="text-xs sm:text-sm text-purple-600">expected arrivals</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      activity.status === 'CHECKED_IN' ? 'bg-green-50' : 'bg-amber-50'
                    }`}>
                      {activity.status === 'CHECKED_IN' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <LogOut className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.fullName}</p>
                      <p className="text-xs text-gray-500">{activity.organisation}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={activity.status === 'CHECKED_IN' ? 'default' : 'secondary'}>
                      {activity.status === 'CHECKED_IN' ? 'Checked In' : 'Checked Out'}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Peak Hours Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Peak Hours (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.peakHours.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No data available</p>
          ) : (
            <div className="space-y-3">
              {stats.peakHours.map((peak: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{peak.timeLabel}</p>
                      <p className="text-xs text-gray-500">Busiest time slot</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-700">{peak.count}</p>
                    <p className="text-xs text-gray-500">check-ins</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link
              href="/admin/check-in"
              className="group"
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-blue-700/20 hover:border-blue-700 hover:bg-blue-700/5">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-700/10 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-blue-700" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-blue-700">Check In</h3>
                        <p className="text-[10px] text-muted-foreground hidden sm:block mt-0.5">Register visitor arrival</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-blue-700 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link
              href="/admin/visitors"
              className="group"
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-blue-700/20 hover:border-blue-700 hover:bg-blue-700/5">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-700/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-700" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-blue-700">View Visitors</h3>
                        <p className="text-[10px] text-muted-foreground hidden sm:block mt-0.5">Manage all visitors</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-blue-700 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link
              href="/admin/check-out"
              className="group"
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-blue-700/20 hover:border-blue-700 hover:bg-blue-700/5">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-700/10 flex items-center justify-center">
                        <LogOut className="h-4 w-4 text-blue-700" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-blue-700">Check Out</h3>
                        <p className="text-[10px] text-muted-foreground hidden sm:block mt-0.5">Register visitor departure</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-blue-700 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
