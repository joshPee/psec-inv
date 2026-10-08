import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(`
      SELECT id, name, description, requires_badge, requires_host, requires_pre_approval
      FROM visitor_types
      ORDER BY name
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching visitor types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visitor types' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      requires_badge,
      requires_host,
      requires_pre_approval
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Visitor type name is required' },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO visitor_types (name, description, requires_badge, requires_host, requires_pre_approval)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      name.toUpperCase(),
      description || null,
      requires_badge !== undefined ? requires_badge : true,
      requires_host !== undefined ? requires_host : false,
      requires_pre_approval !== undefined ? requires_pre_approval : false
    ];

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating visitor type:', error);
    return NextResponse.json(
      { error: 'Failed to create visitor type' },
      { status: 500 }
    );
  }
}
