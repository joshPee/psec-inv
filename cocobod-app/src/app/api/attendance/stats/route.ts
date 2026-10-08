import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getCached, setCached } from '@/lib/db';

export async function GET() {
  try {
    // Check cache first
    const cacheKey = 'attendance:stats';
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE participant_status = 'REGISTERED') as total_registered,
        COUNT(*) FILTER (WHERE check_in_status = 'CHECKED_IN') as total_checked_in,
        COUNT(*) FILTER (WHERE check_in_status = 'NOT_CHECKED_IN') as total_not_checked_in
      FROM participants
      WHERE (event_id = (SELECT id FROM events WHERE status = 'ACTIVE' LIMIT 1) OR event_id IS NULL)
    `);

    const result = stats.rows[0];
    const totalRegistered = parseInt(result.total_registered);
    const totalCheckedIn = parseInt(result.total_checked_in);
    const totalExpected = 39; // Fixed target of 39 total expected participants (33 existing + 6 TMA)
    const totalNotCheckedIn = totalExpected - totalCheckedIn; // Calculate not checked in
    const attendancePercentage = totalRegistered > 0 
      ? Math.round((totalCheckedIn / totalRegistered) * 100) 
      : 0;

    const responseData = {
      totalRegistered,
      totalCheckedIn,
      totalNotCheckedIn,
      attendancePercentage
    };

    // Cache the result
    setCached(cacheKey, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance stats' },
      { status: 500 }
    );
  }
}
