import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const checkInStatus = searchParams.get('checkInStatus');

    if (!query || query.trim().length < 3) {
      return NextResponse.json([]);
    }

    // Remove special characters and normalize the search term
    const normalizedSearch = query.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    const searchWords = normalizedSearch.split(' ').filter(word => word.length > 0);
    
    if (searchWords.length === 0) {
      return NextResponse.json([]);
    }

    let sqlQuery = `
      SELECT 
        id,
        registration_code,
        full_name,
        organisation,
        position,
        phone,
        check_in_status,
        check_in_date,
        registration_source
      FROM participants
      WHERE (event_id = (SELECT id FROM events WHERE status = 'ACTIVE' LIMIT 1) OR event_id IS NULL)
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Build fuzzy search conditions
    const searchConditions = searchWords.map((word) => {
      const paramNum = paramIndex++;
      return `(LOWER(registration_code) LIKE LOWER($${paramNum}) OR
              LOWER(full_name) LIKE LOWER($${paramNum}) OR
              LOWER(organisation) LIKE LOWER($${paramNum}) OR
              LOWER(phone) LIKE LOWER($${paramNum}))`;
    }).join(' AND ');

    sqlQuery += ` AND (${searchConditions})`;

    // Push parameters for each word first
    searchWords.forEach(word => {
      const searchTerm = `%${word}%`;
      params.push(searchTerm);
    });

    // Filter by check-in status if provided
    if (checkInStatus && checkInStatus !== 'ALL') {
      sqlQuery += ` AND check_in_status = $${paramIndex}`;
      params.push(checkInStatus);
      paramIndex++;
    }

    sqlQuery += ` ORDER BY full_name LIMIT 20`;

    const result = await pool.query(sqlQuery, params);

    console.log('Search results:', result.rows);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}
