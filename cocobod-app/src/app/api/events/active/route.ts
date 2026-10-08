import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCached, setCached } from '@/lib/db';

export async function GET() {
  try {
    // Check cache first
    const cacheKey = 'events:active';
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    if (!sql) {
      const fallbackData = {
        name: 'NO ACTIVE MEETING',
        date: '',
        registration_open: false
      };
      setCached(cacheKey, fallbackData);
      return NextResponse.json(fallbackData);
    }

    const result = await sql`
      SELECT name, date, registration_open 
      FROM events 
      WHERE status = 'ACTIVE' 
      LIMIT 1
    `;

    if (result.length === 0) {
      const fallbackData = {
        name: 'NO ACTIVE MEETING',
        date: '',
        registration_open: false
      };
      setCached(cacheKey, fallbackData);
      return NextResponse.json(fallbackData);
    }

    setCached(cacheKey, result[0]);
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error fetching active event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active event' },
      { status: 500 }
    );
  }
}
