import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'daily';
    const range = searchParams.get('range') || 'today';
    const customStartDate = searchParams.get('startDate');
    const customEndDate = searchParams.get('endDate');

    if (!sql) {
      return NextResponse.json([]);
    }

    const today = new Date();
    let startDate: Date;
    let endDate: Date = new Date(today);
    endDate.setHours(23, 59, 59, 999); // End of today

    // Calculate date range
    if (range === 'custom' && customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999); // End of the day
    } else {
      switch (range) {
        case 'today':
          startDate = new Date(today);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          break;
        case '3months':
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 3);
          startDate.setHours(0, 0, 0, 0);
          break;
        default:
          startDate = new Date(today);
          startDate.setHours(0, 0, 0, 0);
      }
    }

    let result: any[];

    switch (type) {
      case 'daily':
        result = await sql`
          SELECT 
            DATE(check_in_date) as date,
            COUNT(*) as checkIns,
            COUNT(*) FILTER (WHERE check_in_status = 'CHECKED_OUT') as checkOuts
          FROM participants
          WHERE check_in_date >= ${startDate} AND check_in_date <= ${endDate}
          GROUP BY DATE(check_in_date)
          ORDER BY date DESC
        `;
        break;

      case 'weekly':
        result = await sql`
          SELECT 
            DATE_TRUNC('week', check_in_date)::date as week,
            COUNT(*) as checkIns,
            COUNT(*) FILTER (WHERE check_in_status = 'CHECKED_OUT') as checkOuts
          FROM participants
          WHERE check_in_date >= ${startDate} AND check_in_date <= ${endDate}
          GROUP BY DATE_TRUNC('week', check_in_date)
          ORDER BY week DESC
        `;
        break;

      case 'monthly':
        result = await sql`
          SELECT 
            DATE_TRUNC('month', check_in_date)::date as month,
            COUNT(*) as checkIns,
            COUNT(*) FILTER (WHERE check_in_status = 'CHECKED_OUT') as checkOuts
          FROM participants
          WHERE check_in_date >= ${startDate} AND check_in_date <= ${endDate}
          GROUP BY DATE_TRUNC('month', check_in_date)
          ORDER BY month DESC
        `;
        break;

      default:
        result = await sql`
          SELECT 
            DATE(check_in_date) as date,
            COUNT(*) as checkIns,
            COUNT(*) FILTER (WHERE check_in_status = 'CHECKED_OUT') as checkOuts
          FROM participants
          WHERE check_in_date >= ${startDate} AND check_in_date <= ${endDate}
          GROUP BY DATE(check_in_date)
          ORDER BY date DESC
        `;
    }

    const formattedData = result.map((row: any) => ({
      date: row.date?.toISOString().split('T')[0] || null,
      week: row.week?.toISOString().split('T')[0] || null,
      month: row.month?.toISOString().split('T')[0] || null,
      checkIns: parseInt(row.checkins) || 0,
      checkOuts: parseInt(row.checkouts) || 0,
    }));

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    );
  }
}
