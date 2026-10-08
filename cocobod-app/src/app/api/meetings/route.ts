import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
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
        e.id,
        e.name,
        e.date,
        e.venue,
        e.description,
        e.status,
        e.registration_open,
        COUNT(p.id) as participant_count,
        COUNT(p.id) FILTER (WHERE p.check_in_status = 'CHECKED_IN') as checked_in_count,
        COUNT(p.id) FILTER (WHERE p.check_in_status = 'NOT_CHECKED_IN') as not_checked_in_count
      FROM events e
      LEFT JOIN participants p ON e.id = p.event_id
      GROUP BY e.id
      ORDER BY e.date DESC
    `);

    // Calculate attendance percentage for each meeting
    const meetingsWithStats = result.rows.map(meeting => {
      const totalRegistered = parseInt(meeting.participant_count);
      const checkedIn = parseInt(meeting.checked_in_count);
      const attendancePercentage = totalRegistered > 0 
        ? Math.round((checkedIn / totalRegistered) * 100) 
        : 0;
      
      return {
        ...meeting,
        attendance_percentage: attendancePercentage
      };
    });

    return NextResponse.json(meetingsWithStats);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
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
    const { name, date, venue, description, status, registrationOpen } = body;

    if (!name || !date || !venue) {
      return NextResponse.json(
        { error: 'Name, date, and venue are required' },
        { status: 400 }
      );
    }

    // If saving as ACTIVE, archive all other events
    if (status === 'ACTIVE') {
      await pool.query("UPDATE events SET status = 'ARCHIVED' WHERE status = 'ACTIVE'");
    }

    const result = await pool.query(
      `INSERT INTO events (name, date, venue, description, status, registration_open)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, date, venue, description || '', status || 'ACTIVE', registrationOpen ?? true]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}
