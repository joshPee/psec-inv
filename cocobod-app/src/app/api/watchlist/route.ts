import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const watchlist = await sql`
      SELECT 
        w.id,
        w.full_name,
        w.reason,
        w.description,
        w.date_added,
        w.is_active,
        u.name as added_by_name,
        u.email as added_by_email
      FROM watchlist w
      LEFT JOIN users u ON w.added_by = u.id
      ORDER BY w.date_added DESC
    `;
    return NextResponse.json(watchlist);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, reason, description, added_by } = body;

    if (!full_name || !reason || !added_by) {
      return NextResponse.json(
        { error: 'Full name, reason, and added_by are required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO watchlist (full_name, reason, description, added_by)
      VALUES (${full_name}, ${reason}, ${description || null}, ${added_by})
      RETURNING id, full_name, reason, description, date_added, is_active
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to watchlist' },
      { status: 500 }
    );
  }
}