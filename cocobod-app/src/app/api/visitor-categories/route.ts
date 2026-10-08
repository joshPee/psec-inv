import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const categories = await sql`
      SELECT id, name, description, requires_badge, requires_host, requires_pre_approval
      FROM visitor_types
      ORDER BY name ASC
    `;
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching visitor categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visitor categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, requires_badge, requires_host, requires_pre_approval } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO visitor_types (name, description, requires_badge, requires_host, requires_pre_approval)
      VALUES (${name}, ${description || null}, ${requires_badge !== undefined ? requires_badge : true}, ${requires_host !== undefined ? requires_host : false}, ${requires_pre_approval !== undefined ? requires_pre_approval : false})
      RETURNING id, name, description, requires_badge, requires_host, requires_pre_approval
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error adding visitor category:', error);
    return NextResponse.json(
      { error: 'Failed to add visitor category' },
      { status: 500 }
    );
  }
}