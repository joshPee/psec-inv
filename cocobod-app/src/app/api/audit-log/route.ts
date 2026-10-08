import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const exportMode = searchParams.get('export') === 'true';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!sql) {
      return NextResponse.json({ error: 'Database connection not available' }, { status: 500 });
    }

    let logs: any[];
    
    if (exportMode) {
      // Export mode - return all data without pagination
      let query = sql`
        SELECT 
          vl.id,
          vl.action,
          vl.action_time,
          vl.details,
          vl.ip_address,
          p.full_name as participant_name,
          p.registration_code,
          u.name as user_name,
          u.email as user_email
        FROM visitor_logs vl
        LEFT JOIN participants p ON vl.participant_id = p.id
        LEFT JOIN users u ON vl.user_id = u.id
        WHERE 1=1
      `;
      
      if (startDate) {
        query = sql`${query} AND vl.action_time >= ${startDate} 00:00:00`;
      }
      
      if (endDate) {
        query = sql`${query} AND vl.action_time <= ${endDate} 23:59:59`;
      }
      
      query = sql`${query} ORDER BY vl.action_time DESC`;
      logs = await query;
      
      return NextResponse.json(logs);
    } else {
      // Normal pagination mode
      let query = sql`
        SELECT 
          vl.id,
          vl.action,
          vl.action_time,
          vl.details,
          vl.ip_address,
          p.full_name as participant_name,
          p.registration_code,
          u.name as user_name,
          u.email as user_email
        FROM visitor_logs vl
        LEFT JOIN participants p ON vl.participant_id = p.id
        LEFT JOIN users u ON vl.user_id = u.id
        WHERE 1=1
      `;
      
      if (startDate) {
        query = sql`${query} AND vl.action_time >= ${startDate} 00:00:00`;
      }
      
      if (endDate) {
        query = sql`${query} AND vl.action_time <= ${endDate} 23:59:59`;
      }
      
      query = sql`${query} ORDER BY vl.action_time DESC LIMIT ${limit} OFFSET ${offset}`;
      logs = await query;

      // Count with same date filters
      let countQuery = sql`SELECT COUNT(*) as total FROM visitor_logs WHERE 1=1`;
      if (startDate) {
        countQuery = sql`${countQuery} AND action_time >= ${startDate} 00:00:00`;
      }
      if (endDate) {
        countQuery = sql`${countQuery} AND action_time <= ${endDate} 23:59:59`;
      }
      const countResult = await countQuery;

      return NextResponse.json({
        logs,
        total: countResult[0]?.total || 0,
        limit,
        offset
      });
    }
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit log' },
      { status: 500 }
    );
  }
}