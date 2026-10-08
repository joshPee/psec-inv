import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const staff = await sql`
      SELECT id, full_name, department, position, email, phone, is_active
      FROM staff
      WHERE is_active = true
      ORDER BY full_name ASC
    `;
    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, department, position, email, phone } = body;

    if (!full_name) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO staff (full_name, department, position, email, phone)
      VALUES (${full_name}, ${department || null}, ${position || null}, ${email || null}, ${phone || null})
      RETURNING id, full_name, department, position, email, phone, is_active
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error adding staff:', error);
    return NextResponse.json(
      { error: 'Failed to add staff' },
      { status: 500 }
    );
  }
}