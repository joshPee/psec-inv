import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const idNum = parseInt(id);

    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
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

    // Check for duplicate (excluding current record)
    const duplicateCheck = await pool.query(
      'SELECT id FROM expected_attendees WHERE LOWER(full_name) = LOWER($1) AND LOWER(organisation) = LOWER($2) AND id != $3',
      [full_name, organisation, idNum]
    );

    if (duplicateCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Expected attendee with this name and organisation already exists' },
        { status: 409 }
      );
    }

    // Update expected attendee
    await pool.query(
      `UPDATE expected_attendees 
       SET full_name = $1, email = $2, phone = $3, organisation = $4, position = $5, region = $6, tags = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8`,
      [full_name, email || null, phone || null, organisation, position || null, region || null, tags || null, idNum]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating expected attendee:', error);
    return NextResponse.json(
      { error: 'Failed to update expected attendee' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const idNum = parseInt(id);

    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    await pool.query('DELETE FROM expected_attendees WHERE id = $1', [idNum]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expected attendee:', error);
    return NextResponse.json(
      { error: 'Failed to delete expected attendee' },
      { status: 500 }
    );
  }
}
