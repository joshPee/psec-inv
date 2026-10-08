import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await pool.query(`
      SELECT 
        full_name,
        email,
        phone,
        organisation,
        position,
        region,
        tags,
        CASE WHEN registered THEN 'Registered' ELSE 'Pending' END as registration_status,
        CASE WHEN check_in_status = 'CHECKED_IN' THEN 'Checked In' ELSE 'Not Checked In' END as check_in_status,
        registered_at,
        check_in_date
      FROM expected_attendees
      ORDER BY created_at DESC
    `);

    // Convert to CSV
    const headers = ['Full Name', 'Email', 'Phone', 'Organisation', 'Position', 'Region', 'Tags', 'Registration Status', 'Check-In Status', 'Registration Date', 'Check-In Date'];
    const rows = result.rows.map(row => [
      row.full_name,
      row.email || '',
      row.phone || '',
      row.organisation,
      row.position || '',
      row.region || '',
      row.tags || '',
      row.registration_status,
      row.check_in_status,
      row.registered_at ? new Date(row.registered_at).toLocaleDateString() : '',
      row.check_in_date ? new Date(row.check_in_date).toLocaleString() : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="expected-attendees-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting expected attendees:', error);
    return NextResponse.json(
      { error: 'Failed to export expected attendees' },
      { status: 500 }
    );
  }
}
