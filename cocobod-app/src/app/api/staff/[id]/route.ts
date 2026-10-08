import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { full_name, department, position, email, phone, is_active } = body;
    const { id } = await params;
    const parsedId = parseInt(id);

    if (!full_name) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE staff
      SET full_name = ${full_name},
          department = ${department || null},
          position = ${position || null},
          email = ${email || null},
          phone = ${phone || null},
          is_active = ${is_active !== undefined ? is_active : true},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parsedId}
      RETURNING id, full_name, department, position, email, phone, is_active
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json(
      { error: 'Failed to update staff member' },
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
      UPDATE staff
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parsedId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
}