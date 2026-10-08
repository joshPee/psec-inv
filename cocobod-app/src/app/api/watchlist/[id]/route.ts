import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { full_name, reason, description, is_active } = body;
    const { id } = await params;
    const parsedId = parseInt(id);

    if (!full_name || !reason) {
      return NextResponse.json(
        { error: 'Full name and reason are required' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE watchlist
      SET full_name = ${full_name},
          reason = ${reason},
          description = ${description || null},
          is_active = ${is_active !== undefined ? is_active : true},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parsedId}
      RETURNING id, full_name, reason, description, date_added, is_active
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Watchlist entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating watchlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to update watchlist entry' },
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
    const parsedId = parseInt(id);

    const result = await sql`
      DELETE FROM watchlist WHERE id = ${parsedId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Watchlist entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting watchlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete watchlist entry' },
      { status: 500 }
    );
  }
}