import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    const body = await request.json();
    const {
      full_name,
      email,
      phone,
      organisation,
      position,
      region,
      tags,
      participant_status
    } = body;

    const query = `
      UPDATE participants
      SET 
        full_name = $1,
        email = $2,
        phone = $3,
        organisation = $4,
        position = $5,
        region = $6,
        tags = $7,
        participant_status = $8,
        registration_status = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;

    const values = [
      full_name,
      email || null,
      phone || null,
      organisation,
      position || null,
      region || null,
      tags || null,
      participant_status,
      participant_status === 'REGISTERED' ? 'REGISTERED' : 'PENDING',
      idNum
    ];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating participant:', error);
    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);

    const query = 'DELETE FROM participants WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [idNum]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting participant:', error);
    return NextResponse.json(
      { error: 'Failed to delete participant' },
      { status: 500 }
    );
  }
}
