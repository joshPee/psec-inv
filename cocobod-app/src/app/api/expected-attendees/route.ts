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

    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const registration = searchParams.get('registration') || 'ALL';
    const checkIn = searchParams.get('checkIn') || 'ALL';

    let query = `
      SELECT 
        id,
        full_name,
        email,
        phone,
        organisation,
        position,
        region,
        tags,
        registered,
        registered_at,
        check_in_status,
        check_in_date,
        participant_id,
        reminder_sent
      FROM expected_attendees
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Search functionality with fuzzy matching
    if (q) {
      // Remove special characters and normalize the search term
      const normalizedSearch = q.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
      const searchWords = normalizedSearch.split(' ').filter(word => word.length > 0);
      
      if (searchWords.length > 0) {
        const searchConditions = searchWords.map((word, index) => {
          const paramNum = paramIndex + index;
          return `(LOWER(full_name) LIKE LOWER($${paramNum}) OR
                  LOWER(position) LIKE LOWER($${paramNum}) OR
                  LOWER(organisation) LIKE LOWER($${paramNum}) OR
                  LOWER(phone) LIKE LOWER($${paramNum}) OR
                  LOWER(email) LIKE LOWER($${paramNum}))`;
        }).join(' AND ');
        
        query += ` AND (${searchConditions})`;
        
        // Push parameters for each word
        searchWords.forEach(word => {
          params.push(`%${word}%`);
          paramIndex++;
        });
      }
    }

    // Registration status filter
    if (registration === 'REGISTERED') {
      query += ` AND registered = true`;
    } else if (registration === 'PENDING') {
      query += ` AND registered = false`;
    }

    // Check-in status filter
    if (checkIn === 'CHECKED_IN') {
      query += ` AND check_in_status = 'CHECKED_IN'`;
    } else if (checkIn === 'NOT_CHECKED_IN') {
      query += ` AND check_in_status = 'NOT_CHECKED_IN'`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching expected attendees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expected attendees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { full_name, email, phone, organisation, position, region, tags } = body;

    // Validate input
    if (!full_name || !organisation) {
      return NextResponse.json(
        { error: 'Full name and organisation are required' },
        { status: 400 }
      );
    }

    // Check for duplicate
    const duplicateCheck = await pool.query(
      'SELECT id FROM expected_attendees WHERE LOWER(full_name) = LOWER($1) AND LOWER(organisation) = LOWER($2)',
      [full_name, organisation]
    );

    if (duplicateCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Expected attendee with this name and organisation already exists' },
        { status: 409 }
      );
    }

    // Insert expected attendee
    const result = await pool.query(
      `INSERT INTO expected_attendees (full_name, email, phone, organisation, position, region, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [full_name, email || null, phone || null, organisation, position || null, region || null, tags || null]
    );

    return NextResponse.json({
      success: true,
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Error adding expected attendee:', error);
    return NextResponse.json(
      { error: 'Failed to add expected attendee' },
      { status: 500 }
    );
  }
}
