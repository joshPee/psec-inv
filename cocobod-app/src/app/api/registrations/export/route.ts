import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('q') || '';
    const filterStatus = searchParams.get('status') || 'ALL';
    const filterSource = searchParams.get('source') || 'ALL';
    const sortBy = searchParams.get('sortBy') || 'registration_date';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';

    // Build the WHERE clause conditions
    const conditions = ["(event_id = (SELECT id FROM events WHERE status = 'ACTIVE' LIMIT 1) OR event_id IS NULL)"];
    const params: any[] = [];
    let paramIndex = 1;

    if (searchQuery) {
      const searchTerm = `%${searchQuery.toLowerCase()}%`;
      conditions.push(`(LOWER(registration_code) LIKE $${paramIndex} OR LOWER(full_name) LIKE $${paramIndex} OR LOWER(organisation) LIKE $${paramIndex})`);
      params.push(searchTerm);
      paramIndex++;
    }

    if (filterStatus !== 'ALL') {
      conditions.push(`check_in_status = $${paramIndex}`);
      params.push(filterStatus);
      paramIndex++;
    }

    if (filterSource !== 'ALL') {
      conditions.push(`registration_source = $${paramIndex}`);
      params.push(filterSource);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate and set sort column
    const validSortColumns = ['registration_code', 'full_name', 'organisation', 'registration_date', 'sort_order'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'sort_order';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // Build the full query
    const query = `
      SELECT 
        registration_code,
        full_name,
        organisation,
        position,
        phone,
        registration_date,
        check_in_status,
        check_in_date,
        registration_source,
        sort_order
      FROM participants
      ${whereClause}
      ORDER BY ${sortColumn} ${order}
    `;

    const result = await pool.query(query, params);

    // Generate CSV
    const headers = ['Registration Code', 'Full Name', 'Organisation', 'Position', 'Phone', 'Registration Date', 'Check-in Status', 'Check-in Time', 'Source'];
    const rows = result.rows.map(row => [
      row.registration_code,
      row.full_name,
      row.organisation,
      row.position,
      row.phone || '',
      new Date(row.registration_date).toLocaleDateString(),
      row.check_in_status === 'CHECKED_IN' ? 'Checked In' : 'Not Checked In',
      row.check_in_date ? new Date(row.check_in_date).toLocaleString() : '',
      row.registration_source === 'ONLINE' ? 'Online' : 'Walk-in'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="registrations-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}
