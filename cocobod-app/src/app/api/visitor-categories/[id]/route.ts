import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { name, description, requires_badge, requires_host, requires_pre_approval } = body;
    const { id } = await params;
    const parsedId = parseInt(id);

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE visitor_types
      SET name = ${name},
          description = ${description || null},
          requires_badge = ${requires_badge !== undefined ? requires_badge : true},
          requires_host = ${requires_host !== undefined ? requires_host : false},
          requires_pre_approval = ${requires_pre_approval !== undefined ? requires_pre_approval : false},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parsedId}
      RETURNING id, name, description, requires_badge, requires_host, requires_pre_approval
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Visitor category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating visitor category:', error);
    return NextResponse.json(
      { error: 'Failed to update visitor category' },
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
      DELETE FROM visitor_types WHERE id = ${parsedId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Visitor category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting visitor category:', error);
    return NextResponse.json(
      { error: 'Failed to delete visitor category' },
      { status: 500 }
    );
  }
}