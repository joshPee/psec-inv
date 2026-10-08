import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const checkInStatus = searchParams.get('checkInStatus');
    const q = searchParams.get('q') || '';

    let query = `
      SELECT 
        p.*,
        e.name as event_name,
        e.date as event_date
      FROM participants p
      LEFT JOIN events e ON p.event_id = e.id
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
          return `(LOWER(p.full_name) LIKE LOWER($${paramNum}) OR
                  LOWER(p.position) LIKE LOWER($${paramNum}) OR
                  LOWER(p.organisation) LIKE LOWER($${paramNum}) OR
                  LOWER(p.phone) LIKE LOWER($${paramNum}) OR
                  LOWER(p.email) LIKE LOWER($${paramNum}) OR
                  LOWER(p.registration_code) LIKE LOWER($${paramNum}))`;
        }).join(' AND ');
        
        query += ` AND (${searchConditions})`;
        
        // Push parameters for each word
        searchWords.forEach(word => {
          params.push(`%${word}%`);
          paramIndex++;
        });
      }
    }

    if (status && status !== 'ALL') {
      query += ' AND p.participant_status = $' + (paramIndex);
      params.push(status);
      paramIndex++;
    }

    if (checkInStatus && checkInStatus !== 'ALL') {
      query += ' AND p.check_in_status = $' + (paramIndex);
      params.push(checkInStatus);
      paramIndex++;
    }

    query += ' ORDER BY p.sort_order ASC, p.created_at DESC';

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      full_name,
      organisation,
      position,
      email,
      phone,
      region,
      tags,
      participant_status,
      event_id
    } = body;

    // Validate required fields
    if (!full_name || !organisation || !position) {
      return NextResponse.json(
        { error: 'Full name, organisation, and position are required' },
        { status: 400 }
      );
    }

    // Generate registration code if not provided
    const registration_code = body.registration_code || 
      `QCC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const query = `
      INSERT INTO participants (
        registration_code,
        full_name,
        email,
        phone,
        organisation,
        position,
        region,
        tags,
        participant_status,
        event_id,
        registration_date,
        registration_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, $11)
      RETURNING *
    `;

    const values = [
      registration_code,
      full_name,
      email || null,
      phone || null,
      organisation,
      position || null,
      region || null,
      tags || null,
      participant_status || 'EXPECTED',
      event_id || null,
      participant_status === 'REGISTERED' ? 'REGISTERED' : 'PENDING'
    ];

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating participant:', error);
    return NextResponse.json(
      { error: 'Failed to create participant' },
      { status: 500 }
    );
  }
}
