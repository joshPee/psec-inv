import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const activeVisitors = await sql`
      SELECT 
        p.id,
        p.full_name,
        p.organisation,
        p.position,
        p.visitor_type,
        p.host_name,
        p.host_department,
        p.visit_purpose,
        p.registration_code,
        p.check_in_date,
        p.expected_departure,
        u.name as checked_in_by,
        e.name as event_name
      FROM participants p
      JOIN check_ins ci ON p.id = ci.participant_id
      LEFT JOIN users u ON ci.user_id = u.id
      LEFT JOIN events e ON p.event_id = e.id
      WHERE p.check_in_status = 'CHECKED_IN'
      ORDER BY p.check_in_date DESC
    `;

    return NextResponse.json(activeVisitors);
  } catch (error) {
    console.error('Error fetching active visitors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active visitors' },
      { status: 500 }
    );
  }
}
